import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import LazyWishlistPage from './components/LazyWishlistPage';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
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
          element={
            <AuthenticatedRoute>
              <UserDashboard />
            </AuthenticatedRoute>
          }
        />
        <Route path="/forgot-password" element={<AuthPage />} />
        <Route path="/wishlist" element={<LazyWishlistPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App;