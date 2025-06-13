import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './HomePage.css'; 

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="homepage">
      {user ? (
       
        <div className="logged-in-welcome">
          <h2>Welcome Back, {user.username}!</h2>
          <p>You are logged in as a {user.role}.</p>
          <p>Explore your <Link to="/diagnoses">diagnoses</Link> or <Link to="/submit-diagnosis">submit a new request</Link>.</p>
          {user.role === 'admin' && <p>Visit the <Link to="/admin">Admin Dashboard</Link> for management tasks.</p>}
        </div>
      ) : (
        
        <div className="hero-section">
        
          <div className="hero-content-wrapper">
            <div className="hero-content">
              <h1>YOUR CROP DOCTOR</h1>
              <p>Crop disease detection made easy. Sign up with us today!</p> 
              <Link to="/register" className="join-us-button">
                Join Us <span className="arrow-icon">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;