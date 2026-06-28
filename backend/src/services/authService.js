const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../config/jwt');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

const authService = {
  async register(userData) {
    try {
      const { username, email, password, firstName, lastName } = userData;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      await user.save();

      const org = new Organization({
        name: `${username}'s Organization`,
        owner: user._id,
        apiKey: uuidv4(),
      });
      await org.save();

      user.organization = org._id;
      await user.save();

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        organization: org._id,
      });

      logger.info(`User registered: ${email}`);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        organization: user.organization,
      });

      logger.info(`User logged in: ${email}`);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const user = await User.findById(userId).populate('organization');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Get user error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = authService;
