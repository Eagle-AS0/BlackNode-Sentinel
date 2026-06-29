const express = require('express');
const router = express.Router();
const threatIntel = require('../services/threatIntelService');

router.get('/cves', async (req, res) => {
  try {
    const cves = await threatIntel.fetchCVEs();
    res.json({ success: true, data: cves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/pulses', async (req, res) => {
  try {
    const pulses = await threatIntel.fetchPulses();
    res.json({ success: true, data: pulses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/geo/:ip', async (req, res) => {
  try {
    const geo = await threatIntel.getGeoIP(req.params.ip);
    res.json({ success: true, data: geo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const feed = await threatIntel.getCombinedFeed();
    res.json({ success: true, data: feed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
