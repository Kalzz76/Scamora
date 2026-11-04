import crypto from 'crypto';
import { env } from '../../config/env';
import type { CheckStatusValue } from '../../types/analysis';

export interface SafeBrowsingResult {
  status: CheckStatusValue;
  isThreat: boolean;
  note: string;
}

const cache = new Map<string, { result: SafeBrowsingResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export async function checkSafeBrowsing(cleanUrl: string): Promise<SafeBrowsingResult> {
  const urlHash = hashUrl(cleanUrl);
  const cached = cache.get(urlHash);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  if (!env.SAFE_BROWSING_API_KEY) {
    const fallback: SafeBrowsingResult = {
      status: 'failed',
      isThreat: false,
      note: 'Pemeriksaan Google Safe Browsing dilewati karena API key belum dikonfigurasi.',
    };
    return fallback;
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.SAFE_BROWSING_API_KEY}`;
  const requestBody = {
    client: {
      clientId: 'scamora-ai',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: cleanUrl }],
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const failedResult: SafeBrowsingResult = {
        status: 'failed',
        isThreat: false,
        note: `Pemeriksaan Google Safe Browsing merespons dengan kode ${res.status}.`,
      };
      return failedResult;
    }

    const data = (await res.json()) as { matches?: unknown[] };
    const isThreat = Boolean(data.matches && data.matches.length > 0);

    const result: SafeBrowsingResult = {
      status: 'completed',
      isThreat,
      note: isThreat
        ? 'Tautan terdaftar aktif pada basis data ancaman Google Safe Browsing.'
        : 'Tidak ditemukan pada daftar ancaman yang diperiksa.',
    };

    cache.set(urlHash, { result, timestamp: Date.now() });
    return result;
  } catch (err: unknown) {
    const failedResult: SafeBrowsingResult = {
      status: 'failed',
      isThreat: false,
      note: 'Pemeriksaan reputasi Google Safe Browsing mengalami batas waktu (timeout) atau gangguan jaringan.',
    };
    return failedResult;
  }
}

