const SecurityEvent = require('../models/SecurityEvent');
const logger = require('../config/logger');
const axios = require('axios');

const eventService = {
  async createEvent(organizationId, applicationId, eventData) {
    try {
      const event = new SecurityEvent({
        ...eventData,
        organization: organizationId,
        application: applicationId,
      });

      await event.save();

      // Send to ML engine for scoring if enabled
      if (process.env.ENABLE_ML_DETECTION === 'true') {
        this.analyzeWithML(event).catch(err => 
          logger.error(`ML analysis error: ${err.message}`)
        );
      }

      logger.info(`Security event created: ${event._id}`);
      return event;
    } catch (error) {
      logger.error(`Create event error: ${error.message}`);
      throw error;
    }
  },

  async analyzeWithML(event) {
    try {
      const mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8000';
      const response = await axios.post(`${mlEngineUrl}/api/classify`, {
        method: event.source?.method,
        path: event.source?.path,
        parameter: event.payload?.parameter,
        value: event.payload?.value,
        userAgent: event.source?.userAgent,
      });

      event.mlScore = response.data.threat_score;
      event.eventType = response.data.attack_type;
      event.severity = this.calculateSeverity(response.data.threat_score);
      await event.save();

      return event;
    } catch (error) {
      logger.error(`ML analysis error: ${error.message}`);
      return event;
    }
  },

  calculateSeverity(mlScore) {
    if (mlScore >= 0.9) return 'critical';
    if (mlScore >= 0.7) return 'high';
    if (mlScore >= 0.5) return 'medium';
    if (mlScore >= 0.3) return 'low';
    return 'info';
  },

  async getEvents(organizationId, filters = {}) {
    try {
      const mongoose = require('mongoose');
      const orgId = new mongoose.Types.ObjectId(organizationId);
      const query = { organization: orgId };
      
      if (filters.applicationId) query.application = filters.applicationId;
      if (filters.severity) query.severity = filters.severity;
      if (filters.eventType) query.eventType = filters.eventType;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      const skip = filters.page ? (filters.page - 1) * (filters.limit || 20) : 0;
      const events = await SecurityEvent.find(query)
        .populate('application', 'name url')
        .skip(skip)
        .limit(filters.limit || 50)
        .sort({ createdAt: -1 });

      const total = await SecurityEvent.countDocuments(query);

      return {
        data: events,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total,
          pages: Math.ceil(total / (filters.limit || 50)),
        },
      };
    } catch (error) {
      logger.error(`Get events error: ${error.message}`);
      throw error;
    }
  },

  async getEventStats(organizationId) {
    try {
      const mongoose = require('mongoose');
      const orgId = new mongoose.Types.ObjectId(organizationId);
      const stats = await SecurityEvent.aggregate([
        { $match: { organization: orgId } },
        {
          $facet: {
            bySeverity: [
              { $group: { _id: '$severity', count: { $sum: 1 } } },
            ],
            byType: [
              { $group: { _id: '$eventType', count: { $sum: 1 } } },
            ],
            total: [{ $count: 'count' }],
            blocked: [
              { $match: { blocked: true } },
              { $count: 'count' },
            ],
          },
        },
      ]);

      return stats[0];
    } catch (error) {
      logger.error(`Get event stats error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = eventService;
