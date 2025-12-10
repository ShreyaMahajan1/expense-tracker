import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'budget_warning' | 'budget_exceeded' | 'budget_critical';
  title: string;
  message: string;
  category: string;
  budgetLimit: number;
  currentSpent: number;
  percentage: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['budget_warning', 'budget_exceeded', 'budget_critical'],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, required: true },
    budgetLimit: { type: Number, required: true },
    currentSpent: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);