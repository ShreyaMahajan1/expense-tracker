import mongoose, { Document, Schema } from 'mongoose';

export interface IIncome extends Document {
  amount: number;
  source: string;
  description: string;
  date: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>(
  {
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IIncome>('Income', incomeSchema);
