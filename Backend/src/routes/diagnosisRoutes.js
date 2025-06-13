
const express = require('express');
const router = express.Router();
const {
    submitDiagnosis,
    getDiagnoses,
    getDiagnosis,
    validateDiagnosis,
    getDiagnosesByFarmer 
} = require('../controllers/diagnosisController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/', protect, authorize(['farmer', 'expert', 'admin']), submitDiagnosis);

router.get('/', protect, authorize(['expert', 'admin']), getDiagnoses);

router.get('/:id', protect, authorize(['farmer', 'expert', 'admin']), getDiagnosis); 


router.put('/:id/validate', protect, authorize(['expert', 'admin']), validateDiagnosis);


router.get('/user/:userId', protect, authorize(['farmer', 'expert', 'admin']), getDiagnosesByFarmer);


module.exports = router;