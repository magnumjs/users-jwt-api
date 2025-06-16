import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import dotenv from 'dotenv';
import usersRoute from './routes/users.js';
import ticketsRoute from './routes/tickets.js';

// Load environment variables from .env file
dotenv.config();

const app = fastify({ logger: true });

// Register CORS before your routes
await app.register(fastifyCors, {
  origin: 'http://localhost:5173', // or true for all origins
  credentials: true
});

// Register routes
app.register(usersRoute);
app.register(ticketsRoute);

app.get('/', async (request, reply) => {
  return { status: 'Server running' };
});

// Start the server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();