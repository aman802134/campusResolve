import { Schema, model, Document, Types } from 'mongoose';
import { GENDER, USER_STATUS } from '../types/enums';
export interface IAdminVerification extends Document {
  name: string;
  email: string;
  externalId: string;
  role: string;
  campus: Types.ObjectId;
  phone?: string;
  gender?: GENDER;
  status: USER_STATUS;
  verified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminVerificationSchema = new Schema<IAdminVerification>(
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
    externalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      role: 'admin',
      required: true,
      default: 'admin',
    },
    campus: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      required: function () {
        return this.role !== 'super_admin';
      },
    },
    phone: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
  },
  { timestamps: true },
);

export const AdminVerificationModel = model<IAdminVerification>(
  'VerifiedAdmin',
  adminVerificationSchema,
);
