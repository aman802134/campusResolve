import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../validations/validate-request';
import { createTicketSchema } from '../validations/ticket-schema.validation';
import { createTicket } from '../controllers/ticket.controller';

const router = express.Router();
router.post('/create-ticket', authenticate, validateRequest(createTicketSchema), createTicket);

export const ticketRoute = router;
