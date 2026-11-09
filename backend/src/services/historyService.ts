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

// In-memory fallback history with realistic sample data for seed users
const inMemoryHistory: ScanHistoryRecord[] = [
  {
    id: 'hist-1',
    userId: 'budi_santoso',
    type: 'url',
    inputSummary: 'Analisis URL: bca.secure-update-login.xyz',
    riskLevel: 'high',
    riskScore: 92,
    scamType: 'phishing',
    indicatorsCount: 4,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'hist-2',
    userId: 'budi_santoso',
    type: 'chat',
    inputSummary: 'Analisis Pesan: Halo kak, ada tugas like video YouTube komisi 2jt...',
    riskLevel: 'high',
    riskScore: 85,
    scamType: 'job_scam',
    indicatorsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'hist-3',
    userId: 'budi_santoso',
    type: 'url',
    inputSummary: 'Analisis URL: tokopedia.com/official-store',
    riskLevel: 'low',
    riskScore: 0,
    scamType: 'unknown',
    indicatorsCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

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
        const inputHash = crypto.createHash('sha256').update(record.inputSummary).digest('hex');
        await query(
          `INSERT INTO analysis_history (user_id, analysis_type, input_hash, sanitized_summary, risk_level, risk_score, scam_type, indicators_summary, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            record.userId,
            record.type,
            inputHash,
            record.inputSummary.slice(0, 250),
            record.riskLevel,
            record.riskScore,
            record.scamType,
            JSON.stringify(record.result?.indicators || []),
          ]
        );
      } catch (err) {
        console.warn('[DB] Gagal menyimpan analysis_history:', err);
      }
    }

    return newRecord;
  },

  async getUserHistory(userId: string): Promise<ScanHistoryRecord[]> {
    if (isDbConnected()) {
      try {
        const res = await query(
          `SELECT id, user_id, analysis_type, sanitized_summary, risk_level, risk_score, scam_type, indicators_summary, created_at
           FROM analysis_history
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 50`,
          [userId]
        );
        if (res && res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            type: r.analysis_type,
            inputSummary: r.sanitized_summary,
            riskLevel: r.risk_level,
            riskScore: Number(r.risk_score),
            scamType: r.scam_type,
            indicatorsCount: Array.isArray(r.indicators_summary) ? r.indicators_summary.length : 0,
            createdAt: r.created_at,
          }));
        }
      } catch (err) {
        console.warn('[DB] Gagal membaca analysis_history, beralih ke memori:', err);
      }
    }

    return inMemoryHistory.filter((item) => item.userId === userId);
  },

  async getUserStats(userId: string) {
    let history = await this.getUserHistory(userId);

    const urlScans = history.filter((h) => h.type === 'url').length;
    const chatScans = history.filter((h) => h.type === 'chat').length;
    const totalScans = urlScans + chatScans;

    let challengeAttempts = 3;
    let highestScore = 95;
    let averageScore = 88;

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

