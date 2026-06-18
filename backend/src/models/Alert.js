const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecurityEvent',
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved', 'false_positive'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    channels: {
      email: { type: Boolean, default: true },
      slack: { type: Boolean, default: false },
      webhook: { type: Boolean, default: false },
    },
    notes: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: Date,
    resolvedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
