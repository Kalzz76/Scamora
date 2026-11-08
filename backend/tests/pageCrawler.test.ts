import { describe, expect, it } from 'vitest';
import { extractCleanText, isPrivateOrReservedHost } from '../src/services/urlAnalyzer/pageCrawler';
import { scanCrawlHeuristics } from '../src/services/urlAnalyzer/crawlerHeuristics';
import type { CrawlResult } from '../src/services/urlAnalyzer/pageCrawler';

describe('pageCrawler & SSRF Protection', () => {
  it('blocks private and loopback IPs', () => {
    expect(isPrivateOrReservedHost('localhost')).toBe(true);
    expect(isPrivateOrReservedHost('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedHost('10.0.0.5')).toBe(true);
    expect(isPrivateOrReservedHost('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedHost('172.20.0.1')).toBe(true);
    expect(isPrivateOrReservedHost('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedHost('server.local')).toBe(true);
  });

  it('allows public domain names', () => {
    expect(isPrivateOrReservedHost('google.com')).toBe(false);
    expect(isPrivateOrReservedHost('bca.co.id')).toBe(false);
    expect(isPrivateOrReservedHost('phishing-fake.xyz')).toBe(false);
  });

  it('extracts clean text and strips scripts/styles', () => {
    const rawHtml = `
      <html>
        <head><title>Test Page</title><style>.hidden { display: none; }</style></head>
        <body>
          <script>alert("hacked");</script>
          <h1>Selamat Datang</h1>
          <p>Silakan masukkan PIN Anda &amp; nomor rekening.</p>
        </body>
      </html>
    `;
    const clean = extractCleanText(rawHtml);
    expect(clean).toContain('Selamat Datang');
    expect(clean).toContain('Silakan masukkan PIN Anda & nomor rekening.');
    expect(clean).not.toContain('alert');
    expect(clean).not.toContain('display: none');
  });
});

describe('crawlerHeuristics', () => {
  it('detects credential harvesting forms on untrusted hosts', () => {
    const parsed = new URL('https://bca-login-fake.xyz/login');
    const mockCrawl: CrawlResult = {
      status: 'completed',
      extractedText: 'Login Internet Banking BCA Masukkan Password Anda',
      title: 'KlikBCA Individual Login',
      hasPasswordInput: true,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: false,
      isDirectApkDownload: false,
      detectedForms: [
        {
          action: 'https://attacker-server.com/collect',
          method: 'POST',
          hasPasswordInput: true,
          hasSensitiveFinancialInput: false,
          inputNames: ['username', 'password'],
        },
      ],
      externalFormTargets: ['https://attacker-server.com/collect'],
      apkLinks: [],
      note: 'Perayapan berhasil',
    };

    const indicators = scanCrawlHeuristics(parsed, mockCrawl);
    const types = indicators.map((i) => i.type);

    expect(types).toContain('credential_harvesting_form');
    expect(types).toContain('brand_impersonation_content');
    expect(types).toContain('external_form_action');
  });

  it('detects APK malware download lures', () => {
    const parsed = new URL('https://paket-kurir-update.top/download');
    const mockCrawl: CrawlResult = {
      status: 'completed',
      extractedText: 'Silakan unduh aplikasi surat undangan pernikahan dan resi pengiriman paket J&T Express.',
      title: 'Unduh Surat Undangan Pernikahan',
      hasPasswordInput: false,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: true,
      isDirectApkDownload: false,
      detectedForms: [],
      externalFormTargets: [],
      apkLinks: ['https://paket-kurir-update.top/undangan.apk'],
      note: 'Perayapan berhasil',
    };

    const indicators = scanCrawlHeuristics(parsed, mockCrawl);
    const types = indicators.map((i) => i.type);

    expect(types).toContain('malicious_apk_download');
  });

  it('detects fake giveaway and prize claim content', () => {
    const parsed = new URL('https://hadiah-gebyar-shopee.xyz/klaim');
    const mockCrawl: CrawlResult = {
      status: 'completed',
      extractedText: 'Selamat anda memenangkan undian berhadiah Rp 100.000.000 dari Shopee Indonesia.',
      title: 'Gebyar Undian Berhadiah Shopee 2026',
      hasPasswordInput: false,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: false,
      isDirectApkDownload: false,
      detectedForms: [],
      externalFormTargets: [],
      apkLinks: [],
      note: 'Perayapan berhasil',
    };

    const indicators = scanCrawlHeuristics(parsed, mockCrawl);
    const types = indicators.map((i) => i.type);

    expect(types).toContain('fake_giveaway_content');
    expect(types).toContain('brand_impersonation_content');
  });
});

