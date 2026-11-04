import { describe, expect, it } from 'vitest';
import { checkUrlStructure } from '../src/services/urlAnalyzer/structureCheck';

describe('structureCheck', () => {
  it('detects no_https when protocol is http', () => {
    const url = 'http://example.com/test';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'no_https');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(10);
  });

  it('detects userinfo_in_url when credentials were present', () => {
    const url = 'https://example.com/test';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, true, 'https://admin:pass@example.com/test');

    const match = indicators.find((i) => i.type === 'userinfo_in_url');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(20);
  });

  it('detects ip_host when host is an IP address', () => {
    const url = 'https://192.168.1.1/login';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'ip_host');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(25);
  });

  it('detects url_shortener for known shortener domains', () => {
    const url = 'https://bit.ly/claim-prize';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'url_shortener');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(15);
  });

  it('detects risky_tld for suspicious domain extensions', () => {
    const url = 'https://update-account.xyz/index';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'risky_tld');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(10);
  });

  it('detects brand_in_subdomain when brand is disguised in subdomain', () => {
    const url = 'https://bca.portal-verifikasi.com/login';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'brand_in_subdomain');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(30);
  });

  it('detects punycode_homograph when domain contains xn--', () => {
    const url = 'https://xn--bca-9oa.com/login';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'punycode_homograph');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(30);
  });

  it('detects sensitive_keywords in path', () => {
    const url = 'https://example.com/verifikasi/rekening';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    const match = indicators.find((i) => i.type === 'sensitive_keywords');
    expect(match).toBeDefined();
    expect(match?.weight).toBe(10);
  });

  it('returns no risk indicators for legitimate standard https url', () => {
    const url = 'https://www.google.com/search?q=info';
    const parsed = new URL(url);
    const indicators = checkUrlStructure(parsed, false, url);

    expect(indicators).toHaveLength(0);
  });
});

