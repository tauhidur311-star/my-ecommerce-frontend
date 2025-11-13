import { useCallback, useRef } from 'react';
import { useEnhancedSSE } from './useEnhancedSSE';
import toast from 'react-hot-toast';

export const useThemeSSE = (onThemeUpdate = () => {}) => {
  const lastUpdateRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  const handleMessage = useCallback((data) => {
    // Debounce theme updates to prevent too many rapid changes
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      try {
        if (data.type === 'theme_update') {
          // Check if this is a duplicate update
          const currentUpdate = JSON.stringify(data);
          if (lastUpdateRef.current === currentUpdate) {
            return;
          }
          
          lastUpdateRef.current = currentUpdate;
          onThemeUpdate(data);
          
          // Show toast notification for theme updates
          toast.success('Theme updated!', {
            duration: 2000,
            position: 'bottom-right',
            icon: '🎨'
          });
        } else if (data.type === 'theme_initial') {
          console.log('Theme SSE connection ready:', data.message);
        } else if (data.type === 'connection') {
          console.log('Theme SSE connection established:', data);
        } else if (data.type === 'ping') {
          // Silently handle ping messages
          console.debug('Theme SSE ping received');
        }
      } catch (error) {
        console.error('Error handling theme SSE message:', error);
      }
    }, 300); // 300ms debounce
  }, [onThemeUpdate]);

  const handleConnect = useCallback(() => {
    console.log('🎨 Theme SSE connected');
    toast.success('Connected to theme updates', {
      duration: 3000,
      position: 'bottom-right',
      icon: '🔗'
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('🎨 Theme SSE disconnected');
    // Don't show toast on every disconnect to avoid spam
  }, []);

  const handleError = useCallback((error) => {
    console.error('🎨 Theme SSE error:', error);
    
    // Only show error toast for non-network errors
    if (!error.message.includes('NetworkError') && !error.message.includes('ERR_NETWORK')) {
      toast.error('Theme connection lost', {
        duration: 4000,
        position: 'bottom-right',
        icon: '⚠️'
      });
    }
  }, []);

  const {
    isConnected,
    lastMessage,
    connectionStats,
    error,
    connect,
    disconnect
  } = useEnhancedSSE('/theme/updates', {
    reconnectDelay: 2000,
    maxReconnectAttempts: 15,
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    debug: process.env.NODE_ENV === 'development'
  });

  // Cleanup timeout on unmount
  useCallback(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    connectionStats,
    error,
    connect,
    disconnect,
    // Theme-specific helpers
    isThemeUpdateAvailable: lastMessage?.type === 'theme_update',
    lastThemeUpdate: lastMessage?.type === 'theme_update' ? lastMessage : null
  };
};

export default useThemeSSE;