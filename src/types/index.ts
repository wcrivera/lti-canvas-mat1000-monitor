// ============================================================================
// TIPOS COMPARTIDOS - QUIZ MONITOR
// ============================================================================

export type ID = string;

// Estados
export type AttemptStatus = 'iniciado' | 'en_progreso' | 'completado';
export type LTISessionStatus = 'active' | 'expired';

// LTI Roles
export type LTIRole = 'Instructor' | 'Learner' | 'Administrator';

/**
 * Respuesta API estándar
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Resultado de Quiz de Canvas
 */
export interface QuizResult {
  id: ID;
  studentId: string;
  studentName: string;
  courseId: string;
  quizId: string;
  quizTitle: string;
  submissionId: string;
  score: number;
  possiblePoints: number;
  percentageScore: number;
  timeSpent: number;
  submittedAt: Date;
  detectedAt: Date;
  questionsCorrect: number;
  questionsIncorrect: number;
  attempt: number;
}

/**
 * Sesión LTI
 */
export interface LTISession {
  id: ID;
  userId: string;
  userName: string;
  courseId: string;
  contextId: string;
  resourceLinkId: string;
  role: LTIRole;
  sessionToken: string;
  status: LTISessionStatus;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Datos de LTI Launch
 */
export interface LTILaunchData {
  user_id: string;
  lis_person_name_full: string;
  context_id: string;
  resource_link_id: string;
  roles: string;
  custom_canvas_course_id: string;
  custom_canvas_user_id: string;
}

/**
 * Canvas Quiz Submission (desde API)
 */
export interface CanvasQuizSubmission {
  id: number;
  quiz_id: number;
  user_id: number;
  submission_id: number;
  score: number;
  kept_score: number;
  quiz_points_possible: number;
  started_at: string;
  finished_at: string;
  workflow_state: 'untaken' | 'pending_review' | 'complete' | 'settings_only' | 'preview';
  time_spent: number;
  attempt: number;
}

/**
 * Canvas Quiz (desde API)
 */
export interface CanvasQuiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  time_limit: number | null;
  points_possible: number;
  question_count: number;
  published: boolean;
}

/**
 * Canvas User (desde API)
 */
export interface CanvasUser {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
}

/**
 * Evento Socket.io
 */
export interface QuizResultEvent {
  studentId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  possiblePoints: number;
  percentageScore: number;
  submittedAt: Date;
  attempt: number;
}

/**
 * Estadísticas de estudiante
 */
export interface StudentStats {
  studentId: string;
  studentName: string;
  completados: number;
  enProgreso: number;
  promedio: number;
  totalQuizzes: number;
}
