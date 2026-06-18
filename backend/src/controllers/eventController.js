const eventService = require('../services/eventService');
const logger = require('../config/logger');

const eventController = {
  async create(req, res) {
    try {
      const event = await eventService.createEvent(
        req.user.organization,
        req.body.applicationId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Security event created',
        data: event,
      });
    } catch (error) {
      logger.error(`Create event error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getEvents(req, res) {
    try {
      const result = await eventService.getEvents(req.user.organization, {
        applicationId: req.query.applicationId,
        severity: req.query.severity,
        eventType: req.query.eventType,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        page: req.query.page,
        limit: req.query.limit,
      });
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error(`Get events error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await eventService.getEventStats(req.user.organization);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error(`Get stats error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = eventController;
