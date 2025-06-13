import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';

const DiagnosisDetailPage = () => {
    const { id } = useParams(); 
    const [diagnosis, setDiagnosis] = useState(null); 
    const [diseasesForValidation, setDiseasesForValidation] = useState([]);
    const [expertDiagnosisId, setExpertDiagnosisId] = useState(''); 
    const [validationStatus, setValidationStatus] = useState(''); 
    const [expertNotes, setExpertNotes] = useState(''); 
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState('');
    const { user } = useAuth(); 
    const navigate = useNavigate(); 

 
    const fetchDiagnosis = async () => {
        try {
            const res = await api.get(`/diagnoses/${id}`);
            setDiagnosis(res.data); 
            
            if (res.data.expertValidation) {
                setExpertDiagnosisId(res.data.expertValidation.new_diagnosis_id || '');
                setValidationStatus(res.data.expertValidation.validation_status || '');
                setExpertNotes(res.data.expertValidation.notes || '');
            } else {
              
                setExpertDiagnosisId(res.data.aiSuggestedDiagnosis?.id || res.data.preliminaryDiagnosis?.id || '');
                setValidationStatus('pending_review');
                setExpertNotes('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch diagnosis details.');
            console.error(err);
        }
    };

    // Function to fetch all available diseases for the expert's validation dropdown
    const fetchDiseasesForValidation = async () => {
        try {
            const diseasesRes = await api.get('/diseases'); 
            setDiseasesForValidation(diseasesRes.data); 
        } catch (err) {
            setError('Failed to load diseases for validation.');
            console.error(err);
        }
    };

    
    useEffect(() => {
        // If user is not logged in, redirect to login page
        if (!user) {
            navigate('/login');
            return;
        }
        // Fetch diagnosis details
        fetchDiagnosis();
        
        if (user.role === 'expert' || user.role === 'admin') {
            fetchDiseasesForValidation();
        }
    }, [id, user, navigate]); 

    // Handler for submitting the expert validation form
    const handleValidationSubmit = async (e) => {
        e.preventDefault(); 
        setError('');     
        setSuccess('');    

      
        if (!expertDiagnosisId || !validationStatus) {
            setError('Please select an expert diagnosis and validation status.');
            return;
        }

        try {
            // Send PUT request to the backend's validate endpoint
            const res = await api.put(`/diagnoses/${id}/validate`, {
                expert_diagnosis_id: parseInt(expertDiagnosisId), 
                validation_status: validationStatus,
                expert_notes: expertNotes,
            });
            setSuccess('Diagnosis validated successfully!'); 
            setDiagnosis(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to validate diagnosis.');
            console.error(err);
        }
    };

    
    if (!diagnosis) return <div className="container">Loading diagnosis...</div>;

    // Helper function to apply CSS class based on diagnosis status
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending_review': return 'status-pending';
            case 'validated': return 'status-validated';
            case 'rejected': return 'status-rejected';
            case 'needs_more_info': return 'status-needs_more_info';
            default: return '';
        }
    }

    // Determine if the validation form should be displayed to the current user
    const canValidate = (user?.role === 'expert' || user?.role === 'admin') && diagnosis.status !== 'validated';

    return (
        <div className="container">
            <h2>Diagnosis Details (ID: {diagnosis.id})</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            {/* Displaying Diagnosis Information */}
            <div className="card">
                <p><strong>Plant:</strong> {diagnosis.plant?.name || 'N/A'}</p>
                <p><strong>Farmer:</strong> {diagnosis.farmer?.username || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={getStatusClass(diagnosis.status)}>{diagnosis.status.replace(/_/g, ' ')}</span></p>
                <p><strong>Submitted:</strong> {new Date(diagnosis.created_at).toLocaleDateString()}</p>
                <p><strong>Farmer Notes:</strong> {diagnosis.farmer_notes || 'N/A'}</p>
                <p><strong>Observed Symptoms (IDs):</strong> {diagnosis.observed_symptom_ids ? diagnosis.observed_symptom_ids.join(', ') : 'N/A'}</p>
                <p><strong>Preliminary Diagnosis:</strong> {diagnosis.preliminaryDiagnosis?.name || 'N/A'}</p>
                <p><strong>AI Suggested Diagnosis:</strong> {diagnosis.aiSuggestedDiagnosis?.name || 'N/A'}</p>
                <p><strong>Final Diagnosis (Expert):</strong> {diagnosis.finalDiagnosis?.name || 'N/A'}</p>

                {/* Display Expert Validation Details if available */}
                {diagnosis.expertValidation && (
                    <>
                        <h3>Expert Validation Details</h3>
                        <p><strong>Expert:</strong> {diagnosis.expertValidation.expert?.username || 'N/A'}</p>
                        <p><strong>Validation Status:</strong> {diagnosis.expertValidation.validation_status}</p>
                        <p><strong>Expert's Notes:</strong> {diagnosis.expertValidation.notes || 'N/A'}</p>
                        <p><strong>Validated At:</strong> {new Date(diagnosis.expertValidation.validated_at).toLocaleDateString()}</p>
                    </>
                )}
            </div>

            {/* Expert Validation Form (conditionally rendered) */}
            {canValidate && (
                <div className="container" style={{ marginTop: '20px' }}>
                    <h3>Validate Diagnosis</h3>
                    <form onSubmit={handleValidationSubmit}>
                        <div>
                            <label>Expert's Diagnosis (Disease):</label>
                            <select value={expertDiagnosisId} onChange={(e) => setExpertDiagnosisId(e.target.value)} required>
                                <option value="">Select a Disease</option>
                                {diseasesForValidation.map((disease) => (
                                    <option key={disease.id} value={disease.id}>{disease.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Validation Status:</label>
                            <select value={validationStatus} onChange={(e) => setValidationStatus(e.target.value)} required>
                                <option value="">Select Status</option>
                                <option value="validated">Validated</option>
                                <option value="rejected">Rejected</option>
                                <option value="needs_more_info">Needs More Info</option>
                            </select>
                        </div>
                        <div>
                            <label>Expert's Notes:</label>
                            <textarea value={expertNotes} onChange={(e) => setExpertNotes(e.target.value)} rows="3"></textarea>
                        </div>
                        <button type="submit">Submit Validation</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DiagnosisDetailPage;