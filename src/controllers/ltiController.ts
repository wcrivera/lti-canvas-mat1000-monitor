// ============================================================================
// CONTROLADOR LTI - QUIZ MONITOR
// ============================================================================

import { Request, Response } from 'express';
import LTISession from '../models/LTISession';
import { LTILaunchData, ApiResponse } from '../types';
import crypto from 'crypto';

/**
 * Manejar LTI Launch
 */
export const handleLaunch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const launchData: LTILaunchData = req.body;

    // Extraer datos del launch
    const {
      user_id,
      lis_person_name_full,
      context_id,
      resource_link_id,
      roles,
      custom_canvas_course_id
    } = launchData;

    // Determinar rol
    const role = roles.includes('Instructor') ? 'Instructor' : 'Learner';

    // Generar token de sesión
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Crear sesión LTI
    const session = new LTISession({
      userId: user_id,
      userName: lis_person_name_full,
      courseId: custom_canvas_course_id,
      contextId: context_id,
      resourceLinkId: resource_link_id,
      role,
      sessionToken,
      status: 'active',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });

    await session.save();

    console.log(`✅ Sesión LTI creada para usuario: ${lis_person_name_full}`);

    // Redirigir al frontend con token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?token=${sessionToken}`);

  } catch (error) {
    console.error('❌ Error en LTI launch:', error);
    res.status(500).send('Error procesando LTI launch');
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
      res.status(401).json({
        ok: false,
        error: 'Token inválido o expirado'
      } as ApiResponse);
      return;
    }

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
