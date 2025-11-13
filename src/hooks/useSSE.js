import { useEffect, useRef, useCallback } from 'react';

const useSSE = (url, onMessage, enabled = true) => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connected to:', url);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage('message', data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      // Handle custom events
      eventSource.addEventListener('visitor-event', (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage('visitor-event', data);
        } catch (error) {
          console.error('Error parsing visitor-event:', error);
        }
      });

      eventSource.addEventListener('new-submission', (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage('new-submission', data);
        } catch (error) {
          console.error('Error parsing new-submission:', error);
        }
      });

      eventSource.addEventListener('metric-update', (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage('metric-update', data);
        } catch (error) {
          console.error('Error parsing metric-update:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttempts.current);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Error creating EventSource:', error);
    }
  }, [url, onMessage, enabled]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [connect, disconnect, enabled]);

  return { disconnect, reconnect: connect };
};

export default useSSE;