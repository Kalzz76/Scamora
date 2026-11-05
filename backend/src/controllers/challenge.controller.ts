import type { NextFunction, Request, Response } from 'express';
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

export function handleListCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const categories = listCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
}

export function handleListScenarios(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const categoryId = req.query.category_id as string | undefined;
    const difficulty = req.query.difficulty as DifficultyLevel | undefined;
    const scenarios = listScenarios(categoryId, difficulty);
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

