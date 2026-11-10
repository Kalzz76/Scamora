/**
 * Client-Side PII (Personally Identifiable Information) Masker
 * Implements Zero-Retention & Privacy First policy for Scamora
 */

export function maskPII(text: string): { maskedText: string; maskedCount: number } {
  let masked = text;
  let count = 0;

  // Indonesian Phone (+62 or 08...)
  const phoneRegex = /(?:\+62|62|08)[0-9\-\s]{8,14}/g;
  masked = masked.replace(phoneRegex, () => {
    count++;
    return '[NOMOR_TELEPON]';
  });

  // Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  masked = masked.replace(emailRegex, () => {
    count++;
    return '[EMAIL]';
  });

  // Indonesian NIK (16 digits)
  const nikRegex = /\b\d{16}\b/g;
  masked = masked.replace(nikRegex, () => {
    count++;
    return '[NIK]';
  });

  // Bank Account Number (10 - 16 digits)
  const bankRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{2,8}\b/g;
  masked = masked.replace(bankRegex, () => {
    count++;
    return '[REKENING]';
  });

  return { maskedText: masked, maskedCount: count };
}

export function sanitizeUrl(rawUrl: string): { cleanUrl: string; hasUserInfo: boolean } {
  let clean = rawUrl.trim();
  let hasUserInfo = false;

  // Check userinfo
  const userinfoMatch = clean.match(/^(https?:\/\/)([^/@]+)@/i);
  if (userinfoMatch) {
    hasUserInfo = true;
    clean = clean.replace(/^(https?:\/\/)[^/@]+@/i, '$1');
  }

  // Mask query params
  clean = clean.replace(/([?&](token|api_key|key|otp|auth|secret|pass|password)=)[^&#]*/gi, '$1[DIHAPUS]');
  return { cleanUrl: clean, hasUserInfo };
}

