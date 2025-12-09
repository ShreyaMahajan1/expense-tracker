import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, default: 'member' },
        joinedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>('Group', groupSchema);
