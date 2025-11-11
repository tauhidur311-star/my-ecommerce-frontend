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

  // Session validation with IP checking
  const validateSession = useCallback(async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        console.log('Session invalid:', data.reason || 'IP address changed or session expired');
        logout();
        return false;
      }

      // Update user data if session is valid
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      // Don't logout on network errors, just log the issue
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const checkAuth = async () => {
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
            
            // Validate session with IP check for active users
            await validateSession(token);
          }
        } catch (err) {
          console.error('Auth check error:', err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Set up periodic session validation (every 5 minutes)
    const validationInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        await validateSession(token);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(validationInterval);
    };
  }, [getTokenTimeRemaining, validateSession, user]);

  const login = useCallback((userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  // Terminate all sessions function
  const terminateAllSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No active session');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/terminate-all-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to terminate sessions');
      }

      // Force logout after terminating all sessions
      logout();
      
      return { success: true, message: 'All sessions terminated successfully' };
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
      return { success: false, error: error.message };
    }
  }, [logout]);

  return { user, loading, login, logout, getTokenTimeRemaining, validateSession, terminateAllSessions };
}