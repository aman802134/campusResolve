import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { createTicketPayload } from '../types/ticket.types';
import { ApiError } from '../utils/api-error';
import { TicketModel } from '../models/ticket.model';

export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId; // Extract userId from JWT payload
    const payload: createTicketPayload = req.body;
    if (!payload || !userId) {
      throw new ApiError(400, 'unauthorized , userId not found');
    }
    const ticket = await TicketModel.create({
      ...payload,
      createdBy: userId,
    });
    res.status(201).json({ message: 'complaint registered successfully' });
    return ticket;
  } catch (error) {
    // throw new ApiError(400, error.message);
    res.status(400).json({ message: error });
  }
};

export const getAllTickets = async (userId: string) => {
  const tickets = await TicketModel.find({ createdBy: userId });
  return tickets;
};

export const getTicketById = async (ticketId: string) => {
  const ticket = await TicketModel.findById(ticketId).populate('createdBy assignedTo');
  if (!ticket) {
    throw new ApiError(400, 'ticket not found');
  }
  return ticket;
};

export const updateTicketStatus = async (ticketId: string, status: string, assignedTo?: string) => {
  const updateFields: any = { status };
  if (assignedTo) {
    updateFields.assignedTo = assignedTo;
  }
  const updateTicket = await TicketModel.findByIdAndUpdate(ticketId, updateFields, { new: true });
  if (!updateTicket) {
    throw new ApiError(200, 'Ticket not found');
  }
  return updateTicket;
};

export const escalateTicket = async (ticketId: string) => {
  const ticket = await TicketModel.findById(ticketId);
  if (!ticket) {
    throw new ApiError(200, 'Ticket not found');
  }

  ticket.escalated = true;
  ticket.escalationLevel = (ticket.escalationLevel || 0) + 1;
  await ticket.save();

  return ticket;
};
