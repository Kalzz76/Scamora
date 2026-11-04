import { describe, expect, it } from 'vitest';
import { maskPii } from '../src/services/chatAnalyzer/maskPii';

describe('maskPii', () => {
  it('masks Indonesian phone numbers with [TELEPON]', () => {
    const text = 'Silakan hubungi saya di 081234567890 atau +6281987654321 sekarang.';
    const result = maskPii(text);

    expect(result.maskedText).not.toContain('081234567890');
    expect(result.maskedText).not.toContain('+6281987654321');
    expect(result.maskedText).toContain('[TELEPON]');
    expect(result.count).toBeGreaterThanOrEqual(2);
  });

  it('masks email addresses with [EMAIL]', () => {
    const text = 'Kirimkan berkas ke admin-resmi@domain-palsu.com secepatnya.';
    const result = maskPii(text);

    expect(result.maskedText).not.toContain('admin-resmi@domain-palsu.com');
    expect(result.maskedText).toContain('[EMAIL]');
    expect(result.count).toBe(1);
  });

  it('masks 16-digit NIK with [NIK]', () => {
    const text = 'Nomor KTP saya adalah 3201012304950001 harap diproses.';
    const result = maskPii(text);

    expect(result.maskedText).not.toContain('3201012304950001');
    expect(result.maskedText).toContain('[NIK]');
    expect(result.count).toBe(1);
  });

  it('masks bank account numbers with [REKENING]', () => {
    const text = 'Transfer ke rekening BCA 1234 5678 9012 segera.';
    const result = maskPii(text);

    expect(result.maskedText).not.toContain('1234 5678 9012');
    expect(result.maskedText).toContain('[REKENING]');
    expect(result.count).toBe(1);
  });

  it('masks secret OTP/PIN codes with [KODE_RAHASIA]', () => {
    const text = 'Jangan beritahu siapa pun, kode OTP adalah 482910 untuk login.';
    const result = maskPii(text);

    expect(result.maskedText).not.toContain('482910');
    expect(result.maskedText).toContain('[KODE_RAHASIA]');
    expect(result.count).toBe(1);
  });
});

