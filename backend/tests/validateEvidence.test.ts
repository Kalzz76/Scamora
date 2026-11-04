import { describe, expect, it } from 'vitest';
import {
  isEvidenceInText,
  normalizeWhitespace,
} from '../src/services/chatAnalyzer/validateEvidence';

describe('validateEvidence', () => {
  it('normalizes multiple spaces and trims text', () => {
    const raw = '   Halo    rekan   semua   \n  ';
    expect(normalizeWhitespace(raw)).toBe('halo rekan semua');
  });

  it('validates that authentic quote exists in source text regardless of spacing', () => {
    const source = 'Selamat Anda memenangkan undian 100 juta rupiah segera transfer biaya pendaftaran';
    const quote = 'transfer   biaya   pendaftaran';

    expect(isEvidenceInText(quote, source)).toBe(true);
  });

  it('rejects quotes that are not in the source text', () => {
    const source = 'Selamat siang, ada paket yang harus dikirimkan.';
    const fakeQuote = 'segera kirimkan kode OTP';

    expect(isEvidenceInText(fakeQuote, source)).toBe(false);
  });

  it('returns false for empty quote or empty source', () => {
    expect(isEvidenceInText('', 'teks masukan')).toBe(false);
    expect(isEvidenceInText('kutipan', '')).toBe(false);
  });
});

