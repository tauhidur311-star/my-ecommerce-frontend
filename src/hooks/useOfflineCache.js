import { useState, useEffect, useCallback } from 'react';

const CACHE_PREFIX = 'admin_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const useOfflineCache = (key) => {
  const [cachedData, setCachedData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);

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

  // Load cached data on mount
  useEffect(() => {
    loadFromCache();
  }, [key]);

  const loadFromCache = useCallback(() => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          setCachedData(parsedCache.data);
          setLastSync(new Date(parsedCache.timestamp));
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
  }, [key]);

  const saveToCache = useCallback((data) => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      setCachedData(data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      localStorage.removeItem(cacheKey);
      setCachedData(null);
      setLastSync(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  const syncData = useCallback(async (fetchFunction) => {
    if (!isOnline) {
      console.log('Offline - using cached data');
      return cachedData;
    }

    try {
      const freshData = await fetchFunction();
      saveToCache(freshData);
      return freshData;
    } catch (error) {
      console.error('Error syncing data:', error);
      if (cachedData) {
        console.log('Using cached data due to sync error');
        return cachedData;
      }
      throw error;
    }
  }, [isOnline, cachedData, saveToCache]);

  return {
    cachedData,
    isOnline,
    lastSync,
    saveToCache,
    clearCache,
    syncData,
    loadFromCache
  };
};

// Hook for managing multiple cache entries
export const useMultipleCache = () => {
  const [cacheStatus, setCacheStatus] = useState({});

  const getCacheSize = useCallback(() => {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith(CACHE_PREFIX)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }, []);

  const clearAllCache = useCallback(() => {
    const keysToRemove = [];
    for (let key in localStorage) {
      if (key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setCacheStatus({});
  }, []);

  const getCacheInfo = useCallback(() => {
    const info = {
      totalEntries: 0,
      totalSize: 0,
      entries: []
    };

    for (let key in localStorage) {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage[key]);
          const cleanKey = key.replace(CACHE_PREFIX, '');
          
          info.entries.push({
            key: cleanKey,
            size: localStorage[key].length,
            timestamp: data.timestamp,
            isExpired: Date.now() - data.timestamp > CACHE_EXPIRY
          });
          
          info.totalEntries++;
          info.totalSize += localStorage[key].length;
        } catch (error) {
          console.error('Error reading cache entry:', key, error);
        }
      }
    }

    return info;
  }, []);

  const cleanExpiredCache = useCallback(() => {
    const keysToRemove = [];
    
    for (let key in localStorage) {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage[key]);
          if (Date.now() - data.timestamp > CACHE_EXPIRY) {
            keysToRemove.push(key);
          }
        } catch (error) {
          keysToRemove.push(key); // Remove corrupted entries
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
  }, []);

  return {
    cacheStatus,
    getCacheSize,
    clearAllCache,
    getCacheInfo,
    cleanExpiredCache
  };
};

// Service Worker registration for better offline support
export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setIsRegistered(true);
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            setUpdateAvailable(true);
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          if (registration) {
            registration.update();
            setUpdateAvailable(false);
          }
        });
    }
  }, []);

  return {
    isRegistered,
    updateAvailable,
    updateServiceWorker
  };
};