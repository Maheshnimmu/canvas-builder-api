const express = require('express');
const router = express.Router();
const canvasController = require('../controllers/canvasController');

router.post('/init', canvasController.initCanvas);
router.post('/elements', canvasController.addElement);
router.get('/export', canvasController.exportPDF);

module.exports = router; 