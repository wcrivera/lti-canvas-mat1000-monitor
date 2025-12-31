// ============================================================================
// TYPES - QUIZ MONITOR BACKEND - COMPLETO
// ============================================================================

/**
 * Respuesta API genérica
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Datos de sesión del usuario
 */
export interface SessionData {
  userId: string;
  userName: string;
  courseId: string;
  role: 'Instructor' | 'Learner';
}

/**
 * Estadísticas de estudiante
 */
export interface StatsData {
  completados: number;
  enProgreso: number;
  totalQuizzes: number;
  promedio: number;
}

/**
 * Resultado de quiz
 */
export interface QuizResultData {
  quizTitle: string;
  score: number;
  possiblePoints: number;
  percentageScore: number;
  submittedAt: Date;
  attempt: number;
}

/**
 * Roles LTI
 */
export type LTIRole = 'Instructor' | 'Learner' | 'TeachingAssistant' | 'ContentDeveloper' | 'Administrator';

/**
 * Estado de sesión LTI
 */
export type LTISessionStatus = 'active' | 'expired' | 'invalid';

/**
 * Submission de Canvas API
 */
export interface QuizSubmission {
  id: number;
  quiz_id: number;
  user_id: number;
  submission_id: number;
  started_at: string | null;
  finished_at: string | null;
  end_at: string | null;
  attempt: number;
  extra_attempts: number | null;
  extra_time: number | null;
  manually_unlocked: boolean | null;
  time_spent: number | null;
  score: number | null;
  score_before_regrade: number | null;
  kept_score: number | null;
  fudge_points: number | null;
  has_seen_results: boolean | null;
  workflow_state: 'untaken' | 'pending_review' | 'complete' | 'settings_only' | 'preview';
  quiz_points_possible: number;
  validation_token: string | null;
  submitted_at: string | null;
}

/**
 * Alias para compatibilidad
 */
export type CanvasQuizSubmission = QuizSubmission;

/**
 * Usuario de Canvas
 */
export interface CanvasUser {
  id: number;
  name: string;
  created_at: string;
  sortable_name: string;
  short_name: string;
  sis_user_id: string | null;
  integration_id: string | null;
  login_id: string;
  avatar_url: string | null;
  enrollments?: any[];
  email: string;
  locale: string | null;
  effective_locale: string;
  last_login: string | null;
  time_zone: string;
}

/**
 * Quiz de Canvas API
 */
export interface CanvasQuiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  assignment_group_id: number | null;
  time_limit: number | null;
  shuffle_answers: boolean;
  hide_results: string | null;
  show_correct_answers: boolean;
  show_correct_answers_last_attempt: boolean;
  show_correct_answers_at: string | null;
  hide_correct_answers_at: string | null;
  one_time_results: boolean;
  scoring_policy: string;
  allowed_attempts: number;
  one_question_at_a_time: boolean;
  question_count: number;
  points_possible: number;
  cant_go_back: boolean;
  access_code: string | null;
  ip_filter: string | null;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
  published: boolean;
  unpublishable: boolean;
  locked_for_user: boolean;
  lock_info: any;
  lock_explanation: string | null;
  speedgrader_url: string;
  quiz_extensions_url: string;
  permissions: {
    read_statistics: boolean;
    manage: boolean;
    read: boolean;
    update: boolean;
    create: boolean;
    submit: boolean;
    preview: boolean;
    delete: boolean;
    grade: boolean;
    review_grades: boolean;
    view_answer_audits: boolean;
  };
  all_dates: any[];
  version_number: number;
  question_types: string[];
  anonymous_submissions: boolean;
}

/**
 * Datos LTI Launch
 */
export interface LTILaunchData {
  user_id: string;
  lis_person_name_full: string;
  lis_person_name_given: string;
  lis_person_name_family: string;
  lis_person_contact_email_primary: string;
  roles: string;
  context_id: string;
  context_label: string;
  context_title: string;
  custom_canvas_course_id: string;
  custom_canvas_user_id: string;
  resource_link_id: string;
  resource_link_title: string;
  oauth_consumer_key: string;
  oauth_signature_method: string;
  oauth_timestamp: string;
  oauth_nonce: string;
  oauth_signature: string;
}

/**
 * Configuración de quiz monitoreado
 */
export interface MonitoredQuiz {
  courseId: string;
  quizId: string;
}