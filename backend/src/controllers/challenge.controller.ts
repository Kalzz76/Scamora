import type { NextFunction, Request, Response } from 'express';
import { isDbConnected, query } from '../config/db';
import { getSupabaseClient } from '../config/supabase';
import {
  abandonSession,
  createSession,
  generateNewScenario,
  getCurrentDecisionNode,
  getSession,
  getSessionResult,
  getUserStatistics,
  listCategories,
  listScenarios,
  listUserHistory,
  submitDecision,
} from '../services/challengeService';
import type { DifficultyLevel } from '../types/challenge';

export async function handleListCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await listCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleListScenarios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoryId = req.query.category_id as string | undefined;
    const difficulty = req.query.difficulty as DifficultyLevel | undefined;
    const scenarios = await listScenarios(categoryId, difficulty);
    res.status(200).json({
      success: true,
      data: scenarios,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateScenario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category_id, difficulty, topic_prompt } = req.body as {
      category_id: string;
      difficulty: DifficultyLevel;
      topic_prompt?: string;
    };
    const scenario = await generateNewScenario(category_id, difficulty, topic_prompt);
    res.status(200).json({
      success: true,
      data: scenario,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { scenario_id, user_id } = req.body as {
      scenario_id: string;
      user_id: string;
    };
    const session = await createSession(scenario_id, user_id);
    const currentNode = getCurrentDecisionNode(session);

    res.status(201).json({
      success: true,
      data: {
        session,
        currentDecisionNode: currentNode,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function handleGetSession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = req.params.id as string;
    const session = getSession(id);
    if (!session) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Sesi latihan tidak ditemukan.',
        },
      });
      return;
    }

    const currentNode = getCurrentDecisionNode(session);

    res.status(200).json({
      success: true,
      data: {
        session,
        currentDecisionNode: currentNode,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function handleSubmitDecision(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { node_id, option_id, flags_identified } = req.body as {
      node_id: string;
      option_id: string;
      flags_identified?: string[];
    };

    const outcome = await submitDecision(
      id,
      node_id,
      option_id,
      flags_identified || []
    );
    const nextDecisionNode = getCurrentDecisionNode(outcome.session);

    res.status(200).json({
      success: true,
      data: {
        session: outcome.session,
        result: outcome.result,
        chosenFeedback: outcome.chosenFeedback,
        nextDecisionNode,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function handleAbandonSession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = req.params.id as string;
    const success = abandonSession(id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Sesi latihan tidak ditemukan.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: 'Sesi latihan telah dibatalkan.' },
    });
  } catch (err) {
    next(err);
  }
}

export function handleGetSessionResult(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = req.params.id as string;
    const result = getSessionResult(id);
    if (!result) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Laporan hasil sesi belum tersedia atau sesi belum selesai.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export function handleListHistory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const userId = (req.query.user_id as string) || 'anonymous';
    const history = listUserHistory(userId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

export function handleGetStatistics(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const userId = (req.query.user_id as string) || 'anonymous';
    const stats = getUserStatistics(userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetQuizQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const difficulty = req.query.difficulty as string | undefined;
    if (isDbConnected()) {
      let q = `SELECT * FROM challenge_questions WHERE is_active = true`;
      const params: any[] = [];
      if (difficulty) {
        q += ` AND difficulty = $1`;
        params.push(difficulty);
      }
      q += ` ORDER BY order_index ASC, created_at ASC`;
      const dbRes = await query(q, params);
      if (dbRes && dbRes.rows.length > 0) {
        res.status(200).json({ success: true, data: dbRes.rows });
        return;
      }
    }

    const sb = getSupabaseClient();
    if (sb) {
      let queryBuilder = sb.from('challenge_questions').select('*').eq('is_active', true);
      if (difficulty) queryBuilder = queryBuilder.eq('difficulty', difficulty);
      const { data } = await queryBuilder.order('order_index', { ascending: true });
      if (data && data.length > 0) {
        res.status(200).json({ success: true, data });
        return;
      }
    }

    res.status(200).json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
}

