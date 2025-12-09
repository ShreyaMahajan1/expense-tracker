import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  receiptUrl?: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurringDay?: number;
  notes?: string;
  userId: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    receiptUrl: { type: String },
    paymentMethod: { type: String, default: 'Cash' },
    isRecurring: { type: Boolean, default: false },
    recurringDay: { type: Number },
    notes: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' }
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>('Expense', expenseSchema);
