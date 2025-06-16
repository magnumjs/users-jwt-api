module.exports = {
  signToken: (userId) => {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
    return token;
  },

  verifyToken: (token) => {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      return null;
    }
  }
};