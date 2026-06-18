const Application = require('../models/Application');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

const applicationService = {
  async createApplication(organizationId, appData) {
    try {
      const application = new Application({
        ...appData,
        organization: organizationId,
        agentKey: uuidv4(),
      });

      await application.save();
      logger.info(`Application created: ${application._id}`);
      return application;
    } catch (error) {
      logger.error(`Create application error: ${error.message}`);
      throw error;
    }
  },

  async getApplications(organizationId, options = {}) {
    try {
      const query = { organization: organizationId };
      const skip = options.page ? (options.page - 1) * (options.limit || 10) : 0;

      const apps = await Application.find(query)
        .skip(skip)
        .limit(options.limit || 10)
        .sort({ createdAt: -1 });

      const total = await Application.countDocuments(query);

      return {
        data: apps,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total,
          pages: Math.ceil(total / (options.limit || 10)),
        },
      };
    } catch (error) {
      logger.error(`Get applications error: ${error.message}`);
      throw error;
    }
  },

  async getApplication(appId) {
    try {
      const app = await Application.findById(appId);
      if (!app) {
        throw new Error('Application not found');
      }
      return app;
    } catch (error) {
      logger.error(`Get application error: ${error.message}`);
      throw error;
    }
  },

  async updateApplication(appId, updateData) {
    try {
      const app = await Application.findByIdAndUpdate(appId, updateData, {
        new: true,
        runValidators: true,
      });
      if (!app) {
        throw new Error('Application not found');
      }
      logger.info(`Application updated: ${appId}`);
      return app;
    } catch (error) {
      logger.error(`Update application error: ${error.message}`);
      throw error;
    }
  },

  async deleteApplication(appId) {
    try {
      const app = await Application.findByIdAndDelete(appId);
      if (!app) {
        throw new Error('Application not found');
      }
      logger.info(`Application deleted: ${appId}`);
      return app;
    } catch (error) {
      logger.error(`Delete application error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = applicationService;
