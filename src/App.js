import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Store from './pages/store/Store';
import DynamicStorefront from './components/DynamicStorefront';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';
import WishlistPage from './pages/WishlistPage';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './components/theme/ThemeManager';
import SEOHead from './components/SEO/SEOHead';
// Error logging simplified for better performance
import './App.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

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
    <ErrorBoundary level="page" onError={(error, errorInfo, errorId) => {
      console.error('App Error:', error, errorInfo, errorId);
    }}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Router>
              <SEOHead />
              {showAuth && <Auth onClose={() => setShowAuth(false)} />}
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <ErrorBoundary level="page">
                    <Store />
                  </ErrorBoundary>
                } />
                <Route path="/theme-preview" element={
                  <ErrorBoundary level="page">
                    <DynamicStorefront pageType="home" />
                  </ErrorBoundary>
                } />
                <Route path="/theme-home" element={
                  <ErrorBoundary level="page">
                    <DynamicStorefront pageType="home" />
                  </ErrorBoundary>
                } />
                <Route path="/about" element={
                  <ErrorBoundary level="page">
                    <AboutPage />
                  </ErrorBoundary>
                } />
                <Route path="/contact" element={
                  <ErrorBoundary level="page">
                    <ContactPage />
                  </ErrorBoundary>
                } />
                <Route path="/cart" element={
                  <ErrorBoundary level="page">
                    <Store />
                  </ErrorBoundary>
                } /> {/* Cart is handled within Store component */}
                
                {/* Preview routes for theme editor */}
                <Route path="/preview" element={
                  <ErrorBoundary level="page">
                    <Store />
                  </ErrorBoundary>
                } />
                <Route path="/preview/:pageType" element={
                  <ErrorBoundary level="page">
                    <Store />
                  </ErrorBoundary>
                } />
                
                {/* Protected user routes */}
                <Route path="/dashboard" element={
                  <ErrorBoundary level="page">
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/dashboard/:tab" element={
                  <ErrorBoundary level="page">
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/wishlist" element={
                  <ErrorBoundary level="page">
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                
                {/* Protected admin routes */}
                <Route path="/admin" element={
                  <ErrorBoundary level="page">
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                
                {/* Catch-all route for SPA routing - redirects unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;