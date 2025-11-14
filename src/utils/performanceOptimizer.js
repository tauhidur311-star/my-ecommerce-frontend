/**
 * Performance Optimization Utilities
 * Bundle splitting, lazy loading, and performance monitoring for theme editor
 */

import { lazy } from 'react';

// Lazy load heavy components
export const LazyAdvancedSettingsPanel = lazy(() => 
  import('../components/design-editor/advanced/AdvancedSettingsPanel')
);

export const LazyResponsivePreviewPanel = lazy(() => 
  import('../components/design-editor/advanced/ResponsivePreviewPanel')
);

export const LazyTemplateGallery = lazy(() => 
  import('../components/design-editor/advanced/TemplateGallery')
);

export const LazyAdvancedSectionLibrary = lazy(() => 
  import('../components/design-editor/advanced/AdvancedSectionLibrary')
);

// Advanced sections lazy loading
export const LazyVideoSection = lazy(() => 
  import('../components/sections/advanced/VideoSection')
);

export const LazyPricingSection = lazy(() => 
  import('../components/sections/advanced/PricingSection')
);

export const LazyFAQSection = lazy(() => 
  import('../components/sections/advanced/FAQSection')
);

export const LazyTeamSection = lazy(() => 
  import('../components/sections/advanced/TeamSection')
);

export const LazyStatsSection = lazy(() => 
  import('../components/sections/advanced/StatsSection')
);

// Performance monitoring
export const performanceObserver = {
  // Track component render times
  measureRender: (componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    if (end - start > 16.67) { // Slower than 60fps
      console.warn(`⚠️ Slow render detected: ${componentName} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  // Track API call performance
  measureAPI: async (apiName, apiCall) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      
      console.log(`📊 API Call: ${apiName} completed in ${(end - start).toFixed(2)}ms`);
      
      if (end - start > 1000) { // Slower than 1 second
        console.warn(`⚠️ Slow API detected: ${apiName} took ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ API Error: ${apiName} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Memory usage tracking
  trackMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
      
      console.log('💾 Memory Usage:', usage);
      
      if (usage.used / usage.limit > 0.8) {
        console.warn('⚠️ High memory usage detected:', usage);
      }
      
      return usage;
    }
    return null;
  }
};

// Debounce utility for heavy operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for frequent events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image lazy loading with intersection observer
export const createLazyImageObserver = (callback) => {
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  }
  return null;
};

// Bundle size analyzer
export const bundleAnalyzer = {
  // Measure bundle loading performance
  measureBundleLoad: (bundleName) => {
    const start = performance.now();
    
    return {
      finish: () => {
        const end = performance.now();
        console.log(`📦 Bundle loaded: ${bundleName} in ${(end - start).toFixed(2)}ms`);
      }
    };
  },

  // Check if browser supports modern features
  getBrowserCapabilities: () => {
    return {
      webp: createImageSupportsFormat('webp'),
      avif: createImageSupportsFormat('avif'),
      intersectionObserver: 'IntersectionObserver' in window,
      webWorkers: 'Worker' in window,
      serviceWorkers: 'serviceWorker' in navigator,
      dynamicImports: supportsES2020()
    };
  }
};

// Helper functions
function createImageSupportsFormat(format) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
}

function supportsES2020() {
  try {
    return new Function('return import("data:text/javascript,export default 1")')() instanceof Promise;
  } catch {
    return false;
  }
}

// Cache management
export const cacheManager = {
  // Simple in-memory cache with TTL
  cache: new Map(),
  
  set: (key, value, ttl = 300000) => { // 5 minutes default
    const expiry = Date.now() + ttl;
    cacheManager.cache.set(key, { value, expiry });
  },
  
  get: (key) => {
    const item = cacheManager.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cacheManager.cache.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  clear: () => {
    cacheManager.cache.clear();
  },
  
  // Clean expired entries
  cleanup: () => {
    const now = Date.now();
    for (const [key, item] of cacheManager.cache.entries()) {
      if (now > item.expiry) {
        cacheManager.cache.delete(key);
      }
    }
  }
};

// Auto cleanup cache every 5 minutes
setInterval(cacheManager.cleanup, 300000);

// React performance helpers
export const usePerformanceMonitor = (componentName) => {
  React.useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`🔍 Component lifecycle: ${componentName} was mounted for ${(end - start).toFixed(2)}ms`);
    };
  }, [componentName]);
};

// Optimize heavy renders with useMemo and useCallback helpers
export const createOptimizedSelector = (selector, dependencies = []) => {
  return React.useMemo(selector, dependencies);
};

export const createOptimizedCallback = (callback, dependencies = []) => {
  return React.useCallback(callback, dependencies);
};