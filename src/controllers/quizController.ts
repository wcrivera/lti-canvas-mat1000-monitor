// ============================================================================
// CONTROLADOR QUIZ - QUIZ MONITOR
// ============================================================================

import { Request, Response } from 'express';
import { getStudentResults, getStudentStats } from '../services/quizMonitorService';
import { ApiResponse } from '../types';

/**
 * Obtener resultados de un estudiante
 */
export const getResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    if (!studentId) {
      res.status(400).json({
        ok: false,
        error: 'studentId es requerido'
      } as ApiResponse);
      return;
    }

    const results = await getStudentResults(
      studentId,
      courseId as string | undefined
    );

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
 * Obtener estadísticas de un estudiante
 */
export const getStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      res.status(400).json({
        ok: false,
        error: 'studentId es requerido'
      } as ApiResponse);
      return;
    }

    const stats = await getStudentStats(studentId);

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
