export interface MaskPiiResult {
  maskedText: string;
  count: number;
}

export function maskPii(rawText: string): MaskPiiResult {
  let masked = rawText;
  let count = 0;

  const phoneRegex = /(?:\+62|62|08)[0-9\-\s]{8,14}/g;
  masked = masked.replace(phoneRegex, () => {
    count++;
    return '[TELEPON]';
  });

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  masked = masked.replace(emailRegex, () => {
    count++;
    return '[EMAIL]';
  });

  const nikRegex = /\b\d{16}\b/g;
  masked = masked.replace(nikRegex, () => {
    count++;
    return '[NIK]';
  });

  const bankRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{2,8}\b/g;
  masked = masked.replace(bankRegex, () => {
    count++;
    return '[REKENING]';
  });

  const secretCodeRegex = /\b(?:otp|pin|kode verifikasi|kode rahasia)\s*(?:adalah|:)?\s*([0-9]{4,6})\b/gi;
  masked = masked.replace(secretCodeRegex, (match, code) => {
    count++;
    return match.replace(code, '[KODE_RAHASIA]');
  });

  const nameRegex = /\b(?:atas nama|nama saya|nama pemilik|a\.n\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g;
  masked = masked.replace(nameRegex, (match, name) => {
    count++;
    return match.replace(name, '[NAMA]');
  });

  const addressRegex = /\b(?:jalan|jl\.|alamat|komplek|rt\/rw)\s+[^,\n.]{5,40}/gi;
  masked = masked.replace(addressRegex, () => {
    count++;
    return '[ALAMAT]';
  });

  return { maskedText: masked, count };
}

