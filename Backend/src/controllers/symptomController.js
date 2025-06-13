// src/controllers/symptomController.js
const db = require('../models');
const Symptom = db.Symptom;

// @desc    Get all symptoms
// @route   GET /api/symptoms
// @access  Public
const getSymptoms = async (req, res) => {
    try {
        const symptoms = await Symptom.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(symptoms);
    } catch (error) {
        console.error('Error fetching symptoms:', error);
        res.status(500).json({ error: 'Server error while fetching symptoms.' });
    }
};

// @desc    Create a new symptom
// @route   POST /api/symptoms
// @access  Private (Admin only)
const createSymptom = async (req, res) => {
    const { name, description, type } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Symptom name is required.' });
    }

    try {
        const symptomExists = await Symptom.findOne({ where: { name } });
        if (symptomExists) {
            return res.status(409).json({ error: 'Symptom with this name already exists.' });
        }

        const symptom = await Symptom.create({
            name,
            description,
            type
        });
        res.status(201).json(symptom);
    } catch (error) {
        console.error('Error creating symptom:', error);
        res.status(500).json({ error: 'Server error while creating symptom.' });
    }
};

module.exports = {
    getSymptoms,
    createSymptom
};