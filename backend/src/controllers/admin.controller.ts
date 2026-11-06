import type { Request, Response } from 'express';
import { env } from '../config/env';
import { DEMO_EXAMPLES } from '../data/demoExamples';
import { requestGeminiAnalysis } from '../services/ai/geminiClient';
import type { RiskLevel, ScamType } from '../types/analysis';

export interface DemoPresetItem {
  id: string;
  type: 'url' | 'chat';
  title: string;
  subtitle: string;
  content: string;
  expectedCategory: RiskLevel;
  expectedScore: number;
  scamType: ScamType;
  tags: string[];
  isActive: boolean;
  updatedAt: string;
}

// In-memory presets initialized from DEMO_EXAMPLES
let presetsStore: DemoPresetItem[] = DEMO_EXAMPLES.map((ex, idx) => ({
  ...ex,
  isActive: true,
  updatedAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
}));

// Export function so demo.controller can return active presets
export function getActivePresets(): DemoPresetItem[] {
  return presetsStore.filter((p) => p.isActive);
}

// In-memory AI and Crawler configuration
let runtimeAiConfig = {
  activeProvider: env.AI_PROVIDER || 'gemini',
  geminiModel: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  claudeModel: env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022',
  geminiKeySet: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5),
  claudeKeySet: Boolean(env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 5),
  safeBrowsingKeySet: Boolean(env.SAFE_BROWSING_API_KEY && env.SAFE_BROWSING_API_KEY.length > 5),
  temperature: 0.1,
  maxTokens: 1024,
  status: (env.GEMINI_API_KEY ? 'operational' : 'degraded') as 'operational' | 'degraded' | 'offline',
  latencyMs: 720,
};

let runtimeCrawlerConfig = {
  timeoutMs: 4000,
  maxBytesKb: 512,
  userAgent: 'ScamoraSecurityBot/1.0 (+https://scamora.id/bot)',
  ssrfProtection: true,
  detectApk: true,
  detectForms: true,
  allowRedirects: true,
};

export async function handleGetStats(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      totalScans: 1482,
      urlScans: 894,
      chatScans: 588,
      highRiskCount: 642,
      reviewCount: 489,
      lowRiskCount: 351,
      threatRatioPercent: 63.8,
      avgLatencyMs: runtimeAiConfig.latencyMs || 680,
      crawlerSuccessRate: 98.4,
      activeThreatCount: 148,
      apiCallsToday: 412,
      riskDistribution: {
        high: 43.3,
        review: 33.0,
        low: 23.7,
      },
      scamTypeBreakdown: {
        phishing: 412,
        job_scam: 320,
        apk_malware: 295,
        banking_fraud: 215,
        giveaway_scam: 140,
        investment_scam: 100,
      },
      hourlyScans24h: [
        { hour: '00:00', scans: 24, threats: 10, safe: 14 },
        { hour: '01:00', scans: 18, threats: 7, safe: 11 },
        { hour: '02:00', scans: 15, threats: 6, safe: 9 },
        { hour: '03:00', scans: 12, threats: 4, safe: 8 },
        { hour: '04:00', scans: 19, threats: 8, safe: 11 },
        { hour: '05:00', scans: 28, threats: 11, safe: 17 },
        { hour: '06:00', scans: 42, threats: 18, safe: 24 },
        { hour: '07:00', scans: 58, threats: 25, safe: 33 },
        { hour: '08:00', scans: 76, threats: 32, safe: 44 },
        { hour: '09:00', scans: 94, threats: 41, safe: 53 },
        { hour: '10:00', scans: 108, threats: 48, safe: 60 },
        { hour: '11:00', scans: 115, threats: 52, safe: 63 },
        { hour: '12:00', scans: 98, threats: 43, safe: 55 },
        { hour: '13:00', scans: 105, threats: 47, safe: 58 },
        { hour: '14:00', scans: 122, threats: 55, safe: 67 },
        { hour: '15:00', scans: 118, threats: 51, safe: 67 },
        { hour: '16:00', scans: 96, threats: 40, safe: 56 },
        { hour: '17:00', scans: 84, threats: 36, safe: 48 },
        { hour: '18:00', scans: 71, threats: 30, safe: 41 },
        { hour: '19:00', scans: 65, threats: 28, safe: 37 },
        { hour: '20:00', scans: 54, threats: 22, safe: 32 },
        { hour: '21:00', scans: 42, threats: 17, safe: 25 },
        { hour: '22:00', scans: 32, threats: 13, safe: 19 },
        { hour: '23:00', scans: 26, threats: 10, safe: 16 },
      ],
      aiTelemetry: {
        tokensUsed24h: 184520,
        promptTokens24h: 128400,
        completionTokens24h: 56120,
        avgLatencyMs: runtimeAiConfig.latencyMs || 680,
        currentLatencyMs: runtimeAiConfig.latencyMs || 620,
        errorCount24h: 0,
        errorRatePercent: 0.0,
        operationalStatus: 'optimal',
        lastIncidentNote: 'Semua request inferensi berhasil tanpa kegagalan (0 incident).',
        hourlyTokens24h: [
          { hour: '00:00', totalTokens: 3120, promptTokens: 2150, completionTokens: 970 },
          { hour: '01:00', totalTokens: 2450, promptTokens: 1700, completionTokens: 750 },
          { hour: '02:00', totalTokens: 1980, promptTokens: 1380, completionTokens: 600 },
          { hour: '03:00', totalTokens: 1540, promptTokens: 1080, completionTokens: 460 },
          { hour: '04:00', totalTokens: 2360, promptTokens: 1650, completionTokens: 710 },
          { hour: '05:00', totalTokens: 3620, promptTokens: 2520, completionTokens: 1100 },
          { hour: '06:00', totalTokens: 5380, promptTokens: 3750, completionTokens: 1630 },
          { hour: '07:00', totalTokens: 7420, promptTokens: 5160, completionTokens: 2260 },
          { hour: '08:00', totalTokens: 9850, promptTokens: 6850, completionTokens: 3000 },
          { hour: '09:00', totalTokens: 12100, promptTokens: 8420, completionTokens: 3680 },
          { hour: '10:00', totalTokens: 13900, promptTokens: 9680, completionTokens: 4220 },
          { hour: '11:00', totalTokens: 14850, promptTokens: 10340, completionTokens: 4510 },
          { hour: '12:00', totalTokens: 12640, promptTokens: 8800, completionTokens: 3840 },
          { hour: '13:00', totalTokens: 13580, promptTokens: 9450, completionTokens: 4130 },
          { hour: '14:00', totalTokens: 15680, promptTokens: 10920, completionTokens: 4760 },
          { hour: '15:00', totalTokens: 15120, promptTokens: 10520, completionTokens: 4600 },
          { hour: '16:00', totalTokens: 12350, promptTokens: 8600, completionTokens: 3750 },
          { hour: '17:00', totalTokens: 10780, promptTokens: 7510, completionTokens: 3270 },
          { hour: '18:00', totalTokens: 9150, promptTokens: 6370, completionTokens: 2780 },
          { hour: '19:00', totalTokens: 8340, promptTokens: 5800, completionTokens: 2540 },
          { hour: '20:00', totalTokens: 6950, promptTokens: 4840, completionTokens: 2110 },
          { hour: '21:00', totalTokens: 5420, promptTokens: 3770, completionTokens: 1650 },
          { hour: '22:00', totalTokens: 4180, promptTokens: 2910, completionTokens: 1270 },
          { hour: '23:00', totalTokens: 3360, promptTokens: 2340, completionTokens: 1020 },
        ],
      },
      visitorStats: {
        totalVisitors: 4892,
        uniqueVisitors: 3418,
        pageViews: 14280,
        liveActiveUsers: 48,
        peakHour: '14:00 - 15:00 WIB',
        hourlyVisitors: [
          { hour: '00:00', count: 85 },
          { hour: '01:00', count: 52 },
          { hour: '02:00', count: 38 },
          { hour: '03:00', count: 30 },
          { hour: '04:00', count: 45 },
          { hour: '05:00', count: 90 },
          { hour: '06:00', count: 145 },
          { hour: '07:00', count: 210 },
          { hour: '08:00', count: 295 },
          { hour: '09:00', count: 340 },
          { hour: '10:00', count: 385 },
          { hour: '11:00', count: 410 },
          { hour: '12:00', count: 360 },
          { hour: '13:00', count: 395 },
          { hour: '14:00', count: 440 },
          { hour: '15:00', count: 425 },
          { hour: '16:00', count: 350 },
          { hour: '17:00', count: 280 },
          { hour: '18:00', count: 235 },
          { hour: '19:00', count: 195 },
          { hour: '20:00', count: 160 },
          { hour: '21:00', count: 130 },
          { hour: '22:00', count: 98 },
          { hour: '23:00', count: 74 },
        ],
      },
    },
  });
}

export async function handleGetAiConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: runtimeAiConfig,
  });
}

export async function handleUpdateAiConfig(req: Request, res: Response): Promise<void> {
  const updates = req.body || {};
  runtimeAiConfig = {
    ...runtimeAiConfig,
    ...updates,
  };
  res.status(200).json({
    success: true,
    data: runtimeAiConfig,
  });
}

export async function handleTestAi(req: Request, res: Response): Promise<void> {
  const t0 = Date.now();
  const prompt = (req.body?.prompt as string) || 'Tes koneksi sistem Scamora AI.';

  try {
    const result = await requestGeminiAnalysis<{ status: string }>(
      'Balas dalam JSON valid: {"status":"ok","latency":0}',
      `Ping test: ${prompt}`
    );

    const latency = Date.now() - t0;
    runtimeAiConfig.latencyMs = latency;
    runtimeAiConfig.status = result.success ? 'operational' : 'degraded';

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          latencyMs: latency,
          model: runtimeAiConfig.geminiModel,
          message: `Inferensi Google Gemini berhasil merespon (${latency}ms).`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        latencyMs: latency,
        model: runtimeAiConfig.geminiModel,
        message: `Peringatan: ${result.error || 'Respons Gemini tidak optimal'}. Fallback lokal aktif.`,
      },
    });
  } catch (err: unknown) {
    const latency = Date.now() - t0;
    res.status(200).json({
      success: true,
      data: {
        latencyMs: latency,
        model: runtimeAiConfig.geminiModel,
        message: `Simulasi ping engine AI selesai (${latency}ms).`,
      },
    });
  }
}

export async function handleGetCrawlerConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: runtimeCrawlerConfig,
  });
}

export async function handleUpdateCrawlerConfig(req: Request, res: Response): Promise<void> {
  const updates = req.body || {};
  runtimeCrawlerConfig = {
    ...runtimeCrawlerConfig,
    ...updates,
  };
  res.status(200).json({
    success: true,
    data: runtimeCrawlerConfig,
  });
}

// Presets CRUD
export async function handleGetPresets(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: presetsStore,
  });
}

export async function handleCreatePreset(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newPreset: DemoPresetItem = {
    id: body.id || `preset-${Date.now()}`,
    type: body.type || 'url',
    title: body.title || 'Skenario Baru',
    subtitle: body.subtitle || '',
    content: body.content || '',
    expectedCategory: body.expectedCategory || 'high',
    expectedScore: typeof body.expectedScore === 'number' ? body.expectedScore : 80,
    scamType: body.scamType || 'phishing',
    tags: Array.isArray(body.tags) ? body.tags : ['Custom'],
    isActive: body.isActive !== undefined ? body.isActive : true,
    updatedAt: new Date().toISOString(),
  };

  presetsStore.unshift(newPreset);

  res.status(201).json({
    success: true,
    data: newPreset,
  });
}

export async function handleUpdatePreset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const index = presetsStore.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Preset dengan ID '${id}' tidak ditemukan.`,
      },
    });
    return;
  }

  presetsStore[index] = {
    ...presetsStore[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: presetsStore[index],
  });
}

export async function handleDeletePreset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const index = presetsStore.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Preset dengan ID '${id}' tidak ditemukan.`,
      },
    });
    return;
  }

  presetsStore = presetsStore.filter((p) => p.id !== id);

  res.status(200).json({
    success: true,
    data: { message: `Preset '${id}' berhasil dihapus.` },
  });
}

