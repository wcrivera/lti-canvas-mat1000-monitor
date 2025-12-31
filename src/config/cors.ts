// ============================================================================
// CONFIGURACIÓN CORS - QUIZ MONITOR
// ============================================================================

import { CorsOptions } from 'cors';

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'https://canvas.instructure.com'
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin) || origin.includes('canvas')) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
