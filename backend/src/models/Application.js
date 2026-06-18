const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Application name is required'],
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    agentKey: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,
    url: String,
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'php', 'go', 'other'],
    },
    framework: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'inactive',
    },
    isMonitoring: { type: Boolean, default: false },
    threatLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'none'],
      default: 'none',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
