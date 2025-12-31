// ============================================================================
// SERVIDOR PRINCIPAL - QUIZ MONITOR
// ============================================================================

import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

import { connectDatabase } from './config/database';
import { corsOptions } from './config/cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeSocket } from './services/socketService';
import { pollQuizSubmissions } from './services/quizMonitorService';
import { canvasService } from './services/canvasService';

const app: Application = express();
const PORT = process.env.PORT || 3001;

const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, error: 'Demasiadas peticiones' }
});
app.use('/api/', limiter);

// Rutas
app.use(routes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Inicialización
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
      }
      
      console.log('═══════════════════════════════════════════════════════');
    });

    const pollingEnabled = process.env.ENABLE_POLLING === 'true';
    const canvasReady = canvasService.isReady();

    if (pollingEnabled && canvasReady) {
      const pollInterval = parseInt(process.env.POLL_INTERVAL_SECONDS || '30') * 1000;

      const MONITORED_QUIZZES = (process.env.MONITORED_QUIZZES || '').split(',')
        .filter(q => q.trim())
        .map(q => {
          const [courseId, quizId] = q.split(':');
          return { courseId, quizId };
        });

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