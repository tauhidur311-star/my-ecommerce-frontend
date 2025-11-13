import { useState, useEffect, useCallback, useRef } from 'react';

export const useEnhancedSSE = (endpoint, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStats, setConnectionStats] = useState({
    attempts: 0,
    lastConnected: null,
    totalMessages: 0
  });
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const statsRef = useRef(connectionStats);

  const {
    reconnectDelay = 3000,
    maxReconnectAttempts = 10,
    onMessage = () => {},
    onConnect = () => {},
    onDisconnect = () => {},
    onError = () => {},
    debug = false
  } = options;

  // Update stats ref when state changes
  useEffect(() => {
    statsRef.current = connectionStats;
  }, [connectionStats]);

  const log = useCallback((...args) => {
    if (debug) {
      console.log('[Enhanced SSE]', ...args);
    }
  }, [debug]);

  const updateStats = useCallback((updates) => {
    setConnectionStats(prev => {
      const newStats = { ...prev, ...updates };
      statsRef.current = newStats;
      return newStats;
    });
  }, []);

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      log('Cleaning up SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, [log]);

  const handleReconnect = useCallback(() => {
    const currentStats = statsRef.current;
    
    if (currentStats.attempts >= maxReconnectAttempts) {
      log('Max reconnection attempts reached');
      setError(new Error('Max reconnection attempts reached'));
      return;
    }

    const delay = Math.min(reconnectDelay * Math.pow(1.5, currentStats.attempts), 30000);
    log(`Scheduling reconnection attempt ${currentStats.attempts + 1} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      updateStats({ attempts: currentStats.attempts + 1 });
      connect();
    }, delay);
  }, [maxReconnectAttempts, reconnectDelay, log]);

  const connect = useCallback(() => {
    // Clean up any existing connection
    cleanupConnection();
    setError(null);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const url = `${apiUrl}/api/sse${endpoint}`;
    
    log('Connecting to SSE endpoint:', url);

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        log('SSE connection opened');
        setIsConnected(true);
        setError(null);
        updateStats({ 
          lastConnected: new Date(),
          attempts: 0
        });
        onConnect();
      };

      eventSource.onmessage = (event) => {
        log('SSE message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          updateStats(prev => ({ 
            ...prev, 
            totalMessages: prev.totalMessages + 1 
          }));
          onMessage(data);
        } catch (parseError) {
          log('Error parsing SSE message:', parseError);
          setLastMessage({ raw: event.data });
          onMessage({ raw: event.data });
        }
      };

      eventSource.onerror = (event) => {
        log('SSE connection error:', event);
        
        const errorObj = new Error('SSE connection error');
        setError(errorObj);
        setIsConnected(false);
        
        onError(errorObj);
        onDisconnect();

        // Only attempt reconnection if we haven't exceeded max attempts
        if (statsRef.current.attempts < maxReconnectAttempts) {
          handleReconnect();
        }
      };

      // Handle specific event types
      eventSource.addEventListener('ping', (event) => {
        log('Received ping:', event.data);
      });

      eventSource.addEventListener('theme_update', (event) => {
        log('Received theme update:', event.data);
        try {
          const data = JSON.parse(event.data);
          setLastMessage({ type: 'theme_update', ...data });
          onMessage({ type: 'theme_update', ...data });
        } catch (parseError) {
          log('Error parsing theme update:', parseError);
        }
      });

      eventSource.addEventListener('system_notification', (event) => {
        log('Received system notification:', event.data);
        try {
          const data = JSON.parse(event.data);
          setLastMessage({ type: 'system_notification', ...data });
          onMessage({ type: 'system_notification', ...data });
        } catch (parseError) {
          log('Error parsing system notification:', parseError);
        }
      });

      eventSource.addEventListener('connection', (event) => {
        log('Connection event:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'connected') {
            setIsConnected(true);
            updateStats({ attempts: 0 });
          }
        } catch (parseError) {
          log('Error parsing connection event:', parseError);
        }
      });

    } catch (connectionError) {
      log('Error creating SSE connection:', connectionError);
      setError(connectionError);
      onError(connectionError);
      
      if (statsRef.current.attempts < maxReconnectAttempts) {
        handleReconnect();
      }
    }
  }, [endpoint, log, onMessage, onConnect, onDisconnect, onError, maxReconnectAttempts, handleReconnect, cleanupConnection, updateStats]);

  const disconnect = useCallback(() => {
    log('Manually disconnecting SSE');
    cleanupConnection();
    onDisconnect();
  }, [log, cleanupConnection, onDisconnect]);

  const reconnect = useCallback(() => {
    log('Manual reconnection requested');
    updateStats({ attempts: 0 });
    connect();
  }, [log, connect, updateStats]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      cleanupConnection();
    };
  }, []);

  // Handle visibility change - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isConnected && !error) {
        log('Tab became visible, attempting to reconnect');
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, error, reconnect, log]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      log('Network came back online, attempting to reconnect');
      if (!isConnected) {
        reconnect();
      }
    };

    const handleOffline = () => {
      log('Network went offline');
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, reconnect, log]);

  return {
    isConnected,
    lastMessage,
    connectionStats,
    error,
    connect: reconnect,
    disconnect
  };
};

export default useEnhancedSSE;