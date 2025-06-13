// src/routes/plantRoutes.js
const express = require('express');
const router = express.Router();
const { getPlants, createPlant } = require('../controllers/plantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPlants); // Accessible by all authenticated users
router.post('/', protect, authorize(['admin']), createPlant); // Only admins can create plants

module.exports = router;