// ============================================================================
// QUIZ CONTROLLER - QUIZ MONITOR
// ============================================================================

import { Request, Response } from 'express';
import { getStudentStats } from '../services/quizMonitorService';
import QuizResult from '../models/QuizResult';
import { ApiResponse } from '../types';

/**
 * Obtener estadísticas de estudiante
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        ok: false,
        error: 'userId requerido'
      } as ApiResponse);
      return;
    }

    const stats = await getStudentStats(userId);

    res.json({
      ok: true,
      data: stats
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      ok: false,
      error: 'Error obteniendo estadísticas'
    } as ApiResponse);
  }
};

/**
 * Obtener resultados de quizzes de un estudiante
 */
export const getStudentResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        ok: false,
        error: 'userId requerido'
      } as ApiResponse);
      return;
    }

    const results = await QuizResult.find({ userId }).sort({ submittedAt: -1 });

    res.json({
      ok: true,
      data: results
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo resultados:', error);
    res.status(500).json({
      ok: false,
      error: 'Error obteniendo resultados'
    } as ApiResponse);
  }
};

/**
 * Obtener último resultado de un estudiante
 */
export const getLatestResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        ok: false,
        error: 'userId requerido'
      } as ApiResponse);
      return;
    }

    const result = await QuizResult.findOne({ userId }).sort({ submittedAt: -1 });

    res.json({
      ok: true,
      data: result
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo último resultado:', error);
    res.status(500).json({
      ok: false,
      error: 'Error obteniendo último resultado'
    } as ApiResponse);
  }
};