// models/Ticket.ts
import { Schema, model, Types, Document } from 'mongoose';
import { TICKET_STATUS, PRIORITY } from '../types/enums';

export interface ITicket extends Document {
  title: string;
  description: string;
  campus: Types.ObjectId;
  department: Types.ObjectId;
  domain?: string;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  status: TICKET_STATUS;
  priority: PRIORITY;
  isSensitive: boolean;
  attachments: string[];
  escalated: boolean;
  escalationLevel: number;
  history: Array<{
    updatedBy: Types.ObjectId;
    previousStatus: TICKET_STATUS;
    newStatus: TICKET_STATUS;
    comment?: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
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
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Assigned later manually by admin
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.Pending,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.low,
    },
    isSensitive: {
      type: Boolean,
      default: false,
    },
    attachments: {
      type: [String],
      default: [],
    },
    escalated: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
    history: {
      type: [
        {
          updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          previousStatus: {
            type: String,
            enum: Object.values(TICKET_STATUS),
            required: true,
          },
          newStatus: {
            type: String,
            enum: Object.values(TICKET_STATUS),
            required: true,
          },
          comment: {
            type: String,
            default: '',
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const TicketModel = model<ITicket>('Ticket', ticketSchema);
