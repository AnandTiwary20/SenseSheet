import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  // Check if we have a free test token
  const token = localStorage.getItem('token');
  const isFreeTest = token?.startsWith('free-test-token-');

  // Allow access if authenticated or if it's a free test
  if (isAuthenticated || isFreeTest) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
