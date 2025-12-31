// ============================================================================
// ROUTES - QUIZ MONITOR BACKEND
// ============================================================================

import { Router } from 'express';
import { handleLaunch, validateToken } from '../controllers/ltiController';
import { getStats, getStudentResults, getLatestResult } from '../controllers/quizController';
import { validateLTILaunch } from '../middleware/ltiAuth';

const router = Router();

// ============================================================================
// LTI ROUTES
// ============================================================================

/**
 * LTI Launch - Punto de entrada desde Canvas
 */
router.post('/lti/launch', validateLTILaunch, handleLaunch);

/**
 * Validar token de sesión
 */
router.post('/lti/validate', validateToken);

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Obtener estadísticas de estudiante
 */
router.get('/api/stats/:userId', getStats);

/**
 * Obtener todos los resultados de un estudiante
 */
router.get('/api/results/:userId', getStudentResults);

/**
 * Obtener último resultado de un estudiante
 */
router.get('/api/results/:userId/latest', getLatestResult);

// ============================================================================
// EXPORT
// ============================================================================

export default router;