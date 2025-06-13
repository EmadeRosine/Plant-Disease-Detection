
const express = require('express');
const router = express.Router();
const { getPlants, createPlant } = require('../controllers/plantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPlants); 
router.post('/', protect, authorize(['admin']), createPlant); 

module.exports = router;