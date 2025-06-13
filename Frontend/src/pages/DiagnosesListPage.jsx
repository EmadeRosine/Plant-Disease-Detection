import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';
import './DiagnosisList.css';

const DiagnosesListPage = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        let res;
        // Fetch specific user's diagnoses if farmer, else all diagnoses
        if (user.role === 'farmer') {
          res = await api.get(`/diagnoses/user/${user.id}`);
        } else {
          res = await api.get('/diagnoses');
        }
        setDiagnoses(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch diagnoses.');
        console.error(err);
      }
    };
    if (user) {
        fetchDiagnoses();
    } else {
        navigate('/login');
    }
  }, [user, navigate]);

  // Helper function to apply status-specific CSS classes
  const getStatusClass = (status) => {
    switch (status) {
        case 'pending_review': return 'status-pending';
        case 'validated': return 'status-validated';
        case 'rejected': return 'status-rejected';
        case 'needs_more_info': return 'status-needs_more_info';
        default: return '';
    }
  }

  return (
    <div className="container">
      <h2>{user?.role === 'farmer' ? 'My Diagnosis Requests' : 'All Diagnosis Requests'}</h2>
      {error && <p className="error-message">{error}</p>}
      {diagnoses.length === 0 && !error ? (
        <p>No diagnoses found.</p>
      ) : (
        <div className="table-responsive"> 
          <table className="diagnoses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plant</th>
                <th>Farmer</th>
                <th>Observed Symptoms</th>
                <th>AI Suggestion</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.map((diagnosis) => (
                <tr key={diagnosis.id}>
                  <td>{diagnosis.id}</td>
                  <td>{diagnosis.plant ? diagnosis.plant.name : 'N/A'}</td>
                  <td>{diagnosis.farmer ? diagnosis.farmer.username : 'N/A'}</td>
                  <td>
                    {diagnosis.ObservedSymptoms && diagnosis.ObservedSymptoms.length > 0
                      ? diagnosis.ObservedSymptoms.map(s => s.name).join(', ')
                      : 'N/A'}
                  </td>
                  <td>{diagnosis.aiSuggestedDiagnosis ? diagnosis.aiSuggestedDiagnosis.name : 'Pending AI'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(diagnosis.status)}`}>
                      {diagnosis.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{new Date(diagnosis.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/diagnoses/${diagnosis.id}`} className="button-link">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiagnosesListPage;