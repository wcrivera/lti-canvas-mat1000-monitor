// ============================================================================
// CONFIGURACIÓN BASE DE DATOS - QUIZ MONITOR
// ============================================================================

import mongoose from 'mongoose';

/**
 * Conectar a MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-monitor';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📦 Base de datos: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Manejar eventos de conexión
 */
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Error en conexión MongoDB:', error);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB desconectado por cierre de aplicación');
  process.exit(0);
});
