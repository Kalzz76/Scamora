import { SENSITIVE_QUERY_PARAMS } from '../../config/scoring';

export interface SanitizeUrlResult {
  cleanUrl: string;
  hasUserInfo: boolean;
  hasCleanedParams: boolean;
}

export function sanitizeUrl(rawUrl: string): SanitizeUrlResult {
  let clean = rawUrl.trim();
  let hasUserInfo = false;
  let hasCleanedParams = false;

  const userInfoMatch = clean.match(/^(https?:\/\/)([^/@]+)@/i);
  if (userInfoMatch) {
    hasUserInfo = true;
    clean = clean.replace(/^(https?:\/\/)[^/@]+@/i, '$1');
  }

  try {
    const parsed = new URL(clean);
    let changed = false;

    for (const key of parsed.searchParams.keys()) {
      if (SENSITIVE_QUERY_PARAMS.includes(key.toLowerCase())) {
        parsed.searchParams.set(key, '[DIHAPUS]');
        changed = true;
        hasCleanedParams = true;
      }
    }

    if (changed) {
      clean = parsed.toString();
    }
  } catch {
    for (const param of SENSITIVE_QUERY_PARAMS) {
      const regex = new RegExp(`([?&]${param}=)[^&#]*`, 'gi');
      if (regex.test(clean)) {
        clean = clean.replace(regex, '$1[DIHAPUS]');
        hasCleanedParams = true;
      }
    }
  }

  return { cleanUrl: clean, hasUserInfo, hasCleanedParams };
}

