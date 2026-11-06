import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AnalysisResult,
  DemoPreset,
} from '../src/types/analysis';

describe('API Contract Tests (/api/v1)', { timeout: 60000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
        resolve();
      });
    });
  }, 30000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }, 30000);

  it('GET /demo-examples returns 200 with list of presets', async () => {
    const res = await fetch(`${baseUrl}/demo-examples`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as ApiSuccessResponse<DemoPreset[]>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(4);
    expect(body.data[0]?.id).toBeDefined();
  });

  it('POST /analyze/url succeeds and returns full AnalysisResult envelope', async () => {
    const res = await fetch(`${baseUrl}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://bca.secure-update-login.xyz/verifikasi?token=secret123',
        privacy_consent: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiSuccessResponse<AnalysisResult>;

    expect(body.success).toBe(true);
    expect(body.data.analysis_type).toBe('url');
    expect(body.data.input_sanitized).not.toContain('secret123');
    expect(body.data.risk_score).toBeGreaterThan(0);
    expect(body.data.indicators.length).toBeGreaterThan(0);
    expect(body.data.checks.length).toBeGreaterThanOrEqual(5);
    expect(body.data.timestamp).toBeDefined();
  }, 30000);

  it('POST /analyze/url rejects missing privacy_consent with 422 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://google.com',
        privacy_consent: false,
      }),
    });

    expect(res.status).toBe(422);
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /analyze/chat succeeds and returns masked input in AnalysisResult', async () => {
    const res = await fetch(`${baseUrl}/analyze/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Halo kak, kami dari Shopee. Anda dapat komisi 5jt per hari dengan transfer uang muka 100rb ke rekening 1234567890 hubungi 08123456789 sekarang!',
        privacy_consent: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiSuccessResponse<AnalysisResult>;
    expect(body.success).toBe(true);
    expect(body.data.analysis_type).toBe('chat');
    expect(body.data.input_sanitized).toContain('[TELEPON]');
    expect(body.data.input_sanitized).toContain('[REKENING]');
    expect(body.data.risk_score).toBeGreaterThanOrEqual(30);
    expect(body.data.indicators.some((i) => i.type === 'advance_fee')).toBe(true);
  }, 40000);

  it('POST /analyze/chat rejects text shorter than 10 characters with 422', async () => {
    const res = await fetch(`${baseUrl}/analyze/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'halo',
        privacy_consent: true,
      }),
    });

    expect(res.status).toBe(422);
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
