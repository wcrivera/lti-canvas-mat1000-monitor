// ============================================================================
// SERVICIO SOCKET.IO - QUIZ MONITOR
// ============================================================================

import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { QuizResultEvent } from '../types';

let io: SocketServer | null = null;

/**
 * Inicializar Socket.io
 */
export const initializeSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket conectado: ${socket.id}`);

    // Autenticación del estudiante
    socket.on('authenticate', (studentId: string) => {
      if (!studentId || typeof studentId !== 'string') {
        console.warn(`⚠️  Intento de autenticación inválido: ${socket.id}`);
        socket.disconnect();
        return;
      }

      socket.data.studentId = studentId;
      socket.join(`student-${studentId}`);
      console.log(`✅ Estudiante autenticado: ${studentId}`);

      // Confirmar autenticación
      socket.emit('authenticated', { studentId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket desconectado: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Error en socket ${socket.id}:`, error);
    });
  });

  console.log('✅ Socket.io inicializado');
  return io;
};

/**
 * Emitir resultado de quiz a un estudiante específico
 */
export const emitQuizResult = (studentId: string, result: QuizResultEvent): void => {
  if (!io) {
    console.error('❌ Socket.io no inicializado');
    return;
  }

  const room = `student-${studentId}`;
  io.to(room).emit('quiz-result-ready', result);

  console.log(`📤 Resultado emitido a estudiante ${studentId}:`, {
    quizTitle: result.quizTitle,
    score: result.score,
    percentage: result.percentageScore.toFixed(1)
  });
};

/**
 * Obtener instancia de Socket.io
 */
export const getSocketInstance = (): SocketServer | null => io;
