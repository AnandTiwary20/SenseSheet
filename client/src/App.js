import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DataVisualization from './components/DataVisualization';
import UploadPage from './components/UploadPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, isAuthenticated, loading, logout, setUser, setIsAuthenticated } = useAuth();
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      const verifyToken = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        }
      };
      verifyToken();
    }
  }, [setUser, setIsAuthenticated]);

  const handleFileUpload = (data) => {
    console.log('File upload data received in App.js:', data);
    setChartData(data);
    console.log('Chart data set, navigating to /visualize');
    navigate('/visualize');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setChartData(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? 
            <Login onLogin={handleLogin} /> : 
            <Navigate to="/dashboard" replace />
        } />
        <Route path="/" element={
          <Navigate to="/dashboard" replace />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard user={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UploadPage onFileUpload={handleFileUpload} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/visualize" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DataVisualization 
              chartData={chartData} 
              onBack={() => navigate('/upload')} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
