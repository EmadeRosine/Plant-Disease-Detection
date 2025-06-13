
const express = require('express');
const router = express.Router();
const {
    createSymptom,
    getSymptoms,
    getSymptom,
    updateSymptom,
    deleteSymptom
} = require('../controllers/symptomController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/', getSymptoms); 
router.get('/:id', getSymptom); 

router.post('/', protect, authorize(['admin']), createSymptom);
router.put('/:id', protect, authorize(['admin']), updateSymptom);
router.delete('/:id', protect, authorize(['admin']), deleteSymptom);

module.exports = router;