import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '../types/analysis';

export interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'input';
      if (!details[field]) {
        details[field] = [];
      }
      details[field].push(issue.message);
    }

    console.error(`[Validation] ${req.method} ${req.path} - Status: 422`);

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data masukan tidak memenuhi format yang valid.',
        details,
      },
    };
    res.status(422).json(payload);
    return;
  }

  const status = err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = status === 500
    ? 'Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.'
    : err.message;

  console.error(`[Error] ${req.method} ${req.path} - Status: ${status} - Code: ${code}`);

  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  };

  res.status(status).json(payload);
}
