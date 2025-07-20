// models/Campus.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICampus extends Document {
  name: string;
  location: string;
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
    location: {
      type: String,
      required: true,
      trim: true,
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
