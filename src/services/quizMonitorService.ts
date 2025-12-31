// ============================================================================
// SERVICIO MONITOR DE QUIZZES - QUIZ MONITOR
// ============================================================================

import QuizResult from '../models/QuizResult';
import { canvasService } from './canvasService';
import { emitQuizResult } from './socketService';
import { CanvasQuizSubmission, QuizResultEvent } from '../types';

/**
 * Procesar un submission de Canvas
 */
const processSubmission = async (
  submission: CanvasQuizSubmission,
  courseId: string,
  quizId: string
): Promise<void> => {
  try {
    // Verificar si ya fue procesado
    const exists = await QuizResult.findOne({
      submissionId: submission.id.toString()
    });

    if (exists) {
      return; // Ya procesado
    }

    // Solo procesar si está completado
    if (submission.workflow_state !== 'complete') {
      return;
    }

    // Obtener detalles del usuario
    const user = await canvasService.getUser(submission.user_id.toString());

    // Obtener detalles del quiz
    const quiz = await canvasService.getQuiz(courseId, quizId);

    // Calcular porcentaje
    const percentageScore = quiz.points_possible > 0
      ? (submission.kept_score / quiz.points_possible) * 100
      : 0;

    // Guardar en MongoDB
    const quizResult = new QuizResult({
      studentId: submission.user_id.toString(),
      studentName: user.name,
      courseId,
      quizId,
      quizTitle: quiz.title,
      submissionId: submission.id.toString(),
      score: submission.kept_score,
      possiblePoints: quiz.points_possible,
      percentageScore,
      timeSpent: submission.time_spent || 0,
      submittedAt: new Date(submission.finished_at),
      attempt: submission.attempt || 1,
      questionsCorrect: 0, // Canvas no siempre provee esto
      questionsIncorrect: 0
    });

    await quizResult.save();

    console.log(`✅ Quiz result guardado: ${user.name} - ${quiz.title}`);

    // Emitir via WebSocket
    const event: QuizResultEvent = {
      studentId: submission.user_id.toString(),
      quizId,
      quizTitle: quiz.title,
      score: submission.kept_score,
      possiblePoints: quiz.points_possible,
      percentageScore,
      submittedAt: new Date(submission.finished_at),
      attempt: submission.attempt || 1
    };

    emitQuizResult(submission.user_id.toString(), event);

  } catch (error) {
    console.error('❌ Error procesando submission:', error);
  }
};

/**
 * Hacer polling de submissions de un quiz
 */
export const pollQuizSubmissions = async (
  courseId: string,
  quizId: string
): Promise<void> => {
  try {
    const submissions = await canvasService.getQuizSubmissions(courseId, quizId);

    console.log(`🔍 Polling quiz ${quizId}: ${submissions.length} submissions encontrados`);

    for (const submission of submissions) {
      await processSubmission(submission, courseId, quizId);
    }
  } catch (error) {
    console.error(`❌ Error en polling quiz ${quizId}:`, error);
  }
};

/**
 * Obtener resultados de un estudiante
 */
export const getStudentResults = async (
  studentId: string,
  courseId?: string
): Promise<any[]> => {
  const filter: any = { studentId };
  
  if (courseId) {
    filter.courseId = courseId;
  }

  const results = await QuizResult.find(filter)
    .sort({ submittedAt: -1 })
    .lean();

  return results;
};

/**
 * Obtener estadísticas de un estudiante
 */
export const getStudentStats = async (studentId: string) => {
  const results = await QuizResult.find({ studentId }).lean();

  const totalQuizzes = results.length;
  const completados = results.filter(r => r.percentageScore >= 60).length;
  const promedio = results.length > 0
    ? results.reduce((sum, r) => sum + r.percentageScore, 0) / results.length
    : 0;

  return {
    studentId,
    studentName: results[0]?.studentName || '',
    completados,
    enProgreso: 0,
    promedio,
    totalQuizzes
  };
};
