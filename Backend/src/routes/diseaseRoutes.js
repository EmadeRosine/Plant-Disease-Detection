// src/routes/diseaseRoutes.js
const express = require('express');
const router = express.Router();
const { getDiseases, createDisease } = require('../controllers/diseaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getDiseases); // Accessible by all authenticated users
router.post('/', protect, authorize(['admin']), createDisease); // Only admins can create diseases

module.exports = router;