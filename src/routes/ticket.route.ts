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
} from '../controllers/ticket.controller';

const router = express.Router();
router.post('/create-ticket', authenticate, validateRequest(createTicketSchema), createTicket);
router.get('/all/:userId', authenticate, getUserTickets);
router.get('/:id', authenticate, getTicketById);
router.patch(
  '/update-status/:ticketId',
  authenticate,
  validateRequest(updateTicketStatusSchema),
  updateTicket,
);
export const ticketRoute = router;
