// ============================================================================
// LTI CONTROLLER - QUIZ MONITOR
// ============================================================================

import { Request, Response } from 'express';
import crypto from 'crypto';
import LTISession from '../models/LTISession';
import path from 'path';
import fs from 'fs';

/**
 * Manejar LTI Launch desde Canvas
 */
export const handleLaunch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      lis_person_name_full,
      roles,
      context_id,
      custom_canvas_user_id,
      custom_canvas_course_id,
      resource_link_id
    } = req.body;

    console.log('📝 Procesando LTI Launch...');
    console.log('👤 Usuario:', lis_person_name_full);
    console.log('📚 Curso:', custom_canvas_course_id || context_id);
    console.log('🆔 Canvas User ID:', custom_canvas_user_id);
    console.log('🆔 LTI User ID:', user_id);

    // Determinar rol
    const isInstructor = roles?.includes('Instructor') || roles?.includes('Administrator');
    const role = isInstructor ? 'Instructor' : 'Learner';

    // IMPORTANTE: Usar custom_canvas_user_id en vez de user_id hash
    const canvasUserId = custom_canvas_user_id || user_id;

    // Generar token de sesión
    const sessionToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Token generado:', sessionToken.substring(0, 10) + '...');

    // Crear sesión en BD con los campos correctos del modelo
    const session = new LTISession({
      sessionToken,
      userId: canvasUserId, // Usar Canvas user_id
      userName: lis_person_name_full || 'Usuario',
      contextId: context_id,
      courseId: custom_canvas_course_id || context_id,
      resourceLinkId: resource_link_id || 'default',
      role,
      status: 'active',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });

    await session.save();
    console.log('✅ Sesión LTI creada para usuario:', lis_person_name_full);

    // Verificar si existe el archivo index.html en public/
    const publicIndexPath = path.join(__dirname, '../../public/index.html');

    let html: string;

    if (fs.existsSync(publicIndexPath)) {
      // OPCIÓN A: Servir desde public/index.html
      console.log('📄 Sirviendo frontend desde public/index.html');
      
      html = fs.readFileSync(publicIndexPath, 'utf8');

      // Inyectar datos de sesión en el HTML
      html = html.replace(
        '</head>',
        `
        <script>
          window.__SESSION_TOKEN__ = "${sessionToken}";
          window.__USER_DATA__ = {
            userId: "${canvasUserId}",
            userName: "${lis_person_name_full || 'Usuario'}",
            courseId: "${custom_canvas_course_id || context_id}",
            role: "${role}"
          };
          window.__BACKEND_URL__ = "${process.env.BACKEND_URL || ''}";
        </script>
        </head>
        `
      );
    } else {
      // OPCIÓN B: Generar HTML que carga desde frontend externo
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
    window.__USER_DATA__ = {
      userId: "${canvasUserId}",
      userName: "${lis_person_name_full || 'Usuario'}",
      courseId: "${custom_canvas_course_id || context_id}",
      role: "${role}"
    };
    window.__BACKEND_URL__ = "${process.env.BACKEND_URL || ''}";
  </script>
  <script type="module" crossorigin src="${frontendUrl}/assets/index.js"></script>
  <link rel="stylesheet" crossorigin href="${frontendUrl}/assets/index.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    }

    console.log('🎨 Sirviendo HTML directamente (sin redirect)');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('❌ Error en LTI launch:', error);
    res.status(500).json({
      ok: false,
      error: 'Error procesando LTI launch'
    });
  }
};

/**
 * Validar token de sesión
 */
export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        ok: false,
        error: 'Token requerido'
      });
      return;
    }

    console.log('🔍 Validando token:', token.substring(0, 10) + '...');

    // Buscar sesión por sessionToken
    const session = await LTISession.findOne({ sessionToken: token });

    if (!session) {
      console.log('❌ Token no encontrado');
      res.status(401).json({
        ok: false,
        error: 'Token inválido'
      });
      return;
    }

    // Verificar expiración
    if (session.expiresAt < new Date()) {
      console.log('❌ Token expirado');
      res.status(401).json({
        ok: false,
        error: 'Token expirado'
      });
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
    });

  } catch (error) {
    console.error('❌ Error validando token:', error);
    res.status(500).json({
      ok: false,
      error: 'Error validando token'
    });
  }
};