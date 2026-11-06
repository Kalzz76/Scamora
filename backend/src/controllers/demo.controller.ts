import type { Request, Response } from 'express';
import { getActivePresets } from './admin.controller';
import type { ApiSuccessResponse, DemoPreset } from '../types/analysis';

export function handleGetDemoExamples(
  _req: Request,
  res: Response
): void {
  const payload: ApiSuccessResponse<DemoPreset[]> = {
    success: true,
    data: getActivePresets(),
  };
  res.status(200).json(payload);
}
