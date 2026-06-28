const express = require('express');
const router = express.Router();
const scannerService = require('../services/scannerService');
const Application = require('../models/Application');
const SecurityEvent = require('../models/SecurityEvent');
const logger = require('../config/logger');

router.post('/:appId', async (req, res) => {
  try {
    const app = await Application.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    logger.info(`Starting scan for ${app.name} (${app.url})`);

    // Run the scan
    const scanResults = await scannerService.scanApplication(app);

    // Save findings as security events
    const savedEvents = [];
    for (const finding of scanResults.findings) {
      try {
        const event = await SecurityEvent.create({
          application: app._id,
          organization: req.user.organization,
          eventType: finding.eventType,
          severity: finding.severity,
          source: finding.source,
          payload: finding.payload,
          description: finding.description,
          blocked: finding.blocked,
          metadata: {
            scannerVersion: '1.0',
            threatScore: finding.threatScore,
            confidence: finding.confidence,
          },
        });
        savedEvents.push(event);
      } catch (err) {
        logger.error(`Failed to save event: ${err.message}`);
      }
    }

    logger.info(`Scan complete: ${scanResults.threatsFound} threats, ${savedEvents.length} events saved`);

    res.json({
      success: true,
      message: `Scan complete — ${scanResults.threatsFound} threats found`,
      data: scanResults,
    });
  } catch (error) {
    logger.error(`Scan error: ${error.message}`);
    res.status(500).json({ success: false, message: `Scan failed: ${error.message}` });
  }
});

module.exports = router;
