import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  category: string;
  limit: number;
  month: number;
  year: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);
