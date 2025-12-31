import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Importar rutas y servicios
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Importar servicios con nombres correctos
import { initializeSocket } from './services/socketService';
// canvasService se importará después de verificar que existe

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

const app: Application = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================================
// SOCKET.IO
// ============================================================================

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// CORS - Permitir todos los orígenes (Canvas puede venir de cualquier lugar)
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// ============================================================================

// Servir archivos estáticos desde public/
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

console.log('📁 Sirviendo archivos estáticos desde:', publicPath);

// ============================================================================
// RUTAS API
// ============================================================================

app.use('/', routes);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: 'Quiz Monitor Backend - Running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    socketio: 'active'
  });
});

// ============================================================================
// FALLBACK - SERVIR FRONTEND PARA CUALQUIER RUTA NO API
// ============================================================================

app.get('*', (req: Request, res: Response) => {
  // Solo servir index.html para rutas que NO sean API
  if (!req.path.startsWith('/api') && !req.path.startsWith('/lti') && !req.path.startsWith('/socket.io')) {
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ ok: false, error: 'Endpoint not found' });
  }
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use(errorHandler);

// ============================================================================
// CONEXIÓN A MONGODB
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-monitor';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB: Conectado exitosamente');
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log('📊 Base de datos:', dbName);

    // Iniciar polling después de conectar (si existe canvasService)
    if (process.env.ENABLE_POLLING === 'true') {
      try {
        // Importar dinámicamente para evitar errores si no existe
        import('./services/canvasService').then((canvasService) => {
          if (canvasService.startPolling) {
            canvasService.startPolling();
          }
        }).catch((err) => {
          console.warn('⚠️ canvasService no disponible:', err.message);
        });
      } catch (error) {
        console.warn('⚠️ No se pudo iniciar polling');
      }
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB: Error de conexión:', error);
    process.exit(1);
  });

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 QUIZ MONITOR BACKEND');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📍 Servidor:     http://localhost:${PORT}`);
  console.log(`🔗 Health:       http://localhost:${PORT}/health`);
  console.log(`🎯 LTI Launch:   http://localhost:${PORT}/lti/launch`);
  console.log(`📁 Frontend:     Sirviendo desde /public`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// ============================================================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================================================

process.on('unhandledRejection', (reason, _promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export { io };