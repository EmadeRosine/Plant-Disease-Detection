
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext'; 

const SubmitDiagnosisPage = () => {
  const [plants, setPlants] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plantsRes = await api.get('/plants');
        setPlants(plantsRes.data);
        const symptomsRes = await api.get('/symptoms');
        setSymptoms(symptomsRes.data);
      } catch (err) {
        setError('Failed to load data for form.');
        console.error(err);
      }
    };
    if (user) {
        fetchData();
    } else {
        navigate('/login');
    }
  }, [user, navigate]);

  const handleSymptomChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedSymptoms((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPlant || selectedSymptoms.length === 0) {
      setError('Please select a plant and at least one symptom.');
      return;
    }

    try {
      await api.post('/diagnoses', {
        plant_id: parseInt(selectedPlant),
        observed_symptom_ids: selectedSymptoms,
        farmer_notes: farmerNotes,
      });
      setSuccess('Diagnosis submitted successfully!');
      setSelectedPlant('');
      setSelectedSymptoms([]);
      setFarmerNotes('');
      navigate('/diagnoses'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit diagnosis.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Submit New Diagnosis Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Plant:</label>
          <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} required>
            <option value="">Select a Plant</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>{plant.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Observed Symptoms:</label>
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
        <div>
          <label>Farmer Notes (Optional):</label>
          <textarea value={farmerNotes} onChange={(e) => setFarmerNotes(e.target.value)} rows="4"></textarea>
        </div>
        <button type="submit">Submit Diagnosis</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default SubmitDiagnosisPage;