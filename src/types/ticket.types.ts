export enum TICKET_STATUS {
  Assigned = 'assigned',
  Pending = 'pending',
  In_progress = 'in_progress',
  Resolved = 'resolved',
  Rejected = 'rejected',
  Escalated = 'escalated',
}
export enum PRIORITY {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export type createTicketPayload = {
  title: string;
  description: string;
  department: string;
  priority?: PRIORITY; // optional, can default to 'normal'
  isSensitive?: boolean; // optional
  attachments?: string[];
};

export type updateTicketPayload = {
  status?: TICKET_STATUS;
  assignedTo?: string;
};
export type ticketResponse = {
  id: string;
  title: string;
  description: string;
  status: TICKET_STATUS;
  department: string;
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
  createdAt: string;
  updatedAt: string;
};
