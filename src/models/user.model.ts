import { USER_ROLES, FACULTY_TYPE, GENDER, USER_STATUS } from '../types/enums';

import { Schema, model, Document } from 'mongoose';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES;
  campus: string;
  department?: string;
  facultyType?: FACULTY_TYPE;
  phone: string;
  gender: GENDER;
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
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'department_admin', 'campus_admin', 'super_admin'],
      default: 'student',
      required: true,
    },
    facultyType: {
      type: String,
      enum: ['academic', 'non_academic'],
      required: function (this: IUser) {
        return this.role === 'faculty';
      },
    },
    campus: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: function (this: IUser) {
        return ['faculty', 'student'].includes(this.role); // optional for others
      },
    },
    phone: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    verified: { type: Boolean, default: false }, //to verify the user using mail or otp
    avatarUrl: { type: String, default: '' }, // for profile photo
    isBanned: { type: Boolean, default: false }, // usecase for admin side
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
