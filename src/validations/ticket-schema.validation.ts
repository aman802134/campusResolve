import { z } from 'zod';
import { PRIORITY, TICKET_STATUS } from '../types/ticket.types';

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  department: z.string().min(1, 'Department is required'),
  priority: z.enum([PRIORITY.low, PRIORITY.medium, PRIORITY.medium, PRIORITY.high]).optional(),
  isSensitive: z.boolean().optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  status: z.enum([
    TICKET_STATUS.Assigned,
    TICKET_STATUS.In_progress,
    TICKET_STATUS.Resolved,
    TICKET_STATUS.Rejected,
    TICKET_STATUS.Escalated,
  ]),
  assignedTo: z.string().optional(), // assuming you’re assigning a userId
});
