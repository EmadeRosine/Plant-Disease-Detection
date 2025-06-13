// src/routes/symptomRoutes.js
const express = require('express');
const router = express.Router();
const { getSymptoms, createSymptom } = require('../controllers/symptomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSymptoms); // Accessible by all authenticated users
router.post('/', protect, authorize(['admin']), createSymptom); // Only admins can create symptoms

module.exports = router;