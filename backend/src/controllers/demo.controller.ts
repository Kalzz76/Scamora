import type { Request, Response } from 'express';
import { isDbConnected, query } from '../config/db';
import { getSupabaseClient } from '../config/supabase';
import { getActivePresets } from './admin.controller';
import type { ApiSuccessResponse, DemoPreset } from '../types/analysis';

export async function handleGetDemoExamples(
  _req: Request,
  res: Response
): Promise<void> {
  let presets: DemoPreset[] = [];

  if (isDbConnected()) {
    try {
      const resDb = await query('SELECT * FROM demo_presets WHERE is_active = true ORDER BY created_at ASC');
      if (resDb && resDb.rows.length > 0) {
        presets = resDb.rows.map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          subtitle: r.subtitle || '',
          content: r.content,
          expectedCategory: r.expected_category,
          expectedScore: r.expected_score,
          scamType: r.scam_type,
          tags: r.tags || [],
        }));
      }
    } catch {}
  }

  if (presets.length === 0) {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data } = await sb.from('demo_presets').select('*').eq('is_active', true);
        if (data && data.length > 0) {
          presets = data.map((r: any) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            subtitle: r.subtitle || '',
            content: r.content,
            expectedCategory: r.expected_category,
            expectedScore: r.expected_score,
            scamType: r.scam_type,
            tags: r.tags || [],
          }));
        }
      } catch {}
    }
  }

  if (presets.length === 0) {
    presets = getActivePresets();
  }

  const payload: ApiSuccessResponse<DemoPreset[]> = {
    success: true,
    data: presets,
  };
  res.status(200).json(payload);
}
