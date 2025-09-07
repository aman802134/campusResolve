// models/Verification.ts
import { Schema, model, Document, Types } from 'mongoose';
import { USER_ROLES } from '../types/enums';

export interface IVerification extends Document {
  externalId: string; // like studentId, facultyId, adminId, etc.
  name: string;
  email: string;
  role: USER_ROLES;
  campus: Types.ObjectId;
  department?: Types.ObjectId;
  createdBy: Types.ObjectId;
}

const verificationSchema = new Schema<IVerification>(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    campus: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: function (this: IVerification) {
        return [
          USER_ROLES.STUDENT,
          USER_ROLES.FACULTY_ACADEMIC,
          USER_ROLES.FACULTY_NON_ACADEMIC,
          USER_ROLES.DEPARTMENT_HEAD,
        ].includes(this.role);
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const VerificationModel = model<IVerification>('Verification', verificationSchema);
