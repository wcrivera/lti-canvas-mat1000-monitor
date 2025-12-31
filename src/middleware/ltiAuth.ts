import { Request, Response, NextFunction } from 'express';

// @ts-ignore
import { Provider } from 'ims-lti';

export const validateLTILaunch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const consumerKey = process.env.LTI_CONSUMER_KEY;
  const consumerSecret = process.env.LTI_CONSUMER_SECRET;

  console.log('🔍 LTI Launch recibido');
  
  if (!consumerKey || !consumerSecret) {
    console.error('❌ LTI no configurado');
    res.status(500).json({ ok: false, error: 'LTI no configurado' });
    return;
  }

  // IMPORTANTE: Forzar HTTPS para Heroku
  // Heroku usa proxy y Canvas espera HTTPS
  const originalUrl = req.originalUrl || req.url;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const fullUrl = `${protocol}://${host}${originalUrl}`;

  console.log('📍 URL completa:', fullUrl);
  console.log('📍 Protocol:', protocol);

  // @ts-ignore
  const provider = new Provider(consumerKey, consumerSecret);

  // Configurar provider para usar URL correcta
  (provider as any).body = req.body;
  (provider as any).protocol = protocol;
  (provider as any).hostname = host;
  (provider as any).path = originalUrl;

  // @ts-ignore
  provider.valid_request(req, fullUrl, (err, isValid) => {
    if (err || !isValid) {
      console.error('❌ LTI launch inválido:', err?.message || 'Invalid');
      res.status(401).json({ ok: false, error: 'Launch LTI inválido' });
      return;
    }

    console.log('✅ LTI launch válido');
    next();
  });
};

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ ok: false, error: 'Token no proporcionado' });
    return;
  }
  next();
};