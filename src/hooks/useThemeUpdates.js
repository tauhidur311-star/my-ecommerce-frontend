import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { publicAPI } from '../services/themeAPI';

/**
 * Hook to manage real-time theme updates via SSE
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable SSE connection
 * @param {function} options.onUpdate - Callback for theme updates
 * @param {function} options.onError - Callback for errors
 */
export const useThemeUpdates = (options = {}) => {
  const { enabled = true, onUpdate, onError } = options;
  const queryClient = useQueryClient();
  const sseCleanupRef = useRef(null);

  const handleThemeUpdate = useCallback((data) => {
    console.log('Theme update received:', data);
    
    // Invalidate relevant queries to trigger refetch
    const { pageType, slug } = data;
    
    // Invalidate published theme queries
    queryClient.invalidateQueries(['theme', pageType]);
    if (slug) {
      queryClient.invalidateQueries(['theme', 'custom', slug]);
    }
    
    // Invalidate all theme-related queries
    queryClient.invalidateQueries(['publishedTheme']);
    queryClient.invalidateQueries(['previewTheme']);
    
    // Call user-provided callback
    if (onUpdate) {
      onUpdate(data);
    }
  }, [queryClient, onUpdate]);

  const handleError = useCallback((error) => {
    console.error('Theme updates SSE error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    console.log('Connecting to theme updates SSE...');
    
    // Connect to SSE
    const cleanup = publicAPI.connectToThemeUpdates(handleThemeUpdate, handleError);
    sseCleanupRef.current = cleanup;

    // Cleanup on unmount or when disabled
    return () => {
      if (sseCleanupRef.current) {
        sseCleanupRef.current();
        sseCleanupRef.current = null;
      }
    };
  }, [enabled, handleThemeUpdate, handleError]);

  // Cleanup function that can be called manually
  const disconnect = useCallback(() => {
    if (sseCleanupRef.current) {
      sseCleanupRef.current();
      sseCleanupRef.current = null;
    }
  }, []);

  return {
    disconnect
  };
};

export default useThemeUpdates;