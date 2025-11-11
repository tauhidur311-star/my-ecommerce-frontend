import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Keep this for clarity
  const [isLoading, setIsLoading] = useState(true); // This is the key addition
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);
  
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setShowAuth(false);
    toast.success(`Welcome, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Also clear cart on logout
    toast.success('You have been logged out.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${authMode} failed`);
      }

      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
      } else if (data.token) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));

      handleLoginSuccess(data.user);
    } catch (error) {
      throw error; // Re-throw to be caught by the component
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading, // Expose the loading state
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    handleAuthSubmit,
    handleLogout,
    handleLoginSuccess,
  };
};