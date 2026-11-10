import crypto from 'crypto';
import { isDbConnected, query } from '../config/db';

export interface ScanHistoryRecord {
  id: string;
  userId: string;
  type: 'url' | 'chat';
  inputSummary: string;
  riskLevel: 'low' | 'review' | 'high';
  riskScore: number;
  scamType: string;
  indicatorsCount: number;
  createdAt: string;
  result?: any;
}

// In-memory fallback history (clean state, no mock data)
const inMemoryHistory: ScanHistoryRecord[] = [];

// Guest scan tracking map: guestSessionId -> scan count
const guestScanMap = new Map<string, number>();

export const historyService = {
  getGuestScanCount(sessionId: string): number {
    return guestScanMap.get(sessionId) || 0;
  },

  recordGuestScan(sessionId: string): void {
    const current = guestScanMap.get(sessionId) || 0;
    guestScanMap.set(sessionId, current + 1);
  },

  resetGuestScan(sessionId: string): void {
    guestScanMap.delete(sessionId);
  },

  async recordScan(record: Omit<ScanHistoryRecord, 'id' | 'createdAt'>): Promise<ScanHistoryRecord> {
    const newRecord: ScanHistoryRecord = {
      ...record,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    inMemoryHistory.unshift(newRecord);

    if (isDbConnected()) {
      try {
        let userUuid: string | null = null;
        if (record.userId && record.userId !== 'guest') {
          const uRes = await query('SELECT id FROM app_users WHERE username = $1 OR id::text = $1 LIMIT 1', [record.userId]);
          if (uRes && uRes.rows.length > 0) {
            userUuid = uRes.rows[0].id;
          }
        }

        await query(
          `INSERT INTO analysis_history (
            user_id, guest_session_id, analysis_type, input_target, domain, risk_score, risk_level, scam_category, confidence_score, status, indicators, ai_explanation, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            userUuid,
            record.userId === 'guest' ? 'guest-session' : null,
            record.type,
            record.inputSummary.slice(0, 500),
            record.type === 'url' ? record.inputSummary.replace(/^Analisis URL:\s*/, '') : null,
            record.riskScore,
            record.riskLevel,
            record.scamType,
            record.result?.confidence_score || 0.95,
            'complete',
            JSON.stringify(record.result?.indicators || []),
            record.result?.ai_explanation || null,
          ]
        );
      } catch (err: any) {
        console.warn('[DB] Gagal menyimpan analysis_history:', err.message);
      }
    }

    return newRecord;
  },

  async getUserHistory(userId: string): Promise<ScanHistoryRecord[]> {
    if (isDbConnected()) {
      try {
        const res = await query(
          `SELECT h.id, h.user_id, h.analysis_type, h.input_target, h.risk_level, h.risk_score, h.scam_category, h.indicators, h.created_at
           FROM analysis_history h
           LEFT JOIN app_users u ON h.user_id = u.id
           WHERE h.user_id::text = $1 OR u.username = $1
           ORDER BY h.created_at DESC
           LIMIT 50`,
          [userId]
        );
        if (res && res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            type: r.analysis_type,
            inputSummary: r.input_target,
            riskLevel: r.risk_level,
            riskScore: Number(r.risk_score),
            scamType: r.scam_category,
            indicatorsCount: Array.isArray(r.indicators) ? r.indicators.length : 0,
            createdAt: r.created_at,
          }));
        }
      } catch (err: any) {
        console.warn('[DB] Gagal membaca analysis_history, beralih ke memori:', err.message);
      }
    }

    return inMemoryHistory.filter((item) => item.userId === userId);
  },

  async getUserStats(userId: string) {
    let history = await this.getUserHistory(userId);

    const urlScans = history.filter((h) => h.type === 'url').length;
    const chatScans = history.filter((h) => h.type === 'chat').length;
    const totalScans = urlScans + chatScans;

    let challengeAttempts = 0;
    let highestScore = 0;
    let averageScore = 0;

    if (isDbConnected()) {
      try {
        const challRes = await query(
          `SELECT COUNT(*) as attempts, MAX(score) as max_score, AVG(score) as avg_score
           FROM challenge_results
           WHERE user_id = $1`,
          [userId]
        );
        if (challRes && challRes.rows[0]?.attempts > 0) {
          challengeAttempts = Number(challRes.rows[0].attempts);
          highestScore = Number(challRes.rows[0].max_score || 0);
          averageScore = Math.round(Number(challRes.rows[0].avg_score || 0));
        }
      } catch {}
    }

    return {
      totalScans,
      urlScans,
      chatScans,
      challengeAttempts,
      highestScore,
      averageScore,
      tier: 'verified',
      isUnlimited: true,
    };
  },
};

