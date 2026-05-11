import mongoose, { Schema, Document, Types } from 'mongoose';
import { TaskStatus } from '../constants';

export interface ITask extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: TaskStatus;
  inputData: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  reviewStatus?: string;
  qualityScore?: number;
  payoutAmount: number;
  priority: number;
  startedAt?: Date;
  submittedAt?: Date;
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
    inputData: { type: Schema.Types.Mixed, required: true },
    outputData: { type: Schema.Types.Mixed },
    reviewStatus: { type: String },
    qualityScore: { type: Number, min: 0, max: 100 },
    payoutAmount: { type: Number, required: true, min: 0 },
    priority: { type: Number, default: 0 },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    timeLimit: { type: Number },
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
