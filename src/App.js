import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Store from './pages/store/Store';
import DynamicStorefront from './components/DynamicStorefront';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';
import WishlistPage from './pages/WishlistPage';
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
        {/* Public routes */}
        <Route path="/" element={<Store />} />
        <Route path="/theme-preview" element={<DynamicStorefront pageType="home" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<Store />} /> {/* Cart is handled within Store component */}
        
        {/* Protected user routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/:tab" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route for SPA routing - redirects unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;