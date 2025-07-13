import { Schema, model, Types } from 'mongoose';
import { PRIORITY, TICKET_STATUS } from '../types/ticket.types';

export interface ITicket {
  title: string;
  description: string;
  department: string;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: TICKET_STATUS;
  priority: PRIORITY;
  isSensitive?: boolean;
  attachments?: string[];
  escalated?: boolean;
  escalationLevel?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
    department: {
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
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.Assigned,
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
    attachments: [
      {
        type: String,
      },
    ],
    escalated: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const TicketModel = model<ITicket>('Ticket', ticketSchema);
