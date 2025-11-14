import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import soundManager from './utils/soundManager';
import Store from './pages/store/Store';
import DynamicStorefront from './components/DynamicStorefront';
import EnhancedAdminDashboard from './pages/admin/EnhancedAdminDashboard';
import EnhancedThemeEditor from './pages/design/EnhancedThemeEditor.tsx';
import UserDashboard from './pages/dashboard/UserDashboard';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';
import WishlistPage from './pages/WishlistPage';
import GlassUIShowcase from './components/examples/GlassUIShowcase';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './Auth';
import NotificationToast from './components/notifications/NotificationToast';
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

  // Initialize sound manager and error handling
  useEffect(() => {
    // Initialize sound manager
    try {
      soundManager.preloadAll();
      console.log('🎵 Sound manager initialized');
    } catch (error) {
      console.warn('Sound manager initialization failed:', error);
    }

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
      console.log('🚀 App initialized with enhanced UX features');
    }

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {showAuth && <Auth onClose={() => setShowAuth(false)} />}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Store />} />
          <Route path="/theme-preview" element={<DynamicStorefront pageType="home" />} />
          <Route path="/theme-home" element={<DynamicStorefront pageType="home" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<Store />} /> {/* Cart is handled within Store component */}
          
          {/* Preview routes for theme editor */}
          <Route path="/preview" element={<Store />} />
          <Route path="/preview/:pageType" element={<Store />} />
          
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
              <EnhancedAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/design" element={
            <ProtectedRoute requireAdmin={true}>
              <EnhancedThemeEditor />
            </ProtectedRoute>
          } />
          <Route path="/design/:designId" element={
            <ProtectedRoute requireAdmin={true}>
              <EnhancedThemeEditor />
            </ProtectedRoute>
          } />
          
          {/* Redirect old upgrade route to new design route */}
          <Route path="/design/upgrade" element={<Navigate to="/design" replace />} />
          
          {/* Glass UI Demo Route */}
          <Route path="/glass-demo" element={<GlassUIShowcase />} />
          
          {/* Catch-all route for SPA routing - redirects unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NotificationToast position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;