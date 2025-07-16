import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DataVisualization from './components/DataVisualization';
import UploadPage from './components/UploadPage';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleAuth from './components/GoogleAuth';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, isAuthenticated, loading, logout, setUser, setIsAuthenticated } = useAuth();
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = (data) => {
    // Process the Excel data directly in the frontend
    try {
      if (!data || !data.data || !data.headers) {
        throw new Error('Invalid data format. Expected data object with data and headers properties');
      }

      // Validate headers
      if (!Array.isArray(data.headers) || data.headers.length === 0) {
        throw new Error('No valid headers found in the file');
      }

      // Validate data rows
      if (!Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('No data rows found in the file');
      }

      // Debug logging
      console.log('Received data:', {
        headers: data.headers,
        firstRow: data.data[0],
        rowCount: data.data.length
      });

      // Store the data
      setChartData(data);
      
      // Always navigate to visualize when data is uploaded
      navigate('/visualize');
    } catch (error) {
      console.error('Error in handleFileUpload:', error);
      alert(`Error processing file: ${error.message}. Please make sure your Excel file has both headers and data rows.`);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Check if there was pending data before login
    const pendingData = localStorage.getItem('pendingData');
    if (pendingData) {
      const data = JSON.parse(pendingData);
      setChartData(data);
      localStorage.removeItem('pendingData');
      navigate('/visualize');
    } else {
      navigate('/dashboard');
    }
  };



  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? (
            <div className="login-container">
              <Login onLogin={handleLogin} />
              <GoogleAuth />
            </div>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visualize"
          element={
            <ProtectedRoute>
              <DataVisualization chartData={chartData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage onFileUpload={handleFileUpload} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload/bypass"
          element={
            <div>
              <UploadPage onFileUpload={handleFileUpload} />
              <p>Upload files without authentication</p>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
