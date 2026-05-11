import mongoose, { Schema, Document, Types } from 'mongoose';
import { ReviewDecision } from '../constants';

export interface IReview extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  decision: ReviewDecision;
  comments?: string;
  score: number;
  reviewedAt: Date;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: Object.values(ReviewDecision), required: true },
    comments: { type: String, maxlength: 1000 },
    score: { type: Number, required: true, min: 0, max: 100 },
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reviewSchema.index({ taskId: 1 });
reviewSchema.index({ reviewerId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
