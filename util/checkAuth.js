const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

module.exports = context => {
  // context = { ... headers }
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // bearer ...
    const token = authHeader.split('Bearer ')[1]; // split will return two string 1 the bearer, the 2 Token.
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('Envalid/Expired token');
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error('Authorization header must be provided');
};
