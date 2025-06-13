// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirection

// Import AuthContext and useAuth
import { AuthProvider, useAuth } from './auth/AuthContext'; // Make sure useAuth is imported

// Import Components
import NavBar from './components/NavBar';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubmitDiagnosisPage from './pages/SubmitDiagnosisPage';
import DiagnosesListPage from './pages/DiagnosesListPage';
import DiagnosisDetailPage from './pages/DiagnosisDetailPage';

// Import Admin Pages
import AdminPage from './pages/admin/AdminPage';
import ManagePlantsPage from './pages/admin/ManagePlantsPage';
import ManageSymptomsPage from './pages/admin/ManageSymptomsPage';
import ManageDiseasesPage from './pages/admin/ManageDiseasesPage';

import './index.css'; // Keep your global CSS

// --- ProtectedRoute Component (New or Modified) ---
// This component wraps routes that require authentication.
// If the user is not logged in, it redirects them to the login page.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  if (!user) {
    // User is not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }
  // User is logged in, render the child components (the protected page)
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          {/* Public Routes - Accessible without login */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Require Login */}
          {/* Wrap all routes that need authentication with ProtectedRoute */}
          <Route
            path="/submit-diagnosis"
            element={
              <ProtectedRoute>
                <SubmitDiagnosisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnoses"
            element={
              <ProtectedRoute>
                <DiagnosesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnoses/:id"
            element={
              <ProtectedRoute>
                <DiagnosisDetailPage />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes - Also protected by login (and role authorization within the component) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plants"
            element={
              <ProtectedRoute>
                <ManagePlantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/symptoms"
            element={
              <ProtectedRoute>
                <ManageSymptomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/diseases"
            element={
              <ProtectedRoute>
                <ManageDiseasesPage />
              </ProtectedRoute>
            }
          />
          {/* Add more protected routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;