// ============================================================================
// MIDDLEWARE LTI AUTHENTICATION - QUIZ MONITOR
// ============================================================================

import { Request, Response, NextFunction } from 'express';

// @ts-ignore
import { Provider } from 'ims-lti';

/**
 * Validar LTI Launch usando OAuth 1.0
 */
export const validateLTILaunch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const consumerKey = process.env.LTI_CONSUMER_KEY;
  const consumerSecret = process.env.LTI_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    res.status(500).json({
      ok: false,
      error: 'LTI no configurado correctamente'
    });
    return;
  }

  // @ts-ignore
  const provider = new Provider(consumerKey, consumerSecret);

  // @ts-ignore
  provider.valid_request(req, (err, isValid) => {
    if (err || !isValid) {
      console.error('❌ LTI launch inválido:', err);
      res.status(401).json({
        ok: false,
        error: 'Launch LTI no válido'
      });
      return;
    }

    console.log('✅ LTI launch válido');
    next();
  });
};

/**
 * Validar sesión LTI por token
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Token no proporcionado'
    });
    return;
  }

  next();
};