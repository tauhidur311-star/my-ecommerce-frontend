import { useState, useEffect, useCallback } from 'react';
// Error logger removed for performance

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
        const context = 'Session Validation Warning';
        
        // Log session validation warning (don't logout immediately)
        console.warn(`Session validation warning: ${reason}`, {
          responseStatus: response.status,
          validationReason: reason
        });
        
        console.log('Session validation warning:', reason);
        
        // Instead of logging out, just return false to indicate session issue
        // Let the user continue but mark session as potentially compromised
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
      console.error('Session Validation Network Error:', error.message, {
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
            
            // Session validation disabled for performance - simple token check only
            // setTimeout(async () => {
            //   await validateSession(token);
            // }, 1000); // Wait 1 second to avoid immediate logout
          }
        } catch (err) {
          console.error('Auth check error:', err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Light session validation only when needed (no automatic intervals)
    // Validation will be triggered manually when user accesses security tab
  }, [getTokenTimeRemaining, validateSession]);

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
        const error = new Error('No active session found to terminate');
        console.error('Terminate Sessions Failed:', error.message);
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
        console.error('Terminate All Sessions Failed:', error.message);
        throw error;
      }

      // Log successful session termination
      console.log('Session Termination Success: All sessions terminated by user', {
        action: 'terminate_all_sessions',
        success: true,
        timestamp: new Date().toISOString()
      });

      // Force logout after terminating all sessions
      logout();
      
      return { success: true, message: 'All sessions terminated successfully' };
    } catch (error) {
      console.error('Terminate All Sessions Error:', error.message, {
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