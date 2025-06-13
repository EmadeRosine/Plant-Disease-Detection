// src/controllers/diagnosisController.js
const { Op } = require('sequelize');
const db = require('../models');
const Plant = db.Plant;
const Symptom = db.Symptom;
const Disease = db.Disease;
const User = db.User;
const Diagnosis = db.Diagnosis;
const ExpertValidation = db.ExpertValidation;
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001/predict';

// --- Helper Function: Call AI Service (accepts plant_id and symptom_ids) ---
const callAiService = async (plantId, observedSymptomIds) => {
    try {
        console.log(`[AI Service Call] Attempting to call AI service at ${AI_SERVICE_URL}`);
        console.log(`[AI Service Call] Sending data: Plant ID: ${plantId}, Symptoms: [${observedSymptomIds.join(', ')}]`);

        const aiServiceResponse = await axios.post(
            AI_SERVICE_URL,
            {
                plant_id: plantId,
                symptom_ids: observedSymptomIds
            },
            {
                family: 4 // Explicitly force IPv4 to avoid ECONNREFUSED ::1 issues
            }
        );

        const predictedDiseaseName = aiServiceResponse.data.predicted_disease_name;

        if (predictedDiseaseName) {
            console.log(`[AI Service Call] AI predicted disease name: '${predictedDiseaseName}'`);
            // Find the corresponding disease ID in our database
            const predictedDisease = await Disease.findOne({
                where: { name: predictedDiseaseName }
            });

            if (predictedDisease) {
                console.log(`[AI Service Call] Found matching disease ID: ${predictedDisease.id} for name '${predictedDiseaseName}'`);
                return predictedDisease.id;
            } else {
                console.warn(`[AI Service Call] AI predicted disease '${predictedDiseaseName}' but it was not found in the local database. This prediction will be ignored.`);
                return null;
            }
        } else {
            console.log("[AI Service Call] AI did not return a specific disease prediction (or predicted null).");
            return null;
        }

    } catch (error) {
        console.error('[AI Service Call] Error calling AI service:');
        if (error.response) {
            console.error('  Response Data:', error.response.data);
            console.error('  Response Status:', error.response.status);
            console.error('  Response Headers:', error.response.headers);
            if (error.response.status === 500) {
                console.error('  AI service reported an internal error. Message:', error.response.data.message || 'No specific message.');
            }
        } else if (error.request) {
            console.error('  Request made but no response received. Details:');
            console.error('  Error message:', error.message);
            console.error('  Error code:', error.code);
            console.error('  Request object:', error.request);
            console.error('  Is the AI service running on', AI_SERVICE_URL, '?');
        } else {
            console.error('  Error setting up AI service request:', error.message);
        }
        return null;
    }
};

// --- Helper Function: Rule-Based Preliminary Diagnosis (Expanded Rules) ---
const getPreliminaryDiagnosis = async (plantId, observedSymptomIds) => {
    let diagnosisId = null;

    // --- Tomato-related rules (Plant ID 1) ---
    // Rule 1.1: Early Blight for Tomato
    if (plantId === 1 && observedSymptomIds.includes(1) && observedSymptomIds.includes(2)) { // Leaf Spot (1), Wilting (2)
        const earlyBlight = await Disease.findOne({ where: { name: 'Early Blight' } });
        if (earlyBlight) diagnosisId = earlyBlight.id;
    }
    // Rule 1.2: Late Blight for Tomato
    else if (plantId === 1 && observedSymptomIds.includes(1) && observedSymptomIds.includes(5)) { // Leaf Spot (1), Fruit Lesions (5)
        const lateBlight = await Disease.findOne({ where: { name: 'Late Blight' } });
        if (lateBlight) diagnosisId = lateBlight.id;
    }
    // Rule 1.3: Fusarium Wilt for Tomato
    else if (plantId === 1 && observedSymptomIds.includes(2) && observedSymptomIds.includes(3)) { // Wilting (2), Yellowing Leaves (3)
        const fusariumWilt = await Disease.findOne({ where: { name: 'Fusarium Wilt' } });
        if (fusariumWilt) diagnosisId = fusariumWilt.id;
    }
    // Rule 1.4: Powdery Mildew for Tomato (general symptom)
    else if (plantId === 1 && observedSymptomIds.includes(7)) { // Powdery Mildew (7)
        const powderyMildew = await Disease.findOne({ where: { name: 'Powdery Mildew' } });
        if (powderyMildew) diagnosisId = powderyMildew.id;
    }

    // --- Potato-related rules (Plant ID 2) ---
    // Rule 2.1: Early Blight for Potato
    else if (plantId === 2 && observedSymptomIds.includes(1) && observedSymptomIds.includes(2)) { // Leaf Spot (1), Wilting (2)
        const earlyBlight = await Disease.findOne({ where: { name: 'Early Blight' } });
        if (earlyBlight) diagnosisId = earlyBlight.id;
    }
    // Rule 2.2: Late Blight for Potato
    else if (plantId === 2 && observedSymptomIds.includes(1) && observedSymptomIds.includes(4)) { // Leaf Spot (1), Stem Rot (4)
        const lateBlight = await Disease.findOne({ where: { name: 'Late Blight' } });
        if (lateBlight) diagnosisId = lateBlight.id;
    }
    // Rule 2.3: Powdery Mildew for Potato (general symptom)
    else if (plantId === 2 && observedSymptomIds.includes(7)) { // Powdery Mildew (7)
        const powderyMildew = await Disease.findOne({ where: { name: 'Powdery Mildew' } });
        if (powderyMildew) diagnosisId = powderyMildew.id;
    }

    // --- Corn-related rules (Plant ID 3) ---
    // Rule 3.1: Corn Common Rust
    else if (plantId === 3 && observedSymptomIds.includes(6) && observedSymptomIds.includes(3)) { // Rust Spots (6), Yellowing Leaves (3)
        const cornCommonRust = await Disease.findOne({ where: { name: 'Corn Common Rust' } });
        if (cornCommonRust) diagnosisId = cornCommonRust.id;
    }
    // Rule 3.2: General Yellowing (if not specific rust)
    else if (plantId === 3 && observedSymptomIds.includes(3)) { // Yellowing Leaves (3)
        // Could suggest general nutrient deficiency or early blight if nothing else matches
        const earlyBlight = await Disease.findOne({ where: { name: 'Early Blight' } }); // Use a common one as fallback
        if (earlyBlight) diagnosisId = earlyBlight.id;
    }


    // --- Cucumber-related rules (Plant ID 4) ---
    // Rule 4.1: Cucumber Mosaic Virus
    else if (plantId === 4 && observedSymptomIds.includes(8) && observedSymptomIds.includes(2)) { // Mosaic Pattern (8), Wilting (2)
        const cucumberMosaicVirus = await Disease.findOne({ where: { name: 'Cucumber Mosaic Virus' } });
        if (cucumberMosaicVirus) diagnosisId = cucumberMosaicVirus.id;
    }
    // Rule 4.2: Powdery Mildew for Cucumber
    else if (plantId === 4 && observedSymptomIds.includes(7)) { // Powdery Mildew (7)
        const powderyMildew = await Disease.findOne({ where: { name: 'Powdery Mildew' } });
        if (powderyMildew) diagnosisId = powderyMildew.id;
    }

    // Add more rules as you expand your database and knowledge base.
    // Ensure the disease names here exactly match those in your `seed.js` and `Disease` model.

    return diagnosisId;
};

// @desc    Submit a new diagnosis request
// @route   POST /api/diagnoses
// @access  Private (Farmer, Expert, Admin)
const submitDiagnosis = async (req, res) => {
    const { plant_id, observed_symptom_ids, farmer_notes } = req.body;
    const farmer_id = req.user.id;

    if (!plant_id || !observed_symptom_ids || observed_symptom_ids.length === 0) {
        return res.status(400).json({ error: 'Please provide plant_id and at least one observed_symptom_id.' });
    }

    try {
        const plantExists = await Plant.findByPk(plant_id);
        if (!plantExists) {
            return res.status(404).json({ error: 'Plant not found.' });
        }

        const symptomsExist = await Symptom.findAll({
            where: {
                id: { [Op.in]: observed_symptom_ids }
            }
        });
        if (symptomsExist.length !== observed_symptom_ids.length) {
            return res.status(404).json({ error: 'One or more observed symptoms not found.' });
        }

        const preliminaryDiagnosisId = await getPreliminaryDiagnosis(plant_id, observed_symptom_ids);
        console.log(`[Diagnosis Submit] Preliminary Diagnosis ID: ${preliminaryDiagnosisId}`);

        const aiSuggestedDiagnosisId = await callAiService(plant_id, observed_symptom_ids);
        console.log(`[Diagnosis Submit] AI Suggested Diagnosis ID: ${aiSuggestedDiagnosisId}`);

        const diagnosis = await Diagnosis.create({
            plant_id,
            farmer_id,
            observed_symptom_ids,
            farmer_notes,
            preliminary_diagnosis_id: preliminaryDiagnosisId,
            ai_suggested_diagnosis_id: aiSuggestedDiagnosisId,
            status: 'pending_review'
        });

        res.status(201).json(diagnosis);

    } catch (error) {
        console.error('Error submitting diagnosis:', error);
        res.status(500).json({ error: 'Server error while submitting diagnosis.' });
    }
};

/// agri-diagnosis-app/backend/src/controllers/diagnosisController.js

// ... (other imports and functions like callAiService, getPreliminaryDiagnosis, submitDiagnosis remain the same) ...

// @desc    Get all diagnosis requests
// @route   GET /api/diagnoses
// @access  Private (Expert, Admin) - Farmers can only see their own via /api/users/:id/diagnoses
const getDiagnoses = async (req, res) => {
    try {
        // Fetch all diagnoses with their associated plant, farmer, disease, and expert validation info
        let diagnoses = await Diagnosis.findAll({ // Use 'let' because we will modify the 'diagnoses' array
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'aiSuggestedDiagnosis', attributes: ['id', 'name'], required: false },
                {
                    model: ExpertValidation,
                    as: 'expertValidation',
                    include: [
                        { model: User, as: 'expert', attributes: ['id', 'username'] },
                        { model: Disease, as: 'expertDiagnosis', attributes: ['id', 'name'], required: false }
                    ],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']] // Order by newest first
        });

        // For each diagnosis, manually fetch the observed symptom details (names)
        // observed_symptom_ids is an ARRAY of integers, so we need a separate query for them
        diagnoses = await Promise.all(diagnoses.map(async (diagnosis) => {
            if (diagnosis.observed_symptom_ids && diagnosis.observed_symptom_ids.length > 0) {
                const observedSymptoms = await Symptom.findAll({
                    where: {
                        id: { [Op.in]: diagnosis.observed_symptom_ids } // Find symptoms whose IDs are in the array
                    },
                    attributes: ['id', 'name'] // Only fetch ID and name to keep payload light
                });
                // Attach the full symptom objects (or just their names) to the diagnosis object
                // We use diagnosis.dataValues to modify the plain data object that Sequelize returns
                diagnosis.dataValues.ObservedSymptoms = observedSymptoms;
            } else {
                diagnosis.dataValues.ObservedSymptoms = []; // Ensure it's an empty array if no symptoms
            }
            return diagnosis;
        }));

        res.status(200).json(diagnoses);
    } catch (error) {
        console.error('Error fetching diagnoses:', error);
        res.status(500).json({ error: 'Server error while fetching diagnoses.' });
    }
};

// @desc    Get a single diagnosis request by ID
// @route   GET /api/diagnoses/:id
// @access  Private (Expert, Admin, or Farmer if their own diagnosis)
const getDiagnosis = async (req, res) => {
    try {
        // Fetch the single diagnosis with all its associated data
        let diagnosis = await Diagnosis.findByPk(req.params.id, { // Use 'let'
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'aiSuggestedDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'finalDiagnosis', attributes: ['id', 'name'], required: false },
                {
                    model: ExpertValidation,
                    as: 'expertValidation',
                    include: [
                        { model: User, as: 'expert', attributes: ['id', 'username'] },
                        { model: Disease, as: 'expertDiagnosis', attributes: ['id', 'name'], required: false }
                    ],
                    required: false
                }
            ]
        });

        if (!diagnosis) {
            return res.status(404).json({ error: 'Diagnosis not found.' });
        }

        // Authorization check for farmers to only view their own diagnoses
        if (req.user.role === 'farmer' && diagnosis.farmer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: You can only view your own diagnoses.' });
        }

        // Manually fetch and attach observed symptom details for this single diagnosis
        if (diagnosis.observed_symptom_ids && diagnosis.observed_symptom_ids.length > 0) {
            const observedSymptoms = await Symptom.findAll({
                where: {
                    id: { [Op.in]: diagnosis.observed_symptom_ids }
                },
                attributes: ['id', 'name']
            });
            diagnosis.dataValues.ObservedSymptoms = observedSymptoms;
        } else {
            diagnosis.dataValues.ObservedSymptoms = [];
        }


        res.status(200).json(diagnosis);
    } catch (error) {
        console.error('Error fetching single diagnosis:', error);
        res.status(500).json({ error: 'Server error while fetching diagnosis.' });
    }
};


// @desc    Validate a diagnosis request (by an expert)
// @route   PUT /api/diagnoses/:id/validate
// @access  Private (Expert, Admin)
const validateDiagnosis = async (req, res) => {
    const { expert_diagnosis_id, validation_status, expert_notes } = req.body;
    const diagnosisId = req.params.id;
    const expert_id = req.user.id;

    if (!expert_diagnosis_id || !validation_status) {
        return res.status(400).json({ error: 'Please provide expert_diagnosis_id and validation_status.' });
    }
    if (!['validated', 'rejected', 'needs_more_info'].includes(validation_status)) {
        return res.status(400).json({ error: 'Invalid validation_status. Must be "validated", "rejected", or "needs_more_info".' });
    }

    try {
        const diagnosis = await Diagnosis.findByPk(diagnosisId);
        if (!diagnosis) {
            return res.status(404).json({ error: 'Diagnosis request not found.' });
        }

        const diseaseExists = await Disease.findByPk(expert_diagnosis_id);
        if (!diseaseExists) {
            return res.status(404).json({ error: 'Expert provided an invalid disease ID.' });
        }

        const previousDiagnosisId = diagnosis.ai_suggested_diagnosis_id || diagnosis.preliminary_diagnosis_id;

        diagnosis.status = validation_status;
        diagnosis.final_diagnosis_id = expert_diagnosis_id;
        await diagnosis.save();

        const [expertValidation, created] = await ExpertValidation.findOrCreate({
            where: { diagnosis_id: diagnosisId },
            defaults: {
                expert_id: expert_id,
                new_diagnosis_id: expert_diagnosis_id,
                validation_status: validation_status,
                notes: expert_notes,
                previous_diagnosis_id: previousDiagnosisId
            }
        });

        if (!created) {
            expertValidation.expert_id = expert_id;
            expertValidation.new_diagnosis_id = expert_diagnosis_id;
            expertValidation.validation_status = validation_status;
            expertValidation.notes = expert_notes;
            expertValidation.validated_at = db.Sequelize.literal('CURRENT_TIMESTAMP');
            await expertValidation.save();
        }

        const updatedDiagnosis = await Diagnosis.findByPk(diagnosisId, {
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'aiSuggestedDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'finalDiagnosis', attributes: ['id', 'name'], required: false },
                {
                    model: ExpertValidation,
                    as: 'expertValidation',
                    include: [
                        { model: User, as: 'expert', attributes: ['id', 'username'] },
                        { model: Disease, as: 'expertDiagnosis', attributes: ['id', 'name'], required: false }
                    ],
                    required: false
                }
            ]
        });

        res.status(200).json(updatedDiagnosis);

    } catch (error) {
        console.error('Error validating diagnosis:', error);
        res.status(500).json({ error: 'Server error while validating diagnosis.' });
    }
};

// @desc    Get diagnoses for a specific farmer
// @route   GET /api/users/:userId/diagnoses
// @access  Private (Farmer can get their own, Expert/Admin can get any)
const getDiagnosesByFarmer = async (req, res) => {
    const targetUserId = parseInt(req.params.userId, 10);

    if (req.user.role === 'farmer' && req.user.id !== targetUserId) {
        return res.status(403).json({ error: 'Access denied: You can only view your own diagnoses.' });
    }

    try {
        const farmerExists = await User.findByPk(targetUserId);
        if (!farmerExists) {
            return res.status(404).json({ error: 'Farmer not found.' });
        }

        const diagnoses = await Diagnosis.findAll({
            where: { farmer_id: targetUserId },
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'aiSuggestedDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'finalDiagnosis', attributes: ['id', 'name'], required: false },
                {
                    model: ExpertValidation,
                    as: 'expertValidation',
                    include: [
                        { model: User, as: 'expert', attributes: ['id', 'username'] },
                        { model: Disease, as: 'expertDiagnosis', attributes: ['id', 'name'], required: false }
                    ],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(diagnoses);
    } catch (error) {
        console.error('Error fetching farmer diagnoses:', error);
        res.status(500).json({ error: 'Server error while fetching farmer diagnoses.' });
    }
};

module.exports = {
    submitDiagnosis,
    getDiagnoses,
    getDiagnosis,
    validateDiagnosis,
    getDiagnosesByFarmer
};