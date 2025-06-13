
const db = require('../models');
const Symptom = db.Symptom;


const createSymptom = async (req, res) => {
    const { name, description, type } = req.body;


    if (!name) {
        return res.status(400).json({ error: 'Symptom name is required.' });
    }

    try {
        const symptom = await Symptom.create({ name, description, type });
        res.status(201).json(symptom);
    } catch (error) {
        console.error('Error creating symptom:', error);
  
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Symptom with this name already exists.' });
        }
        if (error.name === 'SequelizeValidationError') {
        
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }

        res.status(500).json({ error: 'Server error when creating symptom.' });
    }
};


const getSymptoms = async (req, res) => {
    try {
        const symptoms = await Symptom.findAll();
        res.status(200).json(symptoms);
    } catch (error) {
        console.error('Error fetching symptoms:', error);
        res.status(500).json({ error: 'Server error when fetching symptoms.' });
    }
};


const getSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findByPk(req.params.id);
        if (!symptom) {
            return res.status(404).json({ error: 'Symptom not found.' });
        }
        res.status(200).json(symptom);
    } catch (error) {
        console.error('Error fetching single symptom:', error);
        res.status(500).json({ error: 'Server error when fetching symptom.' });
    }
};


const updateSymptom = async (req, res) => {
    const { name, description, type } = req.body;

    try {
        const symptom = await Symptom.findByPk(req.params.id);
        if (!symptom) {
            return res.status(404).json({ error: 'Symptom not found.' });
        }

        symptom.name = name || symptom.name;
        symptom.description = description || symptom.description;
        symptom.type = type || symptom.type;

        await symptom.save();
        res.status(200).json(symptom);
    } catch (error) {
        console.error('Error updating symptom:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Symptom name already exists.' });
        }
        res.status(500).json({ error: 'Server error when updating symptom.' });
    }
};


const deleteSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findByPk(req.params.id);
        if (!symptom) {
            return res.status(404).json({ error: 'Symptom not found.' });
        }

        await symptom.destroy();
        res.status(200).json({ message: 'Symptom removed' });
    } catch (error) {
        console.error('Error deleting symptom:', error);
        res.status(500).json({ error: 'Server error when deleting symptom.' });
    }
};


module.exports = {
    createSymptom,
    getSymptoms,
    getSymptom,
    updateSymptom,
    deleteSymptom
};