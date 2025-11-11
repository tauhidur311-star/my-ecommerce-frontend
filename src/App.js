import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './Auth';
// Error logging simplified for better performance
import './App.css';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  // Simplified error handling to prevent browser freeze
  useEffect(() => {
    // Simple error handlers for better performance
    const handleGlobalError = (event) => {
      console.error('Global JavaScript Error:', event.error?.message || event.message);
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Simple initialization message
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 App initialized - Error logging simplified for performance');
    }

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* Catch-all route for SPA routing */}
        <Route path="*" element={<Store />} />
      </Routes>
    </Router>
  );
}

export default App;