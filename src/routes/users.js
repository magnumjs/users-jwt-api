import UsersController from '../controllers/usersController.js';

const usersController = new UsersController();

async function usersRoute(fastify, options) {
  fastify.get('/users', usersController.getUsers.bind(usersController));
  fastify.post('/register', usersController.registerUser.bind(usersController));
  fastify.post('/login', usersController.loginUser.bind(usersController));
}

export default usersRoute;