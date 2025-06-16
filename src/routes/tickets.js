import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getTickets, createTicket, getTicketById } from '../controllers/ticketsController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const prisma = new PrismaClient();

async function ticketsRoute(fastify, options) {
  fastify.get('/tickets', getTickets);
  fastify.get('/tickets/:id', getTicketById);
  fastify.post('/tickets', createTicket);
}

export default ticketsRoute;
