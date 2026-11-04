import type { NextFunction, Request, Response } from 'express';
import type { ApiSuccessResponse, AnalysisResult } from '../types/analysis';
import { analyzeUrl } from '../services/urlAnalyzer';
import { analyzeChat } from '../services/chatAnalyzer';

export async function handleAnalyzeUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.body as { url: string };
    const result = await analyzeUrl(url);

    const payload: ApiSuccessResponse<AnalysisResult> = {
      success: true,
      data: result,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function handleAnalyzeChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text } = req.body as { text: string };
    const result = await analyzeChat(text);

    const payload: ApiSuccessResponse<AnalysisResult> = {
      success: true,
      data: result,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

