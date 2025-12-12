import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'budget_warning' | 'budget_exceeded' | 'budget_critical' | 'payment_reminder' | 'payment_request' | 'payment_received';
  title: string;
  message: string;
  category?: string;
  budgetLimit?: number;
  currentSpent?: number;
  percentage?: number;
  groupId?: mongoose.Types.ObjectId;
  settlementId?: mongoose.Types.ObjectId;
  amount?: number;
  fromUserId?: mongoose.Types.ObjectId;
  toUserId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['budget_warning', 'budget_exceeded', 'budget_critical', 'payment_reminder', 'payment_request', 'payment_received'],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String },
    budgetLimit: { type: Number },
    currentSpent: { type: Number },
    percentage: { type: Number },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    settlementId: { type: Schema.Types.ObjectId, ref: 'Settlement' },
    amount: { type: Number },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);