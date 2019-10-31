const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const {
  validateRegisterInput,
  validateLoginInput
} = require('../../util/validators');
const User = require('../../models/User');
const { SECRET_KEY } = require('../../config');

const generateToken = user => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: '3h' }
  );
};

module.exports = {
  Mutation: {
    // Login user
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError('Errors....', { errors });
      }
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'user not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong Credentials';
        throw new UserInputError('Wrong Credentials', { errors });
      }

      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token
      };
    },

    // Register User
    async register(
      _,
      {
        RegisterInput: { username, password, confirmPassword, email }
      },
      context,
      info
    ) {
      // TODO: Validate user data
      // TODO: make sure user doesn't already exist
      // hash the password  and create an Auth token
      const { valid, errors } = validateRegisterInput(
        username,
        password,
        confirmPassword,
        email
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'this username is taken'
          }
        });
      }
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        confirmPassword,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();

      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token
      };
    }
  }
};
