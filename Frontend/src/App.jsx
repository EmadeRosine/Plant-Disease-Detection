
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider, useAuth } from './auth/AuthContext'; 


import NavBar from './components/NavBar';


import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubmitDiagnosisPage from './pages/SubmitDiagnosisPage';
import DiagnosesListPage from './pages/DiagnosesListPage';
import DiagnosisDetailPage from './pages/DiagnosisDetailPage';


import AdminPage from './pages/admin/AdminPage';
import ManagePlantsPage from './pages/admin/ManagePlantsPage';
import ManageSymptomsPage from './pages/admin/ManageSymptomsPage';
import ManageDiseasesPage from './pages/admin/ManageDiseasesPage';

import './index.css'; 


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); 
  if (!user) {
    
    return <Navigate to="/login" replace />;
  }

  return children;
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
         
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;