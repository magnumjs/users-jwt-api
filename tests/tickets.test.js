import fastify from 'fastify';
import ticketsRoute from '../src/routes/tickets.js';
import usersRoute from '../src/routes/users.js';
import { PrismaClient } from '@prisma/client';

process.env.JWT_SECRET = 'your_jwt_secret';

const prisma = new PrismaClient();
const app = fastify();

let jwtToken;

beforeAll(async () => {
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  app.register(usersRoute);
  app.register(ticketsRoute);
  await app.ready();

  // Register and login a user to get a JWT
  await app.inject({
    method: 'POST',
    url: '/register',
    payload: {
      name: 'Ticket Tester',
      email: 'ticket@example.com',
      password: 'ticketpass'
    }
  });
  const loginRes = await app.inject({
    method: 'POST',
    url: '/login',
    payload: {
      email: 'ticket@example.com',
      password: 'ticketpass'
    }
  });
  jwtToken = JSON.parse(loginRes.payload).token;
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('Tickets API', () => {
  it('GET /tickets should fail without JWT', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tickets'
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('POST /tickets should create a ticket with valid JWT', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/tickets',
      headers: {
        authorization: `Bearer ${jwtToken}`
      },
      payload: {
        title: 'Test Ticket',
        description: 'This is a test ticket.',
        status: 'open'
      }
    });
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Test Ticket');
    expect(body.description).toBe('This is a test ticket.');
    expect(body.status).toBe('open');
    expect(body).toHaveProperty('userId');
  });

  it('GET /tickets should succeed with valid JWT', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tickets',
      headers: {
        authorization: `Bearer ${jwtToken}`
      }
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('title');
    expect(body[0]).toHaveProperty('description');
    expect(body[0]).toHaveProperty('status');
  });

  it('GET /tickets/:id should return a ticket with valid JWT', async () => {
    // First, create a ticket
    const createRes = await app.inject({
      method: 'POST',
      url: '/tickets',
      headers: {
        authorization: `Bearer ${jwtToken}`
      },
      payload: {
        title: 'Single Ticket',
        description: 'This is a single ticket.',
        status: 'open'
      }
    });
    expect(createRes.statusCode).toBe(201);
    const createdTicket = JSON.parse(createRes.payload);

    // Now, fetch the ticket by id
    const response = await app.inject({
      method: 'GET',
      url: `/tickets/${createdTicket.id}`,
      headers: {
        authorization: `Bearer ${jwtToken}`
      }
    });
    expect(response.statusCode).toBe(200);
    const ticket = JSON.parse(response.payload);
    expect(ticket).toHaveProperty('id', createdTicket.id);
    expect(ticket).toHaveProperty('title', 'Single Ticket');
    expect(ticket).toHaveProperty('description', 'This is a single ticket.');
    expect(ticket).toHaveProperty('status', 'open');
  });
});