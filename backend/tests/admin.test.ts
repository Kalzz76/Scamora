import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';

describe('Admin API Contract Tests (/api/v1/admin)', () => {
  let server: Server;
  let baseUrl: string;
  let adminToken = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1/admin`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('rejects unauthorized access to /stats with 401', async () => {
    const res = await fetch(`${baseUrl}/stats`);
    expect(res.status).toBe(401);
    const json = (await res.json()) as { success: boolean; error: { code: string } };
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects login with invalid credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
    const json = (await res.json()) as { success: boolean; error: { code: string } };
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /login succeeds with valid credentials and returns auth token', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: { token: string; user: { username: string; role: string } };
    };
    expect(json.success).toBe(true);
    expect(typeof json.data.token).toBe('string');
    expect(json.data.user.role).toBe('admin');
    adminToken = json.data.token;
  });

  it('GET /auth/verify confirms valid admin token', async () => {
    const res = await fetch(`${baseUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { authenticated: boolean } };
    expect(json.success).toBe(true);
    expect(json.data.authenticated).toBe(true);
  });

  it('GET /api/v1/admin/stats returns 200 with system telemetry when authorized', async () => {
    const res = await fetch(`${baseUrl}/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: Record<string, unknown> };
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('totalScans');
    expect(json.data).toHaveProperty('threatRatioPercent');
  });

  it('GET and PUT /api/v1/admin/ai-config updates configuration when authorized', async () => {
    const getRes = await fetch(`${baseUrl}/ai-config`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as { success: boolean; data: Record<string, unknown> };
    expect(getJson.success).toBe(true);
    expect(getJson.data).toHaveProperty('activeProvider');

    const putRes = await fetch(`${baseUrl}/ai-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ temperature: 0.2 }),
    });
    expect(putRes.status).toBe(200);
    const putJson = (await putRes.json()) as { success: boolean; data: { temperature: number } };
    expect(putJson.data.temperature).toBe(0.2);
  });

  it('GET and PUT /api/v1/admin/crawler-config updates crawler parameters when authorized', async () => {
    const getRes = await fetch(`${baseUrl}/crawler-config`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as { success: boolean; data: Record<string, unknown> };
    expect(getJson.data).toHaveProperty('timeoutMs');

    const putRes = await fetch(`${baseUrl}/crawler-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ maxBytesKb: 1024 }),
    });
    expect(putRes.status).toBe(200);
    const putJson = (await putRes.json()) as { success: boolean; data: { maxBytesKb: number } };
    expect(putJson.data.maxBytesKb).toBe(1024);
  });

  it('Demo Presets CRUD workflow with authorized token', async () => {
    const listRes = await fetch(`${baseUrl}/presets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(listRes.status).toBe(200);
    const listJson = (await listRes.json()) as { success: boolean; data: unknown[] };
    expect(Array.isArray(listJson.data)).toBe(true);

    const newPreset = {
      id: 'test-preset-unit',
      type: 'url',
      title: 'Unit Test Phishing Scenario',
      subtitle: 'Subdomain testing',
      content: 'http://unit-test-phishing.example.com',
      expectedCategory: 'high',
      expectedScore: 90,
      scamType: 'phishing',
      tags: ['Test', 'Unit'],
      isActive: true,
    };
    const createRes = await fetch(`${baseUrl}/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newPreset),
    });
    expect(createRes.status).toBe(201);
    const createJson = (await createRes.json()) as { success: boolean; data: { id: string } };
    expect(createJson.data.id).toBe('test-preset-unit');

    const updateRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ title: 'Updated Unit Test Scenario', isActive: false }),
    });
    expect(updateRes.status).toBe(200);
    const updateJson = (await updateRes.json()) as { success: boolean; data: { title: string; isActive: boolean } };
    expect(updateJson.data.title).toBe('Updated Unit Test Scenario');
    expect(updateJson.data.isActive).toBe(false);

    const delRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(delRes.status).toBe(200);
    const delJson = (await delRes.json()) as { success: boolean };
    expect(delJson.success).toBe(true);

    const delAgainRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(delAgainRes.status).toBe(404);
  });
});
