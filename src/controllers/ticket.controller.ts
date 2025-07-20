// controllers/ticket.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { CreateTicketPayload, UpdateTicketPayload } from '../types/ticket.types';
import { TICKET_STATUS, USER_ROLES } from '../types/enums';
import { ApiError } from '../utils/api-error';
import { TicketModel } from '../models/ticket.model';
import mongoose from 'mongoose';
import { DepartmentModel } from '../models/department.model';

// Create a new ticket (student or any role that can submit)
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userCampus = req.user?.campus;
    const userRole = req.user?.role;

    if (!userId) throw new ApiError(401, 'Unauthorized');

    const payload: CreateTicketPayload = req.body;
    // Derive campus from JWT claims to avoid spoofing
    if (userRole === 'student' && payload.campus !== userCampus) {
      throw new ApiError(403, 'you can submit the complain to your campus only');
    }
    const department = await DepartmentModel.findById(payload.department);
    console.log('department.campus:', department?.campus.toString());
    console.log('payload.campus:', payload.campus);
    // if (!department || department.campus.toString() !== payload.campus) {
    //   throw new ApiError(403, 'selected department is not part of your campus');
    // }

    const ticket = await TicketModel.create({
      title: payload.title,
      description: payload.description,
      campus: payload.campus,
      department: payload.department,
      domain: payload.domain || null,
      priority: payload.priority || undefined,
      isSensitive: payload.isSensitive || false,
      attachments: payload.attachments || [],
      createdBy: userId,
      // status, escalated, escalationLevel, history auto‑defaulted
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// Get tickets created by the logged-in user
export const getUserTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as string;
    if (!userId) throw new ApiError(401, 'Unauthorized');

    const tickets = await TicketModel.find({ createdBy: userId })
      .populate('assignedTo', 'name')
      .populate('department', 'name')
      .populate('campus', 'name');

    res.status(200).json({
      success: true,
      message: 'Tickets fetched successfully',
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

// Get all tickets in the campus (campus‑admin or super‑admin)
export const getAllTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, campus } = req.user!;
    if (!['campus_admin', 'super_admin'].includes(role)) {
      throw new ApiError(403, 'Forbidden');
    }

    // super-admin can optionally pass ?campus=ID to filter; else uses their claim
    const campusFilter = (req.query.campus as string) || campus;
    const tickets = await TicketModel.find({ campus: campusFilter })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('department', 'name');

    res.status(200).json({
      success: true,
      message: 'All tickets fetched successfully',
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

// Get a single ticket by ID
export const getTicketById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new ApiError(400, 'Invalid ticket ID');
    }

    const ticket = await TicketModel.findById(ticketId)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('department', 'name')
      .populate('campus', 'name');

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    // Students can only view their own tickets
    if (req.user!.role === 'student' && ticket.createdBy._id.toString() !== req.user!.userId) {
      throw new ApiError(403, 'Forbidden');
    }

    res.status(200).json({
      success: true,
      message: 'Ticket fetched successfully',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// Update status and/or assignee, logging history
export const updateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.ticketId;
    console.log('ticketId for updation:', JSON.stringify(ticketId)); // Debug: show exact value
    const payload: UpdateTicketPayload = req.body;
    console.log(payload.assignedToId);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new ApiError(400, `Invalid ticket ID: ${ticketId}`);
    }
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    // Only allow role-based updates:
    const { role, userId } = req.user!;
    if (role === 'student') {
      throw new ApiError(403, 'Students cannot update tickets');
    }

    const historyEntry: any = {
      updatedBy: userId,
      previousStatus: ticket.status,
      newStatus: payload.status || ticket.status,
      date: new Date(),
      comment: payload.comment || '',
    };

    // Apply updates
    if (payload.status) ticket.status = payload.status;
    if (payload.assignedToId) ticket.assignedTo = payload.assignedToId as any;
    ticket.history.push(historyEntry);

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// Escalate a ticket (faculty → dept‑admin or dept‑admin → campus‑admin)
export const escalateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.ticketId;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new ApiError(400, 'Invalid ticket ID');
    }
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    // Allow campus_admin, department_admin, and super_admin to escalate
    const { role, userId } = req.user!;
    if (!['campus_admin', 'department_admin', 'super_admin'].includes(role)) {
      throw new ApiError(403, 'Forbidden');
    }

    ticket.escalated = true;
    ticket.escalationLevel = (ticket.escalationLevel || 0) + 1;
    if (ticket.escalationLevel > 4) {
      throw new ApiError(400, 'Maximum escalation level reached , you cannot escalate further');
    }
    ticket.history.push({
      updatedBy: new mongoose.Types.ObjectId(userId),
      previousStatus: ticket.status,
      newStatus: TICKET_STATUS.Escalated,
      comment: 'Escalated by ' + role,
      date: new Date(),
    });
    ticket.status = TICKET_STATUS.Escalated;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket escalated successfully',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};
