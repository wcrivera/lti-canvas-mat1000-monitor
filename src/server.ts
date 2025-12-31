// ============================================================================
// SERVIDOR PRINCIPAL - QUIZ MONITOR
// ============================================================================

// ⚠️ IMPORTANTE: dotenv DEBE ser lo primero
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Configuración
import { connectDatabase } from './config/database';
import { corsOptions } from './config/cors';

// Rutas
import routes from './routes';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Servicios
import { initializeSocket } from './services/socketService';
import { pollQuizSubmissions } from './services/quizMonitorService';
import { canvasService } from './services/canvasService';

// ============================================================================
// CONFIGURACIÓN EXPRESS
// ============================================================================

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Crear servidor HTTP para Socket.io
const server = createServer(app);

// ============================================================================
// MIDDLEWARE GLOBAL
// ============================================================================

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, error: 'Demasiadas peticiones' }
});
app.use('/api/', limiter);

// ============================================================================
// RUTAS
// ============================================================================

app.use(routes);

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 QUIZ MONITOR BACKEND INICIADO');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
      
      if (canvasService.isReady()) {
        console.log('✅ Canvas API: Configurado');
      } else {
        console.log('⚠️  Canvas API: NO configurado');
        console.log('💡 Verifica CANVAS_API_URL y CANVAS_ACCESS_TOKEN en .env');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });

    const pollingEnabled = process.env.ENABLE_POLLING === 'true';
    const canvasReady = canvasService.isReady();

    if (pollingEnabled && canvasReady) {
      const pollInterval = parseInt(process.env.POLL_INTERVAL_SECONDS || '30') * 1000;

      const MONITORED_QUIZZES = [
        { courseId: '90302', quizId: '187627' },
      ];

      if (MONITORED_QUIZZES.length === 0) {
        console.log('⚠️  Polling habilitado pero sin quizzes configurados');
      } else {
        setInterval(async () => {
          for (const quiz of MONITORED_QUIZZES) {
            try {
              await pollQuizSubmissions(quiz.courseId, quiz.quizId);
            } catch (error) {
              console.error(`❌ Error polling quiz ${quiz.quizId}:`, error);
            }
          }
        }, pollInterval);

        console.log(`⏱️  Polling activo cada ${pollInterval / 1000} segundos`);
      }
    }

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();