const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: String,
    logo: String,
    website: String,
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    settings: {
      enableRealTimeAlerts: { type: Boolean, default: true },
      enableMLDetection: { type: Boolean, default: true },
      alertThreshold: { type: Number, default: 0.7 },
      eventRetentionDays: { type: Number, default: 30 },
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
