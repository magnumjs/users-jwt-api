import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const prisma = new PrismaClient();

function getUserFromToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getTickets(request, reply) {
  const payload = getUserFromToken(request);
  if (!payload) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  const tickets = await prisma.ticket.findMany();
  return tickets;
}

export async function createTicket(request, reply) {
  const payload = getUserFromToken(request);
  if (!payload) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  const { title, description, status } = request.body;
  if (!title || !description || !status) {
    return reply.code(400).send({ error: 'Missing required fields' });
  }
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    return reply.code(404).send({ error: 'User not found' });
  }
  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      status,
      userId: user.id
    }
  });
  return reply.code(201).send(ticket);
}

export async function getTicketById(request, reply) {
  const payload = getUserFromToken(request);
  if (!payload) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  const ticketId = parseInt(request.params.id, 10);
  if (isNaN(ticketId)) {
    return reply.code(400).send({ error: 'Invalid ticket id' });
  }
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return reply.code(404).send({ error: 'Ticket not found' });
  }
  return ticket;
}