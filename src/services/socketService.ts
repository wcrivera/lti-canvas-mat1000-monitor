// ============================================================================
// SOCKET.IO SERVICE - QUIZ MONITOR
// ============================================================================

import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

/**
 * Inicializar Socket.io - SINGLETON
 */
export const initializeSocket = (socketServer: SocketIOServer): void => {
  // Evitar inicializar dos veces
  if (io) {
    console.log('⚠️  Socket.io ya inicializado, omitiendo...');
    return;
  }

  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Socket conectado:', socket.id);

    // Autenticar estudiante
    socket.on('authenticate', (data: { studentId: string }) => {
      const { studentId } = data;
      
      // Unirse a sala específica del estudiante
      socket.join(`student:${studentId}`);
      console.log(`✅ Estudiante autenticado: ${studentId}`);
      
      // Confirmar autenticación
      socket.emit('authenticated', { studentId });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket desconectado:', socket.id);
    });
  });

  console.log('✅ Socket.io inicializado');
};

/**
 * Obtener instancia de Socket.io
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado');
  }
  return io;
};

/**
 * Emitir evento a estudiante específico
 */
export const emitToStudent = (studentId: string, event: string, data: any): void => {
  if (!io) {
    console.error('❌ Socket.io no inicializado');
    return;
  }

  io.to(`student:${studentId}`).emit(event, data);
  console.log(`📤 Evento emitido a estudiante ${studentId}:`, event);
};

/**
 * Emitir evento a todos los clientes
 */
export const emitToAll = (event: string, data: any): void => {
  if (!io) {
    console.error('❌ Socket.io no inicializado');
    return;
  }

  io.emit(event, data);
  console.log(`📤 Evento emitido a todos:`, event);
};