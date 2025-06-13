// src/pages/admin/ManageDiseasesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; // Corrected import path
import { useAuth } from '../../auth/AuthContext'; // Corrected import path

const ManageDiseasesPage = () => {
    const [diseases, setDiseases] = useState([]);
    const [symptoms, setSymptoms] = useState([]); // All available symptoms
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newSymptomsDescription, setNewSymptomsDescription] = useState('');
    const [newTreatmentRecommendations, setNewTreatmentRecommendations] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState([]); // Symptoms for the new disease
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchAllData = async () => {
        try {
            const [diseasesRes, symptomsRes] = await Promise.all([
                api.get('/diseases'),
                api.get('/symptoms')
            ]);
            setDiseases(diseasesRes.data);
            setSymptoms(symptomsRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch data.');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        } else {
            fetchAllData();
        }
    }, [user, navigate]);

    const handleSymptomChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedSymptoms((prev) =>
          prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
        );
    };

    const handleCreateDisease = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newName || selectedSymptoms.length === 0) {
            setError('Disease name and at least one associated symptom are required.');
            return;
        }

        try {
            await api.post('/diseases', {
                name: newName,
                description: newDescription,
                symptoms_description: newSymptomsDescription,
                treatment_recommendations: newTreatmentRecommendations,
                symptom_ids: selectedSymptoms
            });
            setSuccess('Disease created successfully!');
            setNewName('');
            setNewDescription('');
            setNewSymptomsDescription('');
            setNewTreatmentRecommendations('');
            setSelectedSymptoms([]);
            fetchAllData(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create disease.');
        }
    };

    if (!user || user.role !== 'admin') return <div className="container">Access Denied</div>;

    return (
        <div className="container">
            <h2>Manage Diseases</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <h3>Add New Disease</h3>
            <form onSubmit={handleCreateDisease}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div>
                    <label>Description (Optional):</label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows="2"></textarea>
                </div>
                <div>
                    <label>Symptoms Description (Optional):</label>
                    <textarea value={newSymptomsDescription} onChange={(e) => setNewSymptomsDescription(e.target.value)} rows="2"></textarea>
                </div>
                <div>
                    <label>Treatment Recommendations (Optional):</label>
                    <textarea value={newTreatmentRecommendations} onChange={(e) => setNewTreatmentRecommendations(e.target.value)} rows="2"></textarea>
                </div>
                <div>
                    <label>Associated Symptoms:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {symptoms.map((symptom) => (
                            <label key={symptom.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input
                                    type="checkbox"
                                    value={symptom.id}
                                    checked={selectedSymptoms.includes(symptom.id)}
                                    onChange={handleSymptomChange}
                                />
                                {symptom.name}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit">Add Disease</button>
            </form>

            <h3 style={{marginTop: '30px'}}>Existing Diseases</h3>
            {diseases.length === 0 ? (
                <p>No diseases defined.</p>
            ) : (
                <div>
                    {diseases.map((disease) => (
                        <div key={disease.id} className="card">
                            <p><strong>ID:</strong> {disease.id}</p>
                            <p><strong>Name:</strong> {disease.name}</p>
                            <p><strong>Description:</strong> {disease.description || 'N/A'}</p>
                            <p><strong>Associated Symptoms:</strong> {disease.Symptoms && disease.Symptoms.length > 0 ? disease.Symptoms.map(s => s.name).join(', ') : 'N/A'}</p>
                            <p><strong>Symptoms Description:</strong> {disease.symptoms_description || 'N/A'}</p>
                            <p><strong>Treatment:</strong> {disease.treatment_recommendations || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageDiseasesPage;