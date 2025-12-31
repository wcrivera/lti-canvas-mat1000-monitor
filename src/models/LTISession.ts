// ============================================================================
// MODELO LTI SESSION - QUIZ MONITOR
// ============================================================================

import mongoose, { Schema, Document } from 'mongoose';
import { LTIRole, LTISessionStatus } from '../types';

export interface ILTISession extends Document {
  userId: string;
  userName: string;
  courseId: string;
  contextId: string;
  resourceLinkId: string;
  role: LTIRole;
  sessionToken: string;
  status: LTISessionStatus;
  expiresAt: Date;
}

const LTISessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    courseId: { type: String, required: true },
    contextId: { type: String, required: true },
    resourceLinkId: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ['Instructor', 'Learner', 'Administrator'] 
    },
    sessionToken: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      default: 'active', 
      enum: ['active', 'expired'] 
    },
    expiresAt: { type: Date, required: true, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        (ret as any).id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).sessionToken; // No exponer el token
        return ret;
      }
    }
  }
);

// TTL index para auto-eliminar sesiones expiradas
LTISessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ILTISession>('LTISession', LTISessionSchema);
