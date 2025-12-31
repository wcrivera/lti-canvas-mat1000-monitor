// ============================================================================
// QUIZ MONITOR SERVICE - CANVAS API POLLING
// ============================================================================

import QuizResult from '../models/QuizResult';
import { emitToStudent } from './socketService';
import { QuizSubmission } from '../types';

/**
 * Procesar submission de Canvas y guardar en BD
 */
export const processQuizSubmission = async (
  submission: QuizSubmission,
  quizTitle: string,
  courseId: string
): Promise<void> => {
  try {
    // Verificar si ya existe
    const existing = await QuizResult.findOne({
      userId: submission.user_id.toString(),
      quizId: submission.quiz_id.toString(),
      attempt: submission.attempt
    });

    if (existing) {
      console.log(`⚠️  Submission ya existe: Usuario ${submission.user_id} - Intento ${submission.attempt}`);
      return;
    }

    // Crear nuevo resultado
    const quizResult = new QuizResult({
      userId: submission.user_id.toString(),
      quizId: submission.quiz_id.toString(),
      quizTitle,
      score: submission.score || 0,
      possiblePoints: submission.quiz_points_possible || 0,
      percentageScore: ((submission.score || 0) / (submission.quiz_points_possible || 1)) * 100,
      submittedAt: new Date(submission.finished_at || submission.submitted_at || Date.now()),
      attempt: submission.attempt || 1,
      workflowState: submission.workflow_state,
      
      // Campos adicionales requeridos por el modelo
      submissionId: submission.submission_id?.toString() || submission.id.toString(),
      courseId: courseId,
      studentId: submission.user_id.toString(),
      studentName: 'Canvas User' // Placeholder - se puede mejorar obteniendo del API
    });

    await quizResult.save();

    console.log(`✅ Quiz result guardado: ${quizTitle} - Usuario ${submission.user_id}`);

    // Emitir a Socket.io
    emitToStudent(
      submission.user_id.toString(),
      'quiz-result-ready',
      {
        quizTitle,
        score: submission.score || 0,
        possiblePoints: submission.quiz_points_possible || 0,
        percentageScore: quizResult.percentageScore,
        submittedAt: quizResult.submittedAt,
        attempt: submission.attempt || 1
      }
    );

    console.log(`📤 Resultado emitido a estudiante ${submission.user_id}`);

  } catch (error: any) {
    // Si es error de duplicado (E11000), ignorar silenciosamente
    if (error.code === 11000) {
      console.log(`⚠️  Submission duplicada ignorada: Usuario ${submission.user_id} - Intento ${submission.attempt}`);
      return;
    }
    
    console.error('❌ Error procesando submission:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de un estudiante
 */
export const getStudentStats = async (userId: string) => {
  try {
    const results = await QuizResult.find({ userId });

    const completados = results.length;
    const totalPoints = results.reduce((sum, r) => sum + r.score, 0);
    const totalPossible = results.reduce((sum, r) => sum + r.possiblePoints, 0);
    const promedio = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;

    return {
      completados,
      enProgreso: 0, // Por implementar
      totalQuizzes: completados, // Por implementar con Canvas API
      promedio
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      completados: 0,
      enProgreso: 0,
      totalQuizzes: 0,
      promedio: 0
    };
  }
};