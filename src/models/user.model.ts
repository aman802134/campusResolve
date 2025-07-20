// models/User.ts
import { Schema, model, Document, Types } from 'mongoose';
import { USER_ROLES, GENDER, USER_STATUS, ROLE_REQUEST_STATUS } from '../types/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES;
  requestedRole?: USER_ROLES;
  roleRequestStatus?: ROLE_REQUEST_STATUS;
  campus: Types.ObjectId;
  department?: Types.ObjectId;
  phone?: string;
  gender?: GENDER;
  status: USER_STATUS;
  avatarUrl?: string;
  verified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
      required: true,
    },

    requestedRole: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: undefined,
    },
    roleRequestStatus: {
      type: String,
      enum: Object.values(ROLE_REQUEST_STATUS),
      default: ROLE_REQUEST_STATUS.PENDING, // or ROLE_REQUEST_STATUS.PENDING if you want
    },
    campus: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      required: function () {
        return this.role !== 'super_admin';
      },
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: function (this: IUser) {
        return [
          USER_ROLES.STUDENT,
          USER_ROLES.FACULTY_ACADEMIC,
          USER_ROLES.FACULTY_NON_ACADEMIC,
        ].includes(this.role);
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

export const UserModel = model<IUser>('User', userSchema);
