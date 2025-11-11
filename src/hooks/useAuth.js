import { useState, useEffect, useCallback } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return { user, loading, login, logout, getTokenTimeRemaining };
}