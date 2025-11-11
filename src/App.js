import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Store from './pages/store/Store';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import Auth from './Auth';
import './App.css';

function App() {
  const [showAuth, setShowAuth] = useState(false);

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