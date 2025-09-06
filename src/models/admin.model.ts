// models/User.ts
import { Schema, model, Document, Types } from 'mongoose';
import { USER_ROLES, GENDER, USER_STATUS, ROLE_REQUEST_STATUS } from '../types/enums';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  externalId: string;
  role: USER_ROLES;
  campus: Types.ObjectId;
  phone?: string;
  gender?: GENDER;
  status: USER_STATUS;
  avatarUrl?: string;
  verified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
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
      required: function () {
        return this.role !== USER_ROLES.SUPER_ADMIN;
      },
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
      enum: Object.values(USER_ROLES),
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

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
    },

    avatarUrl: {
      type: String,
      default: '',
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const AdminModel = model<IAdmin>('Admin', adminSchema);
