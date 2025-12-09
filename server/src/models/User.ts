import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  upiId?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    upiId: { type: String },
    phoneNumber: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
