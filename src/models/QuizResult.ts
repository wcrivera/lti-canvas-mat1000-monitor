// ============================================================================
// MODELO QUIZ RESULT - QUIZ MONITOR
// ============================================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  studentId: string;
  studentName: string;
  courseId: string;
  quizId: string;
  quizTitle: string;
  submissionId: string;
  score: number;
  possiblePoints: number;
  percentageScore: number;
  timeSpent: number;
  submittedAt: Date;
  detectedAt: Date;
  questionsCorrect: number;
  questionsIncorrect: number;
  attempt: number;
}

const QuizResultSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    courseId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    quizTitle: { type: String, required: true },
    submissionId: { type: String, required: true, unique: true },
    score: { type: Number, required: true, min: 0 },
    possiblePoints: { type: Number, required: true, min: 0 },
    percentageScore: { type: Number, required: true, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0, min: 0 },
    submittedAt: { type: Date, required: true },
    detectedAt: { type: Date, default: Date.now },
    questionsCorrect: { type: Number, default: 0, min: 0 },
    questionsIncorrect: { type: Number, default: 0, min: 0 },
    attempt: { type: Number, default: 1, min: 1 }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        (ret as any).id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

// Índices compuestos para queries eficientes
QuizResultSchema.index({ studentId: 1, courseId: 1, quizId: 1 });
QuizResultSchema.index({ submittedAt: -1 });

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
