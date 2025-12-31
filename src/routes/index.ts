// ============================================================================
// RUTAS PRINCIPALES - QUIZ MONITOR
// ============================================================================

import { Router } from 'express';
import { handleLaunch, validateToken } from '../controllers/ltiController';
import { getResults, getStats } from '../controllers/quizController';
import { validateLTILaunch } from '../middleware/ltiAuth';

const router = Router();

// ============================================================================
// RUTAS LTI
// ============================================================================

/**
 * POST /lti/launch
 * Endpoint para LTI launch desde Canvas
 */
router.post('/lti/launch', validateLTILaunch, handleLaunch);

/**
 * POST /lti/validate
 * Validar token de sesión
 */
router.post('/lti/validate', validateToken);

// ============================================================================
// RUTAS API - QUIZ RESULTS
// ============================================================================

/**
 * GET /api/results/:studentId
 * Obtener resultados de quizzes de un estudiante
 */
router.get('/api/results/:studentId', getResults);

/**
 * GET /api/stats/:studentId
 * Obtener estadísticas de un estudiante
 */
router.get('/api/stats/:studentId', getStats);

// ============================================================================
// RUTA DE HEALTH CHECK
// ============================================================================

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Quiz Monitor API funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
