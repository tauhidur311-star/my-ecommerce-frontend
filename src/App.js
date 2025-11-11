import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import Auth from './Auth';
import errorLogger from './services/errorLogger';
import './App.css';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  // Initialize enhanced error logging system
  useEffect(() => {
    // Start network monitoring
    errorLogger.startNetworkMonitoring();

    // Global error handler for unhandled JavaScript errors
    const handleGlobalError = (event) => {
      errorLogger.logError(event.error || new Error(event.message), 'Global JavaScript Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error',
        url: window.location.href
      });
    };

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      errorLogger.logError(
        event.reason instanceof Error ? event.reason : new Error('Unhandled promise rejection'), 
        'Unhandled Promise Rejection', 
        {
          type: 'promise_rejection',
          promiseReason: event.reason,
          url: window.location.href
        }
      );
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Development mode console override
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Enhanced Error Logging System Initialized');
      console.log('🛠️  Available debugging commands:');
      console.log('   - window.errorLogger.getErrorHistory() - View error history');
      console.log('   - window.errorLogger.downloadErrorLog() - Download error log');
      console.log('   - window.errorLogger.clearErrorHistory() - Clear error history');
      console.log('   - window.errorLogger.showErrorDialog(new Error("test"), "Test Context") - Test error dialog');
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
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;