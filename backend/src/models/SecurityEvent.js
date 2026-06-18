const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['sql_injection', 'xss', 'path_traversal', 'command_injection', 'suspicious', 'anomaly'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'medium',
    },
    source: {
      ip: String,
      method: String,
      path: String,
      userAgent: String,
    },
    payload: {
      parameter: String,
      value: String,
    },
    mlScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    blocked: { type: Boolean, default: false },
    tags: [String],
    description: String,
    response: {
      statusCode: Number,
      message: String,
    },
  },
  { timestamps: true }
);

securityEventSchema.index({ application: 1, createdAt: -1 });
securityEventSchema.index({ organization: 1, createdAt: -1 });
securityEventSchema.index({ severity: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
