import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import enhancedApiService from '../services/enhancedApi';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    setupAuthEventListeners();
  }, []);

  // Initialize authentication state from localStorage
  const initializeAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (storedUser && accessToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Decode token to get expiry
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          setTokenExpiry(tokenPayload.exp * 1000); // Convert to milliseconds
        } catch (e) {
          console.warn('Could not decode token payload');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear corrupted data
      enhancedApiService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Setup event listeners for auth state changes
  const setupAuthEventListeners = () => {
    // Listen for successful login
    window.addEventListener('auth:login', (event) => {
      const { accessToken } = event.detail;
      const userData = enhancedApiService.getCurrentUser();
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Update token expiry
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          setTokenExpiry(tokenPayload.exp * 1000);
        } catch (e) {
          console.warn('Could not decode token payload');
        }
        
        toast.success(`Welcome back, ${userData.name}!`);
      }
    });

    // Listen for logout events
    window.addEventListener('auth:logout', (event) => {
      const { reason } = event.detail || {};
      
      setUser(null);
      setIsAuthenticated(false);
      setTokenExpiry(null);
      
      // Show appropriate message based on logout reason
      switch (reason) {
        case 'refresh_failed':
          toast.error('Session expired. Please login again.');
          break;
        case 'no_refresh_token':
          toast.error('Authentication required. Please login.');
          break;
        case 'user_logout':
          toast.success('Logged out successfully');
          break;
        default:
          toast.error('Session ended. Please login again.');
      }
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    });
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      const response = await enhancedApiService.login(email, password, rememberMe);
      
      if (response.success) {
        // The auth event listener will handle state updates
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await enhancedApiService.logout();
      // The auth event listener will handle state updates
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if request fails
      enhancedApiService.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'force_logout' }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = () => {
    if (!tokenExpiry) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return tokenExpiry - now < fiveMinutes;
  };

  // Get time until token expires
  const getTokenTimeRemaining = useCallback(() => {
    if (!tokenExpiry) return null;
    const remaining = tokenExpiry - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [tokenExpiry]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiry) return;

    const checkTokenExpiry = () => {
      const remaining = getTokenTimeRemaining();
      
      if (remaining <= 0) {
        // Token has expired
        console.log('⏰ Token has expired');
        return;
      }
      
      if (remaining <= 5 * 60 * 1000) { // 5 minutes
        console.log('⚠️ Token expiring soon, will refresh on next API call');
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokenExpiry, getTokenTimeRemaining]);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    tokenExpiry,
    login,
    logout,
    isTokenExpiringSoon,
    getTokenTimeRemaining,
    // Helper methods
    hasRole: (role) => user?.role === role,
    isAdmin: () => user?.role === 'admin',
    getUserId: () => user?.id,
    getUserEmail: () => user?.email,
    getUserName: () => user?.name,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// Higher-order component for admin-only routes
export const withAdminAuth = (WrappedComponent) => {
  return function AdminAuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default useAuth;