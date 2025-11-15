import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import soundManager from './utils/soundManager';
import Store from './pages/store/Store';
import DynamicStorefront from './components/DynamicStorefront';
import EnhancedAdminDashboard from './pages/admin/EnhancedAdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import WishlistPage from './pages/WishlistPage';
import GlassUIShowcase from './components/examples/GlassUIShowcase';
import ProtectedRoute from './components/ProtectedRoute';
import ContentPageRoute from './components/ContentPageRoute';
import NotFoundPage from './components/NotFoundPage';
import Auth from './Auth';
import NotificationToast from './components/notifications/NotificationToast';
import CookieConsentBanner from './components/CookieConsentBanner';
import cookieManager from './utils/cookieManager';
import './App.css';

// Lazy load ThemeEditor for better code splitting
const ThemeEditor = React.lazy(() => import('./pages/design/ThemeEditor.tsx'));

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
  const [theme, setTheme] = useState('light');

  // Initialize theme from cookies
  useEffect(() => {
    const savedTheme = cookieManager.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Apply theme class to body for global styling
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';
  }, []);

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
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Theme Editor...</p>
                  </div>
                </div>
              }>
                <ThemeEditor />
              </React.Suspense>
            </ProtectedRoute>
          } />
          
          {/* Glass UI Demo Route */}
          <Route path="/glass-demo" element={<GlassUIShowcase />} />
          
          {/* 404 Page */}
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Dynamic Content Pages Route - handles all content pages with access control */}
          <Route path="/:slug" element={<ContentPageRoute />} />
          
          {/* Debug: Log when this route is hit */}
          <Route path="/debug-route/:slug" element={
            <div>
              <h1>Debug Route Hit: {window.location.pathname}</h1>
              <ContentPageRoute />
            </div>
          } />
          
          {/* Catch-all route for truly unknown routes */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <NotificationToast position="top-right" />
        <CookieConsentBanner />
      </Router>
    </QueryClientProvider>
  );
}

export default App;