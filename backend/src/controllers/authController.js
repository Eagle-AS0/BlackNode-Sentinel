const authService = require('../services/authService');
const logger = require('../config/logger');

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Register controller error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error(`Login controller error: ${error.message}`);
      res.status(401).json({ success: false, message: error.message });
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUser(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;
