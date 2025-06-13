// src/controllers/plantController.js
const db = require('../models');
const Plant = db.Plant;

// @desc    Get all plants
// @route   GET /api/plants
// @access  Public (or Private depending on your design)
const getPlants = async (req, res) => {
    try {
        const plants = await Plant.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(plants);
    } catch (error) {
        console.error('Error fetching plants:', error);
        res.status(500).json({ error: 'Server error while fetching plants.' });
    }
};

// @desc    Create a new plant
// @route   POST /api/plants
// @access  Private (Admin only)
const createPlant = async (req, res) => {
    const { name, description, image_url } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Plant name is required.' });
    }

    try {
        const plantExists = await Plant.findOne({ where: { name } });
        if (plantExists) {
            return res.status(409).json({ error: 'Plant with this name already exists.' });
        }

        const plant = await Plant.create({
            name,
            description,
            image_url
        });
        res.status(201).json(plant);
    } catch (error) {
        console.error('Error creating plant:', error);
        res.status(500).json({ error: 'Server error while creating plant.' });
    }
};

module.exports = {
    getPlants,
    createPlant
};