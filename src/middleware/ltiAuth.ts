import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

/**
 * Generar firma OAuth 1.0 manualmente
 */
function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string
): string {
  // Ordenar parámetros
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Base string
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Firma HMAC-SHA1
  const key = `${encodeURIComponent(consumerSecret)}&`;
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(baseString);
  
  return hmac.digest('base64');
}

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

  // Verificar consumer key
  if (req.body.oauth_consumer_key !== consumerKey) {
    console.error('❌ Consumer key no coincide');
    res.status(401).json({ ok: false, error: 'Consumer key inválido' });
    return;
  }

  // Construir URL completa
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const path = req.originalUrl || req.url;
  const fullUrl = `${protocol}://${host}${path}`;

  console.log('📍 URL para validación:', fullUrl);
  console.log('📍 Consumer Key:', req.body.oauth_consumer_key);

  // Extraer firma enviada por Canvas
  const receivedSignature = req.body.oauth_signature;
  
  if (!receivedSignature) {
    console.error('❌ No se recibió oauth_signature');
    res.status(401).json({ ok: false, error: 'Firma OAuth faltante' });
    return;
  }

  // Crear copia de parámetros sin la firma
  const params: Record<string, string> = {};
  Object.keys(req.body).forEach(key => {
    if (key !== 'oauth_signature') {
      params[key] = req.body[key];
    }
  });

  // Generar firma esperada
  const expectedSignature = generateSignature(
    'POST',
    fullUrl,
    params,
    consumerSecret
  );

  console.log('🔐 Firma recibida:', receivedSignature.substring(0, 20) + '...');
  console.log('🔐 Firma esperada:', expectedSignature.substring(0, 20) + '...');

  // Comparar firmas
  if (receivedSignature !== expectedSignature) {
    console.error('❌ Firmas no coinciden');
    res.status(401).json({ ok: false, error: 'Firma OAuth inválida' });
    return;
  }

  console.log('✅ LTI launch válido - Firma verificada');
  next();
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