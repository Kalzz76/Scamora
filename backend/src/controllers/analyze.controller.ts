import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import type { ApiSuccessResponse, AnalysisResult } from '../types/analysis';
import { analyzeUrl } from '../services/urlAnalyzer';
import { analyzeChat } from '../services/chatAnalyzer';
import { isDbConnected, query } from '../config/db';
import { getSupabaseClient } from '../config/supabase';
import { verifyAdminToken } from '../services/adminAuthService';
import { historyService } from '../services/historyService';

function getAuthOrGuestSession(req: Request): {
  isAuthenticated: boolean;
  username: string | null;
  guestSessionId: string | null;
} {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verification = verifyAdminToken(token);
    if (verification.valid && verification.username) {
      return {
        isAuthenticated: true,
        username: verification.username,
        guestSessionId: null,
      };
    }
  }

  const rawGuestId = req.headers['x-guest-session-id'];
  const guestSessionId = typeof rawGuestId === 'string' && rawGuestId.trim().length > 0
    ? rawGuestId.trim()
    : null;

  return {
    isAuthenticated: false,
    username: null,
    guestSessionId,
  };
}

export async function handleAnalyzeUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionInfo = getAuthOrGuestSession(req);

    // Enforce 1-scan limit for guest sessions
    if (!sessionInfo.isAuthenticated && sessionInfo.guestSessionId) {
      const count = historyService.getGuestScanCount(sessionInfo.guestSessionId);
      if (count >= 1) {
        res.status(403).json({
          success: false,
          error: {
            code: 'GUEST_LIMIT_REACHED',
            message: 'Kesempatan pemindaian gratis Anda telah digunakan. Daftar atau masuk ke akun Scamora untuk menikmati pemindaian tanpa batas.',
          },
        });
        return;
      }
    }

    const { url } = req.body as { url: string };
    const result = await analyzeUrl(url);

    let domain = url;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname;
    } catch {}

    const riskLevel = result.risk_level || 'low';
    const riskScore = result.risk_score ?? 0;
    const scamType = result.scam_type || 'unknown';

    // Successful scan: record guest scan consumption if guest
    if (!sessionInfo.isAuthenticated && sessionInfo.guestSessionId) {
      historyService.recordGuestScan(sessionInfo.guestSessionId);
    }

    // Record to unified history
    await historyService.recordScan({
      userId: sessionInfo.username || 'guest',
      type: 'url',
      inputSummary: `Analisis URL: ${domain}`,
      riskLevel,
      riskScore,
      scamType,
      indicatorsCount: result.indicators?.length || 0,
      result,
    });

    if (sessionInfo.username && isDbConnected()) {
      query(`UPDATE app_users SET scan_count = scan_count + 1 WHERE username = $1`, [sessionInfo.username]).catch(() => {});
    }

    const supabase = getSupabaseClient();
    if (supabase && !isDbConnected()) {
      try {
        Promise.resolve(
          supabase.from('analysis_stats').insert({
            analysis_type: 'url',
            risk_level: riskLevel,
            risk_score: riskScore,
            scam_type: scamType,
            indicators_count: result.indicators?.length || 0,
          })
        ).catch(() => {});
      } catch {}
    }

    if (isDbConnected()) {
      try {
        query(
          `INSERT INTO analysis_stats (analysis_type, risk_level, risk_score, scam_type, indicators_count)
           VALUES ($1, $2, $3, $4, $5)`,
          ['url', riskLevel, riskScore, scamType, result.indicators?.length || 0]
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
    const sessionInfo = getAuthOrGuestSession(req);

    // Enforce 1-scan limit for guest sessions
    if (!sessionInfo.isAuthenticated && sessionInfo.guestSessionId) {
      const count = historyService.getGuestScanCount(sessionInfo.guestSessionId);
      if (count >= 1) {
        res.status(403).json({
          success: false,
          error: {
            code: 'GUEST_LIMIT_REACHED',
            message: 'Kesempatan pemindaian gratis Anda telah digunakan. Daftar atau masuk ke akun Scamora untuk menikmati pemindaian tanpa batas.',
          },
        });
        return;
      }
    }

    const { text } = req.body as { text: string };
    const result = await analyzeChat(text);

    const preview = text.slice(0, 50).replace(/\n/g, ' ') + (text.length > 50 ? '...' : '');
    const riskLevel = result.risk_level || 'low';
    const riskScore = result.risk_score ?? 0;
    const scamType = result.scam_type || 'unknown';

    // Successful scan: record guest scan consumption if guest
    if (!sessionInfo.isAuthenticated && sessionInfo.guestSessionId) {
      historyService.recordGuestScan(sessionInfo.guestSessionId);
    }

    // Record to unified history
    await historyService.recordScan({
      userId: sessionInfo.username || 'guest',
      type: 'chat',
      inputSummary: `Analisis Pesan: ${preview}`,
      riskLevel,
      riskScore,
      scamType,
      indicatorsCount: result.indicators?.length || 0,
      result,
    });

    if (sessionInfo.username && isDbConnected()) {
      query(`UPDATE app_users SET scan_count = scan_count + 1 WHERE username = $1`, [sessionInfo.username]).catch(() => {});
    }

    const supabase = getSupabaseClient();
    if (supabase && !isDbConnected()) {
      try {
        Promise.resolve(
          supabase.from('analysis_stats').insert({
            analysis_type: 'chat',
            risk_level: riskLevel,
            risk_score: riskScore,
            scam_type: scamType,
            indicators_count: result.indicators?.length || 0,
          })
        ).catch(() => {});
      } catch {}
    }

    if (isDbConnected()) {
      try {
        query(
          `INSERT INTO analysis_stats (analysis_type, risk_level, risk_score, scam_type, indicators_count)
           VALUES ($1, $2, $3, $4, $5)`,
          ['chat', riskLevel, riskScore, scamType, result.indicators?.length || 0]
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

export async function handleGetScannedDomains(
  _req: Request,
  res: Response
): Promise<void> {
  let domains: any[] = [];
  if (isDbConnected()) {
    try {
      const resDb = await query(
        `SELECT domain, risk_score as "riskScore", risk_category as "riskCategory", scam_category as "scamCategory", check_count as "count", last_checked_at as "lastCheckedAt"
         FROM scanned_domains
         ORDER BY last_checked_at DESC
         LIMIT 20`
      );
      if (resDb && resDb.rows.length > 0) {
        domains = resDb.rows;
      }
    } catch {}
  }

  if (domains.length === 0) {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data } = await sb
          .from('scanned_domains')
          .select('domain, risk_score, risk_category, scam_category, check_count, last_checked_at')
          .order('last_checked_at', { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          domains = data.map((d: any) => ({
            domain: d.domain,
            riskScore: d.risk_score,
            riskCategory: d.risk_category,
            scamCategory: d.scam_category,
            count: d.check_count,
            lastCheckedAt: d.last_checked_at,
          }));
        }
      } catch {}
    }
  }

  res.status(200).json({ success: true, data: domains });
}

