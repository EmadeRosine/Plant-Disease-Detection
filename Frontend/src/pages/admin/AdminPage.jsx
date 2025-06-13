// src/pages/admin/AdminPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; // Corrected import path

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

export default AdminPage;