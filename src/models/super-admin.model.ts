import { Schema, model, Document, Types } from 'mongoose';
import { GENDER } from '../types/enums';
export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  gender?: GENDER;
  createdAt: Date;
  updatedAt: Date;
}

const superAdminSchema = new Schema<ISuperAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      role: 'super-admin',
      required: true,
      default: 'super-admin',
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
  },
  { timestamps: true },
);

export const SuperAdminModel = model<ISuperAdmin>('SuperAdmin', superAdminSchema);
