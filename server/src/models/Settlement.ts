import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  groupId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ISettlement>('Settlement', settlementSchema);
