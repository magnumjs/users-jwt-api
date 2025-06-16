import fastify from 'fastify';
import usersRoute from '../src/routes/users.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = fastify();

beforeAll(async () => {
  // Clean up the test database
  await prisma.ticket.deleteMany(); // Delete tickets first!
  await prisma.user.deleteMany();
  app.register(usersRoute);
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('Users API', () => {
  it('POST /register should create a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/register',
      payload: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
    expect(body.email).toBe('test@example.com');
  });

  let jwtToken;

  it('POST /login should succeed with correct credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('message', 'Login successful');
  });

  it('POST /login should return a JWT token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('token');
    jwtToken = body.token;
  });

  it('POST /login should fail with wrong credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('error', 'Invalid credentials');
  });

  it('GET /users should fail without JWT', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users'
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('GET /users should succeed with valid JWT', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: `Bearer ${jwtToken}`
      }
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
  });
});