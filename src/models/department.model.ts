// models/Department.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  campus: Types.ObjectId; // ref to Campus._id
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

export const DepartmentModel = model<IDepartment>('Department', departmentSchema);
