import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          const timeRemaining = getTokenTimeRemaining();
          if (!timeRemaining || timeRemaining <= 0) {
            console.log('Token expired');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.error('Auth check error:', err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [getTokenTimeRemaining]);

  const login = useCallback((userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const getTokenTimeRemaining = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      return expiresIn > 0 ? expiresIn : null;
    } catch (err) {
      console.error('Token parsing error:', err);
      return null;
    }
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
    loading,
    error,
    login,
    logout,
    getTokenTimeRemaining,
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