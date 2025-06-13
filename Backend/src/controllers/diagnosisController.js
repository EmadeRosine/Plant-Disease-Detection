// src/controllers/diagnosisController.js
const { Op } = require('sequelize'); // For 'IN' operator
const db = require('../models');
const Plant = db.Plant;
const Symptom = db.Symptom;
const Disease = db.Disease;
const User = db.User;
const Diagnosis = db.Diagnosis;
const ExpertValidation = db.ExpertValidation;
const axios = require('axios'); // For making HTTP requests to the AI service

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001/predict';

// --- Helper Function: Call AI Service ---
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
        family: 4 // This forces Axios to use IPv4
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
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('  Response Data:', error.response.data);
            console.error('  Response Status:', error.response.status);
            console.error('  Response Headers:', error.response.headers);
            if (error.response.status === 500) {
                console.error('  AI service reported an internal error. Message:', error.response.data.message || 'No specific message.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
            console.error('  Request made but no response received. Details:');
            console.error('  Error message:', error.message); // This will show the actual network error (e.g., ECONNREFUSED)
            console.error('  Error code:', error.code);     // This will show the error code (e.g., ECONNREFUSED)
            console.error('  Request object:', error.request); // Log the request object itself for more info
            console.error('  Is the AI service running on', AI_SERVICE_URL, '?');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('  Error setting up AI service request:', error.message);
        }
        return null;
    }
};

// --- Helper Function: Rule-Based Preliminary Diagnosis (Example) ---
const getPreliminaryDiagnosis = async (plantId, observedSymptomIds) => {
    // This is a simple, example rule-based system.
    // You can expand this logic significantly.
    // Example: If Plant is 'Tomato' (ID 1) and symptoms include 'Leaf Spot' (ID 1) and 'Wilting' (ID 2)
    if (plantId === 1 && observedSymptomIds.includes(1) && observedSymptomIds.includes(2)) {
        const tomatoBlight = await Disease.findOne({ where: { name: 'Tomato Blight' } });
        if (tomatoBlight) {
            return tomatoBlight.id;
        }
    }
    // No preliminary diagnosis if rules don't match
    return null;
};

// --- Controller Functions ---

// @desc    Submit a new diagnosis request
// @route   POST /api/diagnoses
// @access  Private (Farmer, Expert, Admin)
const submitDiagnosis = async (req, res) => {
    const { plant_id, observed_symptom_ids, farmer_notes } = req.body;
    const farmer_id = req.user.id; // User ID from authenticated request

    // Basic input validation
    if (!plant_id || !observed_symptom_ids || observed_symptom_ids.length === 0) {
        return res.status(400).json({ error: 'Please provide plant_id and at least one observed_symptom_id.' });
    }

    try {
        // Validate if plant exists
        const plantExists = await Plant.findByPk(plant_id);
        if (!plantExists) {
            return res.status(404).json({ error: 'Plant not found.' });
        }

        // Validate if all observed symptoms exist
        const symptomsExist = await Symptom.findAll({
            where: {
                id: { [Op.in]: observed_symptom_ids }
            }
        });
        if (symptomsExist.length !== observed_symptom_ids.length) {
            return res.status(404).json({ error: 'One or more observed symptoms not found.' });
        }

        // Get preliminary diagnosis based on rules
        const preliminaryDiagnosisId = await getPreliminaryDiagnosis(plant_id, observed_symptom_ids);
        console.log(`[Diagnosis Submit] Preliminary Diagnosis ID: ${preliminaryDiagnosisId}`);

        // Call AI service for suggestion
        const aiSuggestedDiagnosisId = await callAiService(plant_id, observed_symptom_ids);
        console.log(`[Diagnosis Submit] AI Suggested Diagnosis ID: ${aiSuggestedDiagnosisId}`);

        // Create the diagnosis record
        const diagnosis = await Diagnosis.create({
            plant_id,
            farmer_id,
            observed_symptom_ids,
            farmer_notes,
            preliminary_diagnosis_id: preliminaryDiagnosisId,
            ai_suggested_diagnosis_id: aiSuggestedDiagnosisId,
            status: 'pending_review' // Initial status
        });

        res.status(201).json(diagnosis);

    } catch (error) {
        console.error('Error submitting diagnosis:', error);
        res.status(500).json({ error: 'Server error while submitting diagnosis.' });
    }
};

// @desc    Get all diagnosis requests
// @route   GET /api/diagnoses
// @access  Private (Expert, Admin) - Farmers can only see their own via /api/users/:id/diagnoses
const getDiagnoses = async (req, res) => {
    try {
        const diagnoses = await Diagnosis.findAll({
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false }, // Use required: false for LEFT JOIN
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
        const diagnosis = await Diagnosis.findByPk(req.params.id, {
            include: [
                { model: Plant, as: 'plant', attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'farmer', attributes: ['id', 'username'] },
                { model: Disease, as: 'preliminaryDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'aiSuggestedDiagnosis', attributes: ['id', 'name'], required: false },
                { model: Disease, as: 'finalDiagnosis', attributes: ['id', 'name'], required: false }, // Final diagnosis after validation
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

        // Authorize: Expert/Admin can see any, Farmer can only see their own
        if (req.user.role === 'farmer' && diagnosis.farmer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: You can only view your own diagnoses.' });
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
    const expert_id = req.user.id; // Expert ID from authenticated request

    // Input validation
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

        // Determine the previous diagnosis ID for ExpertValidation record
        const previousDiagnosisId = diagnosis.ai_suggested_diagnosis_id || diagnosis.preliminary_diagnosis_id;

        // Update diagnosis status and final diagnosis
        diagnosis.status = validation_status;
        diagnosis.final_diagnosis_id = expert_diagnosis_id; // Set final diagnosis
        await diagnosis.save();

        // Find or create ExpertValidation record
        const [expertValidation, created] = await ExpertValidation.findOrCreate({
            where: { diagnosis_id: diagnosisId },
            defaults: {
                expert_id: expert_id,
                new_diagnosis_id: expert_diagnosis_id,
                validation_status: validation_status,
                notes: expert_notes,
                previous_diagnosis_id: previousDiagnosisId // Record what was there before
            }
        });

        // If validation record already existed, update it
        if (!created) {
            expertValidation.expert_id = expert_id;
            expertValidation.new_diagnosis_id = expert_diagnosis_id;
            expertValidation.validation_status = validation_status;
            expertValidation.notes = expert_notes;
            expertValidation.validated_at = db.Sequelize.literal('CURRENT_TIMESTAMP'); // Update timestamp
            await expertValidation.save();
        }

        // Fetch the updated diagnosis with full details for response
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
    const targetUserId = parseInt(req.params.userId, 10); // Ensure it's an integer

    // Authorization check: Farmers can only request their own diagnoses
    // Experts/Admins can request any farmer's diagnoses
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


// Export all controller functions as an object
module.exports = {
    submitDiagnosis,
    getDiagnoses,
    getDiagnosis,
    validateDiagnosis,
    getDiagnosesByFarmer // Export the new function
};