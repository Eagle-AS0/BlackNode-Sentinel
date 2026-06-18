const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', applicationController.create);
router.get('/', applicationController.getAll);
router.get('/:id', applicationController.getOne);
router.put('/:id', applicationController.update);
router.delete('/:id', applicationController.delete);

module.exports = router;
