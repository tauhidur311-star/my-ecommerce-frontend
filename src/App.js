import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import AuthPage from './pages/auth/AuthPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <UserDashboard />
            </AuthenticatedRoute>
          }
        />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default App;