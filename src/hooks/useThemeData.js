import { useQuery, useQueryClient } from '@tanstack/react-query';
import { publicAPI } from '../services/themeAPI.js';

/**
 * Hook to fetch theme data with automatic cache invalidation
 * @param {string} pageType - The page type (home, product, collection, etc.)
 * @param {string} slug - Optional slug for custom pages
 * @param {Object} options - Query options
 */
export const usePublishedTheme = (pageType, slug = null, options = {}) => {
  const queryKey = slug ? ['theme', 'custom', slug] : ['theme', pageType];
  
  return useQuery(
    queryKey,
    () => publicAPI.getPublishedTheme(pageType, slug),
    {
      staleTime: 0, // Always consider data stale
      cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      ...options
    }
  );
};

/**
 * Hook to fetch preview theme data (admin only)
 * @param {string} pageType - The page type
 * @param {string} slug - Optional slug for custom pages
 * @param {Object} options - Query options
 */
export const usePreviewTheme = (pageType, slug = null, options = {}) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const queryKey = slug ? ['previewTheme', 'custom', slug] : ['previewTheme', pageType];
  
  return useQuery(
    queryKey,
    () => publicAPI.getPreviewTheme(pageType, slug, token),
    {
      enabled: !!token, // Only fetch if user is authenticated
      staleTime: 0,
      cacheTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
      refetchOnWindowFocus: false, // Don't refetch on focus for preview
      refetchOnReconnect: true,
      retry: 1,
      ...options
    }
  );
};

/**
 * Hook to get published pages list
 */
export const usePublishedPages = (options = {}) => {
  return useQuery(
    ['publishedPages'],
    publicAPI.getPublishedPages,
    {
      staleTime: 1000 * 60 * 10, // Consider fresh for 10 minutes
      cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      ...options
    }
  );
};

/**
 * Helper hook to invalidate theme queries manually
 */
export const useInvalidateTheme = () => {
  const queryClient = useQueryClient();

  const invalidatePublishedTheme = (pageType, slug = null) => {
    const queryKey = slug ? ['theme', 'custom', slug] : ['theme', pageType];
    queryClient.invalidateQueries(queryKey);
  };

  const invalidatePreviewTheme = (pageType, slug = null) => {
    const queryKey = slug ? ['previewTheme', 'custom', slug] : ['previewTheme', pageType];
    queryClient.invalidateQueries(queryKey);
  };

  const invalidateAllThemes = () => {
    queryClient.invalidateQueries(['theme']);
    queryClient.invalidateQueries(['previewTheme']);
    queryClient.invalidateQueries(['publishedPages']);
  };

  return {
    invalidatePublishedTheme,
    invalidatePreviewTheme,
    invalidateAllThemes
  };
};

export default {
  usePublishedTheme,
  usePreviewTheme,
  usePublishedPages,
  useInvalidateTheme
};