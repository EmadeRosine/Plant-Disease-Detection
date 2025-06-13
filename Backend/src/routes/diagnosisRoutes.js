// src/routes/diagnosisRoutes.js
const express = require('express');
const router = express.Router();
const {
    submitDiagnosis,
    getDiagnoses,
    getDiagnosis,
    validateDiagnosis,
    getDiagnosesByFarmer // Import the new function
} = require('../controllers/diagnosisController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route 1: Submit a new diagnosis
router.post('/', protect, authorize(['farmer', 'expert', 'admin']), submitDiagnosis);

// Route 2: Get all diagnosis requests (for Experts/Admins)
router.get('/', protect, authorize(['expert', 'admin']), getDiagnoses);

// Route 3: Get a single diagnosis request by ID
router.get('/:id', protect, authorize(['farmer', 'expert', 'admin']), getDiagnosis); // Farmer can get their own

// Route 4: Validate a diagnosis request (by an expert)
router.put('/:id/validate', protect, authorize(['expert', 'admin']), validateDiagnosis);

// Route 5: Get diagnoses for a specific farmer (accessible by farmer for self, expert/admin for any)
router.get('/user/:userId', protect, authorize(['farmer', 'expert', 'admin']), getDiagnosesByFarmer);


module.exports = router;