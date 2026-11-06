import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';

describe('Guardian Challenge API (/api/v1/challenges)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1/challenges`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /categories returns 200 with list of categories', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('name');
  });

  it('GET /scenarios returns 200 with list of scenarios', async () => {
    const res = await fetch(`${baseUrl}/scenarios?category_id=kurir-apk`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].categoryId).toBe('kurir-apk');
  });

  it('POST /sessions rejects missing scenario_id with 422', async () => {
    const res = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'user_123' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /sessions creates a new session and returns starter dialogue', async () => {
    const res = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: 'scen-kurir-jnt-01',
        user_id: 'test-guardian-user',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.session).toHaveProperty('id');
    expect(body.data.session.status).toBe('in_progress');
    expect(body.data.session.messages.length).toBeGreaterThan(0);
    expect(body.data.currentDecisionNode).not.toBeNull();
    expect(body.data.currentDecisionNode.options.length).toBeGreaterThan(0);
  });

  it('POST /sessions/:id/decisions evaluates choice and progresses dialogue to completion', async () => {
    // 1. Create session
    const createRes = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: 'scen-kurir-jnt-01',
        user_id: 'test-user-decision',
      }),
    });
    const createData = await createRes.json();
    const sessionId = createData.data.session.id;

    // 2. Submit safe decision (opt_1_ask_photo)
    const decisionRes = await fetch(`${baseUrl}/sessions/${sessionId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_id: 'node_1',
        option_id: 'opt_1_ask_photo',
        flags_identified: ['rf-apk-ext'],
      }),
    });

    expect(decisionRes.status).toBe(200);
    const decisionData = await decisionRes.json();
    expect(decisionData.success).toBe(true);
    expect(decisionData.data.chosenFeedback.isSafe).toBe(true);
    expect(decisionData.data.session.history.length).toBe(1);
    expect(decisionData.data.session.currentNodeId).toBe('node_2_curious');
    expect(decisionData.data.nextDecisionNode.id).toBe('node_2_curious');

    // 3. Submit final safe decision on node_2_curious (opt_2_check_official)
    const finalRes = await fetch(`${baseUrl}/sessions/${sessionId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_id: 'node_2_curious',
        option_id: 'opt_2_check_official',
      }),
    });

    expect(finalRes.status).toBe(200);
    const finalData = await finalRes.json();
    expect(finalData.data.session.status).toBe('completed');
    expect(finalData.data.result).not.toBeNull();
    expect(finalData.data.result.score).toBeGreaterThanOrEqual(80);
    expect(finalData.data.result.safetyRating).toContain('Cyber Guardian');

    // 4. GET /sessions/:id/result retrieves final report
    const resultRes = await fetch(`${baseUrl}/sessions/${sessionId}/result`);
    expect(resultRes.status).toBe(200);
    const resultData = await resultRes.json();
    expect(resultData.success).toBe(true);
    expect(resultData.data.scenarioTitle).toBe('Paket Tertahan: Konfirmasi Alamat Kurir J&T');
  });

  it('GET /statistics returns user summary', async () => {
    const res = await fetch(`${baseUrl}/statistics?user_id=test-user-decision`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAttempts).toBeGreaterThanOrEqual(1);
  });
});
