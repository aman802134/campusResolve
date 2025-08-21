// controllers/ticket.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { CreateTicketPayload, UpdateTicketPayload } from '../types/ticket.types';
import { TICKET_STATUS, USER_ROLES } from '../types/enums';
import { ApiError } from '../utils/api-error';
import { TicketModel } from '../models/ticket.model';
import mongoose from 'mongoose';
import { DepartmentModel } from '../models/department.model';
import { createTicketSchema } from '../validations/ticket-schema.validation';
import uploadFile from '../cloudinary/cloudinary';

// Create a new ticket (student or any role that can submit)
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('userId from ticket', req.user);
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const payload = parsed.data;
    let attachments: string[] = [];
    if (Array.isArray(req.files)) {
      attachments = req.files.map((file: Express.Multer.File) => file.path);
    }

    if (attachments.length === 0) {
      return res.status(400).json({ error: 'No file uploaded or URL provided' });
    }
    const uploadResults = await Promise.all(
      attachments.map(async (filePath) => {
        const result = await uploadFile(filePath);
        return result.url;
      }),
    );
    if (!uploadResults) {
      throw new ApiError(500, 'File or image upload failed: ');
    }
    const fileUrl = uploadResults;
    const userId = req.user?.userId;
    const userCampus = req.user?.campus;
    const userRole = req.user?.role;

    if (!userId) throw new ApiError(401, 'Unauthorized');

    if (!payload.title || !payload.description || !payload.department || !payload.campus) {
      throw new ApiError(400, 'Missing required fields: title, description, department, campus');
    }

    if (userRole === USER_ROLES.STUDENT && payload.campus !== userCampus) {
      throw new ApiError(403, 'You can submit the complaint to your campus only');
    }

    const department = await DepartmentModel.findById(payload.department);
    if (!department || department.campus.toString() !== payload.campus) {
      throw new ApiError(403, 'Selected department is not part of your campus');
    }

    const ticket = await TicketModel.create({
      title: payload.title,
      description: payload.description,
      campus: payload.campus,
      department: payload.department,
      domain: payload.domain || null,
      priority: payload.priority || undefined,
      isSensitive: payload.isSensitive || false,
      attachments: fileUrl || [],
      createdBy: userId,
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
      .populate('campus', 'name campusCode');

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
    if (![USER_ROLES.CAMPUS_ADMIN, USER_ROLES.SUPER_ADMIN].includes(role)) {
      throw new ApiError(403, 'Forbidden');
    }

    const campusFilter = (req.query.campus as string) || campus;
    const tickets = await TicketModel.find({ campus: campusFilter })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('department', 'name')
      .populate('campus', 'name campusCode');

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
      .populate('campus', 'name campusCode');

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    if (
      req.user!.role === USER_ROLES.STUDENT &&
      ticket.createdBy._id.toString() !== req.user!.userId
    ) {
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

// Update ticket status or assignee
export const updateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.ticketId;
    const payload: UpdateTicketPayload = req.body;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new ApiError(400, `Invalid ticket ID: ${ticketId}`);
    }
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const { role, userId } = req.user!;
    if (role === USER_ROLES.STUDENT) {
      throw new ApiError(403, 'Students cannot update tickets');
    }

    const historyEntry: any = {
      updatedBy: userId,
      previousStatus: ticket.status,
      newStatus: payload.status || ticket.status,
      date: new Date(),
      comment: payload.comment || '',
    };

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

// Escalate a ticket
export const escalateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.ticketId;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new ApiError(400, 'Invalid ticket ID');
    }
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const { role, userId } = req.user!;
    if (
      ![USER_ROLES.CAMPUS_ADMIN, USER_ROLES.DEPARTMENT_ADMIN, USER_ROLES.SUPER_ADMIN].includes(role)
    ) {
      throw new ApiError(403, 'Forbidden');
    }

    if ((ticket.escalationLevel || 0) >= 4) {
      throw new ApiError(400, 'Maximum escalation level reached, cannot escalate further');
    }

    ticket.escalated = true;
    ticket.escalationLevel = (ticket.escalationLevel || 0) + 1;
    ticket.status = TICKET_STATUS.Escalated;
    ticket.history.push({
      updatedBy: new mongoose.Types.ObjectId(userId),
      previousStatus: ticket.status,
      newStatus: TICKET_STATUS.Escalated,
      comment: 'Escalated by ' + role,
      date: new Date(),
    });

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
