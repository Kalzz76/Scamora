import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import type { ApiSuccessResponse, AnalysisResult } from '../types/analysis';
import { analyzeUrl } from '../services/urlAnalyzer';
import { analyzeChat } from '../services/chatAnalyzer';
import { isDbConnected, query } from '../config/db';

export async function handleAnalyzeUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.body as { url: string };
    const result = await analyzeUrl(url);

    if (isDbConnected()) {
      try {
        const inputHash = crypto.createHash('sha256').update(url).digest('hex');
        let domain = url;
        try {
          const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
          domain = parsed.hostname;
        } catch {}

        const riskLevel = result.risk_level || 'low';
        const riskScore = result.risk_score ?? 0;
        const scamType = result.scam_type || 'unknown';

        query(
          `INSERT INTO analysis_stats (analysis_type, risk_level, risk_score, scam_type, indicators_count)
           VALUES ($1, $2, $3, $4, $5)`,
          ['url', riskLevel, riskScore, scamType, result.indicators?.length || 0]
        ).catch(() => {});

        query(
          `INSERT INTO analysis_history (analysis_type, input_hash, sanitized_summary, risk_level, risk_score, scam_type, indicators_summary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          ['url', inputHash, `Analisis URL: ${domain}`, riskLevel, riskScore, scamType, JSON.stringify(result.indicators || [])]
        ).catch(() => {});

        if (riskLevel === 'high' || riskLevel === 'review') {
          query(
            `INSERT INTO scanned_domains (domain, risk_score, risk_category, scam_category, check_count)
             VALUES ($1, $2, $3, $4, 1)
             ON CONFLICT (domain) DO UPDATE SET
               risk_score = EXCLUDED.risk_score,
               risk_category = EXCLUDED.risk_category,
               scam_category = EXCLUDED.scam_category,
               check_count = scanned_domains.check_count + 1,
               last_checked_at = NOW()`,
            [domain, riskScore, riskLevel, scamType]
          ).catch(() => {});
        }
      } catch {}
    }

    const payload: ApiSuccessResponse<AnalysisResult> = {
      success: true,
      data: result,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function handleAnalyzeChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text } = req.body as { text: string };
    const result = await analyzeChat(text);

    if (isDbConnected()) {
      try {
        const inputHash = crypto.createHash('sha256').update(text).digest('hex');
        const preview = text.slice(0, 50).replace(/\n/g, ' ') + (text.length > 50 ? '...' : '');

        const riskLevel = result.risk_level || 'low';
        const riskScore = result.risk_score ?? 0;
        const scamType = result.scam_type || 'unknown';

        query(
          `INSERT INTO analysis_stats (analysis_type, risk_level, risk_score, scam_type, indicators_count)
           VALUES ($1, $2, $3, $4, $5)`,
          ['chat', riskLevel, riskScore, scamType, result.indicators?.length || 0]
        ).catch(() => {});

        query(
          `INSERT INTO analysis_history (analysis_type, input_hash, sanitized_summary, risk_level, risk_score, scam_type, indicators_summary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          ['chat', inputHash, `Analisis Pesan: ${preview}`, riskLevel, riskScore, scamType, JSON.stringify(result.indicators || [])]
        ).catch(() => {});
      } catch {}
    }

    const payload: ApiSuccessResponse<AnalysisResult> = {
      success: true,
      data: result,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

