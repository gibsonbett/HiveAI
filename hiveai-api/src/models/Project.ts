import mongoose, { Schema, Document, Types } from 'mongoose';
import { ProjectStatus, TaskType } from '../constants';

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  clientId: Types.ObjectId;
  taskType: TaskType;
  datasetUrl?: string;
  status: ProjectStatus;
  budget: number;
  payoutPerTask: number;
  qualityThreshold: number;
  totalTasks: number;
  completedTasks: number;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskType: { type: String, enum: Object.values(TaskType), required: true },
    datasetUrl: { type: String },
    status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.DRAFT },
    budget: { type: Number, required: true, min: 0 },
    payoutPerTask: { type: Number, required: true, min: 0 },
    qualityThreshold: { type: Number, default: 80, min: 0, max: 100 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

projectSchema.index({ clientId: 1, status: 1 });
projectSchema.index({ status: 1, taskType: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
