# Users JWT API

This project is a Node.js application built with Fastify that provides a JSON Web Token (JWT) authentication system for user management. It allows users to register and log in, generating tokens for secure access to protected resources.

## Features

- User registration
- User login
- JWT token generation and verification
- Fastify framework for high performance

## Project Structure

```
users-jwt-api
├── src
│   ├── app.js                # Entry point of the application
│   ├── controllers
│   │   └── usersController.js # Handles user-related operations
│   ├── routes
│   │   └── users.js          # Defines user-related routes
│   ├── models
│   │   └── user.js           # User model for database interaction
│   └── utils
│       └── jwt.js            # Utility functions for JWT
├── package.json               # NPM configuration file
├── .env                       # Environment variables
└── README.md                  # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd users-jwt-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your environment variables (e.g., JWT secret, database connection string).

## Usage

To start the server, run:
```
npm start
```

The server will be running on `http://localhost:3000`.

## API Endpoints

### Register User

- **Endpoint:** `POST /api/users/register`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Login User

- **Endpoint:** `POST /api/users/login`
- **Description:** Logs in an existing user and returns a JWT token.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

## License

This project is licensed under the MIT License.