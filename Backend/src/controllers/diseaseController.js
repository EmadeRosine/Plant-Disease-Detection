
const db = require('../models');
const Disease = db.Disease;
const Symptom = db.Symptom;
const DiseaseSymptom = db.DiseaseSymptom;


const getDiseases = async (req, res) => {
    try {
        const diseases = await Disease.findAll({
            include: [{
                model: Symptom,
                as: 'Symptoms',
                through: { attributes: ['severity_level'] },
                attributes: ['id', 'name']
            }],
            order: [['name', 'ASC']]
        });
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Error fetching diseases:', error);
        res.status(500).json({ error: 'Server error while fetching diseases.' });
    }
};


const createDisease = async (req, res) => {
    const { name, description, symptoms_description, treatment_recommendations, symptom_ids } = req.body;

    if (!name || !symptom_ids || !Array.isArray(symptom_ids) || symptom_ids.length === 0) {
        return res.status(400).json({ error: 'Disease name and at least one symptom ID are required.' });
    }

    try {
        const diseaseExists = await Disease.findOne({ where: { name } });
        if (diseaseExists) {
            return res.status(409).json({ error: 'Disease with this name already exists.' });
        }

        const symptoms = await Symptom.findAll({
            where: { id: symptom_ids }
        });

        if (symptoms.length !== symptom_ids.length) {
            return res.status(404).json({ error: 'One or more provided symptom IDs not found.' });
        }

        const disease = await Disease.create({
            name,
            description,
            symptoms_description,
            treatment_recommendations
        });

       
        await disease.addSymptoms(symptoms); 

        const createdDisease = await Disease.findByPk(disease.id, {
            include: [{
                model: Symptom,
                as: 'Symptoms',
                through: { attributes: ['severity_level'] },
                attributes: ['id', 'name']
            }]
        });

        res.status(201).json(createdDisease);
    } catch (error) {
        console.error('Error creating disease:', error);
        res.status(500).json({ error: 'Server error while creating disease.' });
    }
};

module.exports = {
    getDiseases,
    createDisease
};