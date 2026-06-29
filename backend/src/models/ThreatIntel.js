const mongoose = require('mongoose');

const threatIntelSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['nvd', 'otx', 'abuseipdb', 'combined'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['cve', 'pulse', 'abuse_report', 'geo_ip'],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    externalId: {
      type: String,
      index: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
    },
    tags: [String],
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

threatIntelSchema.index({ source: 1, fetchedAt: -1 });
threatIntelSchema.index({ type: 1, fetchedAt: -1 });
threatIntelSchema.index({ externalId: 1 }, { sparse: true });

module.exports = mongoose.model('ThreatIntel', threatIntelSchema);
