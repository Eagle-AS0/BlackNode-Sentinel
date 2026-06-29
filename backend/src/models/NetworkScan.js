const mongoose = require('mongoose');

const networkScanSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    scanType: {
      type: String,
      enum: ['dns', 'ssl', 'port_scan', 'full', 'http_response'],
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    results: {
      dns: {
        resolution: [String],
        reverseDns: String,
        dnssec: Boolean,
        nameservers: [String],
      },
      ssl: {
        valid: Boolean,
        issuer: String,
        subject: String,
        validFrom: Date,
        validTo: String,
        daysUntilExpiry: Number,
        protocol: String,
        cipher: String,
        serialNumber: String,
        san: [String],
      },
      ports: [
        {
          port: Number,
          state: String,
          service: String,
          version: String,
        },
      ],
      http: {
        statusCode: Number,
        responseTime: Number,
        serverHeader: String,
        headers: mongoose.Schema.Types.Mixed,
        contentType: String,
        contentLength: Number,
      },
      fingerprint: {
        technology: String,
        framework: String,
        osHint: String,
      },
    },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'info',
    },
    findings: [
      {
        severity: String,
        description: String,
        category: String,
      },
    ],
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

networkScanSchema.index({ application: 1, scannedAt: -1 });
networkScanSchema.index({ scanType: 1, scannedAt: -1 });
networkScanSchema.index({ target: 1, scannedAt: -1 });

module.exports = mongoose.model('NetworkScan', networkScanSchema);
