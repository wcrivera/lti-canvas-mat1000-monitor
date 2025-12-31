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

  // LOG DETALLADO
  console.log('═══════════════════════════════════════');
  console.log('🔍 LTI LAUNCH DEBUG');
  console.log('═══════════════════════════════════════');
  console.log('Consumer Key ESPERADO:', consumerKey);
  console.log('Consumer Key RECIBIDO:', req.body.oauth_consumer_key);
  console.log('Secret configurado:', consumerSecret ? 'SÍ (oculto)' : 'NO');
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Body keys:', Object.keys(req.body));
  console.log('═══════════════════════════════════════');

  if (!consumerKey || !consumerSecret) {
    console.error('❌ LTI_CONSUMER_KEY o LTI_CONSUMER_SECRET no configurados');
    res.status(500).json({ ok: false, error: 'LTI no configurado' });
    return;
  }

  // Verificación extra antes de validar
  if (req.body.oauth_consumer_key !== consumerKey) {
    console.error('❌ CONSUMER KEY NO COINCIDE:');
    console.error('   Esperado:', JSON.stringify(consumerKey));
    console.error('   Recibido:', JSON.stringify(req.body.oauth_consumer_key));
    console.error('   ¿Son idénticos?', req.body.oauth_consumer_key === consumerKey);
    res.status(401).json({ ok: false, error: 'Consumer Key no coincide' });
    return;
  }

  // @ts-ignore
  const provider = new Provider(consumerKey, consumerSecret);

  // @ts-ignore
  provider.valid_request(req, (err, isValid) => {
    if (err || !isValid) {
      console.error('❌ LTI launch inválido:', err);
      if (err) {
        console.error('   Tipo de error:', err.name);
        console.error('   Mensaje:', err.message);
      }
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