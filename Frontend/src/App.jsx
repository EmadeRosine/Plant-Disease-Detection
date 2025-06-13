// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Context for User Authentication ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, role, token }

  useEffect(() => {
    // Try to load user from localStorage on app start
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- API Service (axios instance) ---
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL, // Get base URL from .env
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Components ---

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <span>Agri-Diagnosis System</span>
      <div>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/diagnoses">Diagnoses</Link>
            {user.role === 'farmer' && <Link to="/submit-diagnosis">Submit New</Link>}
            {user.role === 'admin' && <Link to="/admin">Admin</Link>} {/* Placeholder for admin routes */}
            <span>Hello, {user.username} ({user.role})</span>
            <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="container">
      <h2>Welcome to the Agri-Diagnosis System</h2>
      {user ? (
        <p>You are logged in as {user.username} ({user.role}).</p>
      ) : (
        <p>Please login or register to use the system.</p>
      )}
      <p>This application helps farmers submit plant diagnosis requests, gets AI suggestions, and allows experts to validate them.</p>
    </div>
  );
};

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/users/register', { username, password, role });
      setSuccess('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="farmer">Farmer</option>
            <option value="expert">Expert</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users/login', { username, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

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
      navigate('/diagnoses'); // Redirect to diagnoses list
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

const DiagnosesListPage = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        let res;
        if (user.role === 'farmer') {
          // Farmers can only see their own diagnoses
          res = await api.get(`/diagnoses/user/${user.id}`);
        } else {
          // Experts and Admins see all diagnoses
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
        <div>
          {diagnoses.map((diagnosis) => (
            <div key={diagnosis.id} className="card">
              <h3>Diagnosis ID: {diagnosis.id}</h3>
              <p><strong>Plant:</strong> {diagnosis.plant ? diagnosis.plant.name : 'N/A'}</p>
              <p><strong>Farmer:</strong> {diagnosis.farmer ? diagnosis.farmer.username : 'N/A'}</p>
              <p><strong>AI Suggestion:</strong> {diagnosis.aiSuggestedDiagnosis ? diagnosis.aiSuggestedDiagnosis.name : 'Pending AI'}</p> {/* ADDED THIS LINE */}
              <p><strong>Status:</strong> <span className={getStatusClass(diagnosis.status)}>{diagnosis.status.replace(/_/g, ' ')}</span></p>
              <p><strong>Submitted:</strong> {new Date(diagnosis.created_at).toLocaleDateString()}</p>
              <Link to={`/diagnoses/${diagnosis.id}`}><button>View Details</button></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DiagnosisDetailPage = () => {
    const { id } = useParams();
    const [diagnosis, setDiagnosis] = useState(null);
    const [plants, setPlants] = useState([]); // For dropdown in validation
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
            setExpertDiagnosisId(res.data.finalDiagnosis?.id || ''); // Pre-fill if already validated
            setValidationStatus(res.data.status || '');
            setExpertNotes(res.data.expertValidation?.notes || '');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch diagnosis details.');
            console.error(err);
        }
    };

    const fetchPlantsForValidation = async () => {
        try {
            const plantsRes = await api.get('/diseases'); // Expert validates with a disease
            setPlants(plantsRes.data);
        } catch (err) {
            setError('Failed to load diseases for validation.');
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDiagnosis();
        if (user.role === 'expert' || user.role === 'admin') {
            fetchPlantsForValidation();
        }
    }, [id, user, navigate]);

    const handleValidationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await api.put(`/diagnoses/${id}/validate`, {
                expert_diagnosis_id: parseInt(expertDiagnosisId),
                validation_status: validationStatus,
                expert_notes: expertNotes,
            });
            setSuccess('Diagnosis validated successfully!');
            setDiagnosis(res.data); // Update with fresh data
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to validate diagnosis.');
            console.error(err);
        }
    };

    if (!diagnosis) return <div className="container">Loading diagnosis...</div>;

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
            <h2>Diagnosis Details (ID: {diagnosis.id})</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="card">
                <p><strong>Plant:</strong> {diagnosis.plant?.name || 'N/A'}</p>
                <p><strong>Farmer:</strong> {diagnosis.farmer?.username || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={getStatusClass(diagnosis.status)}>{diagnosis.status.replace(/_/g, ' ')}</span></p>
                <p><strong>Submitted:</strong> {new Date(diagnosis.created_at).toLocaleDateString()}</p>
                <p><strong>Farmer Notes:</strong> {diagnosis.farmer_notes || 'N/A'}</p>
                <p><strong>Observed Symptoms (IDs):</strong> {diagnosis.observed_symptom_ids ? diagnosis.observed_symptom_ids.join(', ') : 'N/A'}</p>
                <p><strong>Preliminary Diagnosis:</strong> {diagnosis.preliminaryDiagnosis?.name || 'N/A'}</p>
                <p><strong>AI Suggested Diagnosis:</strong> {diagnosis.aiSuggestedDiagnosis?.name || 'N/A'}</p>
                <p><strong>Final Diagnosis:</strong> {diagnosis.finalDiagnosis?.name || 'N/A'}</p>

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

            {(user?.role === 'expert' || user?.role === 'admin') && diagnosis.status !== 'validated' && (
                <div className="container" style={{ marginTop: '20px' }}>
                    <h3>Validate Diagnosis</h3>
                    <form onSubmit={handleValidationSubmit}>
                        <div>
                            <label>Expert's Diagnosis (Disease):</label>
                            <select value={expertDiagnosisId} onChange={(e) => setExpertDiagnosisId(e.target.value)} required>
                                <option value="">Select a Disease</option>
                                {plants.map((disease) => ( // 'plants' state holds diseases for validation dropdown
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

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/'); // Redirect if not admin
    }
  }, [user, navigate]);

  if (user?.role !== 'admin') return <div className="container">Access Denied</div>;

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <p>This section is for administrators to manage master data (Plants, Symptoms, Diseases).</p>
      <ul>
        <li><Link to="/admin/plants">Manage Plants</Link></li>
        <li><Link to="/admin/symptoms">Manage Symptoms</Link></li>
        <li><Link to="/admin/diseases">Manage Diseases</Link></li>
      </ul>
    </div>
  );
};

const ManagePlantsPage = () => {
    const [plants, setPlants] = useState([]);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUrl, setnewImageUrl] = useState('');
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
            setnewImageUrl('');
            fetchPlants(); // Refresh list
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
                    <input type="text" value={newImageUrl} onChange={(e) => setnewImageUrl(e.target.value)} />
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
                symptom_ids: selectedSymptoms // Array of symptom IDs
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


function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/submit-diagnosis" element={<SubmitDiagnosisPage />} />
          <Route path="/diagnoses" element={<DiagnosesListPage />} />
          <Route path="/diagnoses/:id" element={<DiagnosisDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/plants" element={<ManagePlantsPage />} />
          <Route path="/admin/symptoms" element={<ManageSymptomsPage />} />
          <Route path="/admin/diseases" element={<ManageDiseasesPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;