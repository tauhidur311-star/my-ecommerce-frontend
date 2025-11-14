import { useState, useEffect, useRef, useCallback } from 'react';

const useRealTimeConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [notifications, setNotifications] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      // Determine WebSocket URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NODE_ENV === 'production' 
        ? 'my-ecommerce-backend-s0rt.onrender.com'
        : window.location.hostname + ':5000';
      
      const wsUrl = `${protocol}//${host}/notifications`;
      
      console.log('Attempting to connect to:', wsUrl);
      setConnectionStatus('Connecting...');
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Real-time connection established');
        setIsConnected(true);
        setConnectionStatus('Connected');
        setRetryCount(0);
        
        // Send auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Real-time message received:', data);
          
          switch (data.type) {
            case 'notification':
              setNotifications(prev => [data.payload, ...prev.slice(0, 9)]);
              break;
            case 'order_update':
              // Handle order updates
              console.log('Order update:', data.payload);
              break;
            case 'analytics_update':
              // Handle analytics updates
              console.log('Analytics update:', data.payload);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing real-time message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Real-time connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Reconnecting in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connect();
          }, delay);
        } else {
          setConnectionStatus('Failed');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
      setConnectionStatus('Error');
      
      // Retry connection after delay
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        reconnectTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connect();
        }, delay);
      }
    }
  }, [retryCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('Disconnected');
    setRetryCount(0);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!isConnected && retryCount < maxRetries) {
          console.log('Page became visible, attempting to reconnect...');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, retryCount, connect]);

  // Fallback to Server-Sent Events if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'Failed' || connectionStatus === 'Error') {
      console.log('WebSocket failed, trying Server-Sent Events...');
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const protocol = window.location.protocol;
        const host = process.env.NODE_ENV === 'production' 
          ? 'my-ecommerce-backend-s0rt.onrender.com'
          : window.location.hostname + ':5000';
        
        const sseUrl = `${protocol}//${host}/api/sse/notifications?token=${token}`;
        const eventSource = new EventSource(sseUrl);
        
        eventSource.onopen = () => {
          console.log('SSE connection established');
          setIsConnected(true);
          setConnectionStatus('Connected (SSE)');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setNotifications(prev => [data, ...prev.slice(0, 9)]);
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = () => {
          console.error('SSE connection error');
          eventSource.close();
          setIsConnected(false);
          setConnectionStatus('Disconnected');
        };

        // Cleanup SSE on component unmount
        return () => {
          eventSource.close();
        };
      } catch (error) {
        console.error('Failed to establish SSE connection:', error);
      }
    }
  }, [connectionStatus]);

  return {
    isConnected,
    connectionStatus,
    notifications,
    connect,
    disconnect,
    sendMessage,
    clearNotifications: () => setNotifications([])
  };
};

export default useRealTimeConnection;