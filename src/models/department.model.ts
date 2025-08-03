// models/Department.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  campus: Types.ObjectId; // ref to Campus._id
  departmentCode: string;
  admin: Types.ObjectId | null; // ref to User._id (department_admin)
  domain?: string[]; // e.g. ['hostel','kitchen']
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    campus: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
    },
    departmentCode: {
      type: String,
      required: true,
      trim: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // no admin by default, will be assigned manually
    },
    domain: {
      type: [String],
      default: [], // default domain to empty array
    },
  },
  {
    timestamps: true,
  },
);
// ✅ Compound index for campus + departmentCode (optional but recommended)
departmentSchema.index({ campus: 1, departmentCode: 1 }, { unique: true });

// Optional performance index
departmentSchema.index({ campus: 1 });

export const DepartmentModel = model<IDepartment>('Department', departmentSchema);
