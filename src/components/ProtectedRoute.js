import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Check if user exists and if their role is 'admin'
  if (!user || user.role !== 'admin') {
    // If not an admin, redirect to the auth page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;