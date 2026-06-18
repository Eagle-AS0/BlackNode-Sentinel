const applicationService = require('../services/applicationService');
const logger = require('../config/logger');

const applicationController = {
  async create(req, res) {
    try {
      const app = await applicationService.createApplication(
        req.user.organization,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: app,
      });
    } catch (error) {
      logger.error(`Create application error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const result = await applicationService.getApplications(
        req.user.organization,
        { page: req.query.page, limit: req.query.limit }
      );
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error(`Get applications error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getOne(req, res) {
    try {
      const app = await applicationService.getApplication(req.params.id);
      res.status(200).json({
        success: true,
        data: app,
      });
    } catch (error) {
      logger.error(`Get application error: ${error.message}`);
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const app = await applicationService.updateApplication(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: app,
      });
    } catch (error) {
      logger.error(`Update application error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async delete(req, res) {
    try {
      await applicationService.deleteApplication(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (error) {
      logger.error(`Delete application error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = applicationController;
