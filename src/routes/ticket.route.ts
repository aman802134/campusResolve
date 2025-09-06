import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../validations/validate-request';
import {
  createTicketSchema,
  updateTicketStatusSchema,
} from '../validations/ticket-schema.validation';
import {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicket,
  escalateTicket,
  getAllTickets,
} from '../controllers/ticket.controller';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';
import upload from '../multer/multer.middleware';

const router = express.Router();

router.post('/create-ticket', authenticate, upload.array('attachments'), createTicket);
router.get('/all/:userId', authenticate, getUserTickets);
router.get(
  '/all-tickets',
  authenticate,
  authorize(USER_ROLES.CAMPUS_HEAD, USER_ROLES.ADMIN),
  getAllTickets,
);
router.get('/:id', authenticate, getTicketById);

router.patch(
  '/update/:ticketId',
  authenticate,
  authorize(
    USER_ROLES.CAMPUS_HEAD,
    USER_ROLES.DEPARTMENT_HEAD,
    USER_ROLES.ADMIN,
    USER_ROLES.FACULTY_ACADEMIC,
  ),
  validateRequest(updateTicketStatusSchema),
  updateTicket,
);
router.patch(
  '/escalate/:ticketId',
  authenticate,
  authorize(USER_ROLES.CAMPUS_HEAD, USER_ROLES.DEPARTMENT_HEAD, USER_ROLES.ADMIN),
  escalateTicket,
);
export const ticketRoute = router;
