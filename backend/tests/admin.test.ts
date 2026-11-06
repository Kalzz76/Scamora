import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';

describe('Admin API Contract Tests (/api/v1/admin)', () => {
  let server: Server;
  let baseUrl: string;

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

  it('GET /api/v1/admin/stats returns 200 with system telemetry', async () => {
    const res = await fetch(`${baseUrl}/stats`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: Record<string, unknown> };
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('totalScans');
    expect(json.data).toHaveProperty('threatRatioPercent');
  });

  it('GET and PUT /api/v1/admin/ai-config updates configuration', async () => {
    const getRes = await fetch(`${baseUrl}/ai-config`);
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as { success: boolean; data: Record<string, unknown> };
    expect(getJson.success).toBe(true);
    expect(getJson.data).toHaveProperty('activeProvider');

    const putRes = await fetch(`${baseUrl}/ai-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: 0.2 }),
    });
    expect(putRes.status).toBe(200);
    const putJson = (await putRes.json()) as { success: boolean; data: { temperature: number } };
    expect(putJson.data.temperature).toBe(0.2);
  });

  it('GET and PUT /api/v1/admin/crawler-config updates crawler parameters', async () => {
    const getRes = await fetch(`${baseUrl}/crawler-config`);
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as { success: boolean; data: Record<string, unknown> };
    expect(getJson.data).toHaveProperty('timeoutMs');

    const putRes = await fetch(`${baseUrl}/crawler-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxBytesKb: 1024 }),
    });
    expect(putRes.status).toBe(200);
    const putJson = (await putRes.json()) as { success: boolean; data: { maxBytesKb: number } };
    expect(putJson.data.maxBytesKb).toBe(1024);
  });

  it('Demo Presets CRUD workflow (GET, POST, PUT, DELETE)', async () => {
    // 1. GET initial presets
    const listRes = await fetch(`${baseUrl}/presets`);
    expect(listRes.status).toBe(200);
    const listJson = (await listRes.json()) as { success: boolean; data: unknown[] };
    expect(Array.isArray(listJson.data)).toBe(true);

    // 2. POST create custom preset
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPreset),
    });
    expect(createRes.status).toBe(201);
    const createJson = (await createRes.json()) as { success: boolean; data: { id: string } };
    expect(createJson.data.id).toBe('test-preset-unit');

    // 3. PUT update preset
    const updateRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Unit Test Scenario', isActive: false }),
    });
    expect(updateRes.status).toBe(200);
    const updateJson = (await updateRes.json()) as { success: boolean; data: { title: string; isActive: boolean } };
    expect(updateJson.data.title).toBe('Updated Unit Test Scenario');
    expect(updateJson.data.isActive).toBe(false);

    // 4. DELETE preset
    const delRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'DELETE',
    });
    expect(delRes.status).toBe(200);
    const delJson = (await delRes.json()) as { success: boolean };
    expect(delJson.success).toBe(true);

    // 5. Verify not found on second delete
    const delAgainRes = await fetch(`${baseUrl}/presets/test-preset-unit`, {
      method: 'DELETE',
    });
    expect(delAgainRes.status).toBe(404);
  });
});
