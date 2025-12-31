import { CorsOptions } from 'cors';

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'https://canvas.instructure.com',
  'https://cursos.canvas.uc.cl',
  // Permitir cualquier subdominio de Vercel
  /vercel\.app$/,
  /\.vercel\.app$/
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si está en la lista de permitidos
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed || origin.includes(allowed);
      }
      // RegExp para dominios de Vercel
      return allowed.test(origin);
    });

    if (isAllowed || origin.includes('canvas') || origin.includes('vercel')) {
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