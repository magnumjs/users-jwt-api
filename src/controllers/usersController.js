import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SALT_ROUNDS = 10;

class UsersController {
    async registerUser(request, reply) {
        const { name, email, password } = request.body;
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword }
            });
            return reply.code(201).send(user);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    }

    async loginUser(request, reply) {
        const { email, password } = request.body;
        // Fetch user from DB by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        // Sign JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        return { message: 'Login successful', token };
    }

    async getUsers(request, reply) {
        // Check for Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return reply.code(401).send({ error: 'Invalid token' });
        }
        const users = await prisma.user.findMany();
        return users;
    }
}

export default UsersController;