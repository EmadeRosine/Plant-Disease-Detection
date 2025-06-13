// src/pages/admin/ManageSymptomsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; // Corrected import path
import { useAuth } from '../../auth/AuthContext'; // Corrected import path

const ManageSymptomsPage = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newType, setNewType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchSymptoms = async () => {
        try {
            const res = await api.get('/symptoms');
            setSymptoms(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch symptoms.');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        } else {
            fetchSymptoms();
        }
    }, [user, navigate]);

    const handleCreateSymptom = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/symptoms', { name: newName, description: newDescription, type: newType });
            setSuccess('Symptom created successfully!');
            setNewName('');
            setNewDescription('');
            setNewType('');
            fetchSymptoms(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create symptom.');
        }
    };

    if (!user || user.role !== 'admin') return <div className="container">Access Denied</div>;

    return (
        <div className="container">
            <h2>Manage Symptoms</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <h3>Add New Symptom</h3>
            <form onSubmit={handleCreateSymptom}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div>
                    <label>Description (Optional):</label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows="2"></textarea>
                </div>
                <div>
                    <label>Type (e.g., Leaf, Stem, Fruit - Optional):</label>
                    <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} />
                </div>
                <button type="submit">Add Symptom</button>
            </form>

            <h3 style={{marginTop: '30px'}}>Existing Symptoms</h3>
            {symptoms.length === 0 ? (
                <p>No symptoms defined.</p>
            ) : (
                <div>
                    {symptoms.map((symptom) => (
                        <div key={symptom.id} className="card">
                            <p><strong>ID:</strong> {symptom.id}</p>
                            <p><strong>Name:</strong> {symptom.name}</p>
                            <p><strong>Description:</strong> {symptom.description || 'N/A'}</p>
                            <p><strong>Type:</strong> {symptom.type || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageSymptomsPage;