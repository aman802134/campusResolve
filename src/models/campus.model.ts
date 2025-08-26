// models/Campus.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICampus extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  campusCode: string;
  admins: Types.ObjectId[]; // references to User._id
  createdAt: Date;
  updatedAt: Date;
}

const campusSchema = new Schema<ICampus>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
    },
    campusCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [], // default to empty array
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const CampusModel = model<ICampus>('Campus', campusSchema);
