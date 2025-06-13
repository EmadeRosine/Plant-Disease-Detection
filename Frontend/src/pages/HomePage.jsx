import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './HomePage.css'; // Keep the CSS import

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="homepage">
      {user ? (
        // Display a simpler welcome for logged-in users
        <div className="logged-in-welcome">
          <h2>Welcome Back, {user.username}!</h2>
          <p>You are logged in as a {user.role}.</p>
          <p>Explore your <Link to="/diagnoses">diagnoses</Link> or <Link to="/submit-diagnosis">submit a new request</Link>.</p>
          {user.role === 'admin' && <p>Visit the <Link to="/admin">Admin Dashboard</Link> for management tasks.</p>}
        </div>
      ) : (
        // Display the hero section for logged-out users
        <div className="hero-section">
          {/* This wrapper ensures the green overlay and text are positioned correctly over the background image */}
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