import { useState, useEffect, useCallback } from 'react';
import errorLogger from '../services/errorLogger';

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

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
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

      // If the endpoint doesn't exist (404), assume session is valid
      if (response.status === 404) {
        console.log('Session validation endpoint not implemented yet, assuming valid session');
        return true;
      }

      const data = await response.json();

      if (!response.ok || !data.valid) {
        const reason = data.reason || 'IP address changed or session expired';
        const context = 'Session Validation Failed';
        
        // Log session validation failure
        errorLogger.logError(new Error(`Session validation failed: ${reason}`), context, {
          responseStatus: response.status,
          validationReason: reason,
          userData: data
        });
        
        console.log('Session invalid:', reason);
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
      // Enhanced error logging for session validation
      errorLogger.logError(error, 'Session Validation Network Error', {
        endpoint: '/api/auth/validate-session',
        action: 'session_validation',
        keepSessionActive: true
      });
      
      console.error('Session validation failed:', error);
      console.log('Network error during validation, keeping session active');
      return true;
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
            
            // Validate session with IP check for active users (only after user is set)
            setTimeout(async () => {
              await validateSession(token);
            }, 1000); // Wait 1 second to avoid immediate logout
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

  // Terminate all sessions function
  const terminateAllSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        const error = new Error('No active session');
        errorLogger.showErrorDialog(error, 'Terminate Sessions Failed', 'No active session found to terminate.');
        throw error;
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
        const error = new Error(data.message || data.error || 'Failed to terminate sessions');
        errorLogger.showErrorDialog(error, 'Terminate All Sessions Failed', error.message);
        throw error;
      }

      // Log successful session termination
      errorLogger.logError(new Error('All sessions terminated by user'), 'Session Termination Success', {
        action: 'terminate_all_sessions',
        success: true,
        timestamp: new Date().toISOString()
      });

      // Force logout after terminating all sessions
      logout();
      
      return { success: true, message: 'All sessions terminated successfully' };
    } catch (error) {
      errorLogger.logError(error, 'Terminate All Sessions Error', {
        action: 'terminate_all_sessions',
        success: false,
        hasToken: !!(localStorage.getItem('token') || localStorage.getItem('accessToken'))
      });
      
      console.error('Failed to terminate sessions:', error);
      return { success: false, error: error.message };
    }
  }, [logout]);

  return { user, loading, login, logout, getTokenTimeRemaining, validateSession, terminateAllSessions };
}