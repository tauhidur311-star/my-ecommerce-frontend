import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import LazyWishlistPage from './components/LazyWishlistPage';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';
import TokenManager from './components/TokenManager';
import { AuthProvider, withAuth, withAdminAuth } from './hooks/useAuth';
import './App.css';

// Create protected components using HOCs
const ProtectedUserDashboard = withAuth(UserDashboard);
const ProtectedAdminDashboard = withAdminAuth(AdminDashboard);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={<Store />} 
            />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route 
              path="/dashboard"
              element={<ProtectedUserDashboard />}
            />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/wishlist" element={<LazyWishlistPage />} />
            <Route 
              path="/admin" 
              element={<ProtectedAdminDashboard />}
            />
          </Routes>
          
          {/* Token Manager for session management */}
          <TokenManager />
          
          {/* Global toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;