const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', eventController.create);
router.get('/', eventController.getEvents);
router.get('/stats/overview', eventController.getStats);

module.exports = router;
