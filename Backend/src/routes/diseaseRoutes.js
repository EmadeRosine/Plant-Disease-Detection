
const express = require('express');
const router = express.Router();
const { getDiseases, createDisease } = require('../controllers/diseaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getDiseases); 
router.post('/', protect, authorize(['admin']), createDisease); 

module.exports = router;