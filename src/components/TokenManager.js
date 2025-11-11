import React, { useState, useEffect, useCallback } from 'react';
import { Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TokenManager = () => {
  const { 
    isAuthenticated, 
    tokenExpiry, 
    getTokenTimeRemaining 
  } = useAuth();
  
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Update time remaining every second
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiry) {
      setTimeRemaining(null);
      setShowWarning(false);
      return;
    }

    const updateTimer = () => {
      const remaining = getTokenTimeRemaining();
      setTimeRemaining(remaining);
      
      // Show warning if less than 10 minutes remaining
      const tenMinutes = 10 * 60 * 1000;
      setShowWarning(remaining <= tenMinutes && remaining > 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokenExpiry, getTokenTimeRemaining]);

  // Format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get status color and icon
  const getStatus = () => {
    if (!isAuthenticated) return { color: 'gray', icon: AlertTriangle, text: 'Not authenticated' };
    if (!timeRemaining) return { color: 'gray', icon: Clock, text: 'Loading...' };
    
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    
    if (minutes <= 0) return { color: 'red', icon: AlertTriangle, text: 'Expired' };
    if (minutes <= 5) return { color: 'red', icon: RefreshCw, text: 'Expiring soon' };
    if (minutes <= 10) return { color: 'yellow', icon: AlertTriangle, text: 'Warning' };
    return { color: 'green', icon: CheckCircle, text: 'Active' };
  };

  if (!isAuthenticated) return null;

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <>
      {/* Token Status Indicator (for development/admin) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`bg-white border-2 rounded-lg shadow-lg p-3 transition-all duration-300 ${
            status.color === 'red' ? 'border-red-500' :
            status.color === 'yellow' ? 'border-yellow-500' :
            status.color === 'green' ? 'border-green-500' :
            'border-gray-300'
          }`}>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${
                status.color === 'red' ? 'text-red-500' :
                status.color === 'yellow' ? 'text-yellow-500' :
                status.color === 'green' ? 'text-green-500' :
                'text-gray-500'
              }`} />
              <div className="text-xs">
                <div className="font-medium">{status.text}</div>
                {timeRemaining > 0 && (
                  <div className="text-gray-500">
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Expiry Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Session Expiring Soon
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your session will expire in{' '}
              <span className="font-mono font-bold text-red-600">
                {formatTimeRemaining(timeRemaining)}
              </span>
              . Your work will be automatically saved, and you'll need to login again.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenManager;