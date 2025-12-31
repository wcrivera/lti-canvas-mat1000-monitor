// ============================================================================
// MIDDLEWARE ERROR HANDLER - QUIZ MONITOR
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * Manejador global de errores
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err);

  const isDev = process.env.NODE_ENV === 'development';

  const response: ApiResponse = {
    ok: false,
    error: isDev ? err.message : 'Error interno del servidor'
  };

  res.status(500).json(response);
};

/**
 * Manejador de rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`
  });
};