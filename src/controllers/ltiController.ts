import { Request, Response } from 'express';
import LTISession from '../models/LTISession';
import { ApiResponse } from '../types';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

/**
 * Manejar LTI Launch - SIRVE FRONTEND DIRECTAMENTE
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

    // Preparar datos de usuario para inyectar
    const userData = {
      userId,
      userName,
      courseId,
      role
    };

    // Verificar si existe el archivo index.html en public/
    const publicIndexPath = path.join(__dirname, '../../public/index.html');
    
    let html: string;

    if (fs.existsSync(publicIndexPath)) {
      // Opción A: Leer archivo del build del frontend
      console.log('📄 Sirviendo frontend desde public/index.html');
      html = fs.readFileSync(publicIndexPath, 'utf8');

      // Inyectar datos de sesión ANTES de </head>
      html = html.replace(
        '</head>',
        `<script>
          window.__SESSION_TOKEN__ = "${sessionToken}";
          window.__USER_DATA__ = ${JSON.stringify(userData)};
          window.__BACKEND_URL__ = "${process.env.BACKEND_URL || 'http://localhost:3001'}";
        </script></head>`
      );
    } else {
      // Opción B: Generar HTML que carga desde lti.manthano.cl
      console.log('📄 Generando HTML que carga assets desde frontend externo');
      const frontendUrl = process.env.FRONTEND_URL || 'https://lti.manthano.cl';
      
      html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Monitor</title>
  <script>
    window.__SESSION_TOKEN__ = "${sessionToken}";
    window.__USER_DATA__ = ${JSON.stringify(userData)};
    window.__BACKEND_URL__ = "${process.env.BACKEND_URL || req.protocol + '://' + req.get('host')}";
  </script>
  <link rel="stylesheet" href="${frontendUrl}/assets/index.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${frontendUrl}/assets/index.js"></script>
</body>
</html>`;
    }

    console.log('🎨 Sirviendo HTML directamente (sin redirect)');

    // Servir HTML directamente - NO REDIRECT
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('❌ Error en LTI launch:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="es">
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>❌ Error procesando LTI launch</h1>
          <p>${error instanceof Error ? error.message : 'Error desconocido'}</p>
          <p style="color: #666; font-size: 14px;">Por favor, contacta al administrador.</p>
        </body>
      </html>
    `);
  }
};

/**
 * Validar token de sesión - AHORA ES OPCIONAL
 * (Los datos vienen inyectados en window, pero mantenemos endpoint para stats)
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