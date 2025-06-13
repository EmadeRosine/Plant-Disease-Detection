
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; 
import { useAuth } from '../../auth/AuthContext'; 

const ManagePlantsPage = () => {
    const [plants, setPlants] = useState([]);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState(''); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchPlants = async () => {
        try {
            const res = await api.get('/plants');
            setPlants(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch plants.');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        } else {
            fetchPlants();
        }
    }, [user, navigate]);

    const handleCreatePlant = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/plants', { name: newName, description: newDescription, image_url: newImageUrl });
            setSuccess('Plant created successfully!');
            setNewName('');
            setNewDescription('');
            setNewImageUrl(''); 
            fetchPlants(); 
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create plant.');
        }
    };

    if (!user || user.role !== 'admin') return <div className="container">Access Denied</div>;

    return (
        <div className="container">
            <h2>Manage Plants</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <h3>Add New Plant</h3>
            <form onSubmit={handleCreatePlant}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div>
                    <label>Description (Optional):</label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows="2"></textarea>
                </div>
                <div>
                    <label>Image URL (Optional):</label>
                    <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                </div>
                <button type="submit">Add Plant</button>
            </form>

            <h3 style={{marginTop: '30px'}}>Existing Plants</h3>
            {plants.length === 0 ? (
                <p>No plants defined.</p>
            ) : (
                <div>
                    {plants.map((plant) => (
                        <div key={plant.id} className="card">
                            <p><strong>ID:</strong> {plant.id}</p>
                            <p><strong>Name:</strong> {plant.name}</p>
                            <p><strong>Description:</strong> {plant.description || 'N/A'}</p>
                            <p><strong>Image:</strong> {plant.image_url ? <a href={plant.image_url} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagePlantsPage;