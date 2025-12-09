import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseSplit extends Document {
  expenseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  paid: boolean;
  createdAt: Date;
}

const expenseSplitSchema = new Schema<IExpenseSplit>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IExpenseSplit>('ExpenseSplit', expenseSplitSchema);
