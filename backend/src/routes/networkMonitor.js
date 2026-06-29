const express = require('express');
const router = express.Router();
const networkMonitor = require('../services/networkMonitorService');
const Application = require('../models/Application');

router.get('/scan/:appId', async (req, res) => {
  try {
    const app = await Application.findById(req.params.appId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    const url = app.url || '';
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    if (!domain) return res.status(400).json({ success: false, message: 'No valid URL for this application' });
    const results = await networkMonitor.fullScan(domain);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/dns/:domain', async (req, res) => {
  try {
    const results = await networkMonitor.dnsLookup(req.params.domain);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ssl/:domain', async (req, res) => {
  try {
    const results = await networkMonitor.sslCheck(req.params.domain);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ports/:host', async (req, res) => {
  try {
    const results = await networkMonitor.portScan(req.params.host);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
