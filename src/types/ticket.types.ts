import { PRIORITY, TICKET_STATUS } from './enums';

export type CreateTicketPayload = {
  title: string;
  description: string;
  campus: string; // Campus._id
  department: string; // Department._id
  domain?: string; // Optional domain slug
  priority?: PRIORITY; // Defaults to 'low'
  isSensitive?: boolean;
  attachments?: string[]; // Optional attachment URLs or IDs
};

export type UpdateTicketPayload = {
  status?: TICKET_STATUS;
  assignedToId?: string; // User._id
  comment?: string; // Optional note for history
  escalated?: boolean;
};

export type TicketResponse = {
  id: string;
  title: string;
  description: string;
  campus: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  domain?: string;
  status: TICKET_STATUS;
  priority: PRIORITY;
  isSensitive: boolean;
  attachments?: string[];
  assignedTo?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  escalated: boolean;
  escalationLevel: number;
  history: Array<{
    updatedBy: {
      id: string;
      name: string;
    };
    previousStatus: TICKET_STATUS;
    newStatus: TICKET_STATUS;
    comment?: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
