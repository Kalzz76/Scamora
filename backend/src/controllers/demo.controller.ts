import type { Request, Response } from 'express';
import { DEMO_EXAMPLES } from '../data/demoExamples';
import type { ApiSuccessResponse, DemoPreset } from '../types/analysis';

export function handleGetDemoExamples(
  _req: Request,
  res: Response
): void {
  const payload: ApiSuccessResponse<DemoPreset[]> = {
    success: true,
    data: DEMO_EXAMPLES,
  };
  res.status(200).json(payload);
}

