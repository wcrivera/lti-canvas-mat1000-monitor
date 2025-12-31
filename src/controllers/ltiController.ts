import { Request, Response } from 'express';
import LTISession from '../models/LTISession';
import { ApiResponse } from '../types';
import crypto from 'crypto';

/**
 * Manejar LTI Launch
 */
export const handleLaunch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const launchData: any = req.body;

    console.log('📝 Procesando LTI Launch...');
    console.log('👤 Usuario:', launchData.lis_person_name_full);
    console.log('📚 Curso:', launchData.custom_canvas_course_id);

    // Extraer datos del launch
    const userId = launchData.user_id || launchData.custom_canvas_user_id;
    const userName = launchData.lis_person_name_full || 'Usuario';
    const courseId = launchData.custom_canvas_course_id || launchData.context_id;
    const contextId = launchData.context_id;
    const resourceLinkId = launchData.resource_link_id;
    const roles = launchData.roles || '';

    // Determinar rol
    const role = roles.includes('Instructor') ? 'Instructor' : 'Learner';

    // Generar token de sesión seguro
    const sessionToken = crypto.randomBytes(32).toString('hex');

    console.log('🔑 Token generado:', sessionToken.substring(0, 10) + '...');

    // Crear sesión LTI
    const session = new LTISession({
      userId,
      userName,
      courseId,
      contextId,
      resourceLinkId,
      role,
      sessionToken,
      status: 'active',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });

    await session.save();

    console.log('✅ Sesión LTI creada para usuario:', userName);

    // Construir URL de redirect al frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}?token=${sessionToken}`;

    console.log('🔀 Redirigiendo a:', redirectUrl);

    // Redirigir al frontend
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Error en LTI launch:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error procesando LTI launch</h1>
          <p>${error instanceof Error ? error.message : 'Error desconocido'}</p>
        </body>
      </html>
    `);
  }
};

/**
 * Validar token de sesión
 */
export const validateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    console.log('🔍 Validando token:', token?.substring(0, 10) + '...');

    if (!token) {
      res.status(400).json({
        ok: false,
        error: 'Token requerido'
      } as ApiResponse);
      return;
    }

    const session = await LTISession.findOne({
      sessionToken: token,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      console.error('❌ Token no encontrado o expirado');
      res.status(401).json({
        ok: false,
        error: 'Token inválido o expirado'
      } as ApiResponse);
      return;
    }

    console.log('✅ Token válido para usuario:', session.userName);

    res.json({
      ok: true,
      data: {
        userId: session.userId,
        userName: session.userName,
        courseId: session.courseId,
        role: session.role
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error validando token:', error);
    res.status(500).json({
      ok: false,
      error: 'Error validando token'
    } as ApiResponse);
  }
};