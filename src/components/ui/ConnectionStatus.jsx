import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Settings } from 'lucide-react';
import useRealTimeConnection from '../../hooks/useRealTimeConnection.js';
import { getServiceWorkerStatus } from '../../utils/serviceWorkerRegistration';

const ConnectionStatus = ({ className = '' }) => {
  const { isConnected, connectionStatus } = useRealTimeConnection();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('Checking...');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check service worker status
  useEffect(() => {
    const checkSWStatus = async () => {
      try {
        const status = await getServiceWorkerStatus();
        setServiceWorkerStatus(status);
      } catch (error) {
        setServiceWorkerStatus('Error');
      }
    };

    checkSWStatus();
    const interval = setInterval(checkSWStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status, isActive) => {
    if (isActive) {
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
    } else {
      return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    }
  };

  const getStatusColor = (status, isActive) => {
    if (isActive) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center space-x-6 text-sm ${className}`}>
      {/* Online Status */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className={getStatusColor('online', isOnline)}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Real-time Connection Status */}
      <div className="flex items-center space-x-2">
        <Activity className="w-4 h-4 text-blue-600" />
        <span>Real-time:</span>
        <div className="flex items-center space-x-1">
          {getStatusIcon('realtime', isConnected)}
          <span className={getStatusColor('realtime', isConnected)}>
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Service Worker Status */}
      <div className="flex items-center space-x-2">
        <Settings className="w-4 h-4 text-purple-600" />
        <span>Service Worker:</span>
        <div className="flex items-center space-x-1">
          {getStatusIcon('sw', serviceWorkerStatus === 'Active')}
          <span className={getStatusColor('sw', serviceWorkerStatus === 'Active')}>
            {serviceWorkerStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;