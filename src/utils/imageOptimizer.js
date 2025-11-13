/**
 * Enhanced Image Optimization Utilities
 * Handles WebP conversion, lazy loading, CDN optimization, and responsive images
 */

// Image format detection and WebP support
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Generate optimized image URLs for Cloudflare R2 + CDN
export const generateOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return '';
  
  const {
    width,
    height,
    quality = 85,
    format = 'auto',
    fit = 'cover',
    dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    blur = 0,
    sharpen = 0
  } = options;
  
  // If it's a Cloudflare R2 URL, add transform parameters
  if (originalUrl.includes('r2.dev') || originalUrl.includes('cloudflarestorage.com')) {
    const baseUrl = originalUrl.split('?')[0];
    const params = [];
    
    if (width) params.push(`w=${Math.round(width * dpr)}`);
    if (height) params.push(`h=${Math.round(height * dpr)}`);
    params.push(`q=${quality}`);
    params.push(`f=${supportsWebP && format === 'auto' ? 'webp' : format}`);
    params.push(`fit=${fit}`);
    if (blur > 0) params.push(`blur=${blur}`);
    if (sharpen > 0) params.push(`sharpen=${sharpen}`);
    
    // Use Cloudflare Image Resizing API
    const transformUrl = `/cdn-cgi/image/${params.join(',')}${baseUrl.replace(window.location.origin, '')}`;
    return transformUrl;
  }
  
  return originalUrl;
};

// Generate srcSet for responsive images with multiple sizes
export const generateSrcSet = (originalUrl, breakpoints = [320, 480, 768, 1024, 1280, 1920]) => {
  if (!originalUrl) return '';
  
  return breakpoints
    .map(width => `${generateOptimizedImageUrl(originalUrl, { width })} ${width}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizesAttribute = (breakpoints = {}) => {
  const defaultBreakpoints = {
    '(max-width: 480px)': '100vw',
    '(max-width: 768px)': '50vw',
    '(max-width: 1024px)': '33vw',
    '(max-width: 1280px)': '25vw',
    default: '300px'
  };
  
  const sizes = { ...defaultBreakpoints, ...breakpoints };
  
  return Object.entries(sizes)
    .map(([query, size]) => query === 'default' ? size : `${query} ${size}`)
    .join(', ');
};

// Enhanced Lazy Loading Manager with performance optimization
class EnhancedLazyLoadManager {
  constructor() {
    this.observer = null;
    this.loadingImages = new Set();
    this.loadedImages = new Set();
    this.init();
  }
  
  init() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.loadingImages.has(entry.target)) {
            this.loadImage(entry.target);
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading 100px before entering viewport
        threshold: [0, 0.1, 0.5] // Multiple thresholds for better control
      }
    );
  }
  
  async loadImage(img) {
    if (this.loadingImages.has(img) || this.loadedImages.has(img)) {
      return;
    }
    
    this.loadingImages.add(img);
    const startTime = performance.now();
    
    try {
      // Create a promise for image loading
      await new Promise((resolve, reject) => {
        const tempImg = new Image();
        
        tempImg.onload = () => {
          // Progressive enhancement
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Add loaded class with fade-in animation
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // Track performance
          this.trackImagePerformance(img.dataset.src || img.src, startTime);
          
          resolve();
        };
        
        tempImg.onerror = reject;
        tempImg.src = img.dataset.src || img.src;
      });
      
      this.loadedImages.add(img);
      this.observer.unobserve(img);
      
    } catch (error) {
      console.warn('Failed to load image:', img.dataset.src, error);
      img.classList.add('lazy-error');
    } finally {
      this.loadingImages.delete(img);
    }
  }
  
  trackImagePerformance(url, startTime) {
    const loadTime = performance.now() - startTime;
    
    // Track to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_load_time', {
        event_category: 'performance',
        event_label: url,
        value: Math.round(loadTime),
        custom_map: {
          'custom_parameter_1': 'image_optimization'
        }
      });
    }
    
    // Performance budget monitoring
    if (loadTime > 2000) {
      console.warn(`Slow image load detected: ${loadTime.toFixed(2)}ms for ${url}`);
    }
  }
  
  observe(element) {
    if (this.observer && element && !this.loadedImages.has(element)) {
      element.classList.add('lazy-loading');
      this.observer.observe(element);
    }
  }
  
  unobserve(element) {
    if (this.observer && element) {
      this.observer.unobserve(element);
    }
  }
  
  // Preload critical images
  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = generateOptimizedImageUrl(url, { width: 800, quality: 85 });
      document.head.appendChild(link);
    });
  }
  
  // Clean up for memory management
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadingImages.clear();
    this.loadedImages.clear();
  }
}

export const lazyLoadManager = new EnhancedLazyLoadManager();

// Progressive image loading with blur-up technique
export const createProgressiveImage = async (lowQualitySrc, highQualitySrc, options = {}) => {
  const { 
    blurAmount = 20, 
    transitionDuration = 300,
    fallbackColor = '#f3f4f6' 
  } = options;
  
  return new Promise((resolve) => {
    // Load low quality with heavy blur first
    const lowQualityUrl = generateOptimizedImageUrl(lowQualitySrc, {
      width: 50,
      quality: 20,
      blur: blurAmount
    });
    
    const img = new Image();
    
    img.onload = () => {
      // Start loading high quality in background
      const highQualityImg = new Image();
      
      highQualityImg.onload = () => {
        const highQualityUrl = generateOptimizedImageUrl(highQualitySrc, {
          quality: 85,
          format: 'auto'
        });
        
        resolve({
          lowQuality: lowQualityUrl,
          highQuality: highQualityUrl,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        });
      };
      
      highQualityImg.src = highQualitySrc;
    };
    
    img.src = lowQualityUrl;
  });
};

// Image compression for uploads with quality optimization
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = 'image/jpeg',
    progressive = true
  } = options;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with optimization
      canvas.toBlob((blob) => {
        const optimizedFile = new File([blob], file.name, {
          type: format,
          lastModified: Date.now()
        });
        
        resolve({
          file: optimizedFile,
          originalSize: file.size,
          compressedSize: blob.size,
          compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(2)
        });
      }, format, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Video optimization utilities
export const optimizeVideo = {
  // Generate poster image from video
  generatePoster: (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  },
  
  // Get video metadata
  getMetadata: (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight
        });
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  }
};

// Performance monitoring and analytics
export const imagePerformanceTracker = {
  trackCoreWebVitals: () => {
    // Track Largest Contentful Paint for images
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
        console.log('LCP Image:', lastEntry.element.src, `${lastEntry.startTime}ms`);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'lcp_image', {
            event_category: 'performance',
            event_label: lastEntry.element.src,
            value: Math.round(lastEntry.startTime)
          });
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  },
  
  trackImageErrors: () => {
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        console.error('Image failed to load:', e.target.src);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'image_error', {
            event_category: 'error',
            event_label: e.target.src
          });
        }
      }
    }, true);
  }
};

// Initialize performance tracking
if (typeof window !== 'undefined') {
  imagePerformanceTracker.trackCoreWebVitals();
  imagePerformanceTracker.trackImageErrors();
}

export default {
  generateOptimizedImageUrl,
  generateSrcSet,
  generateSizesAttribute,
  lazyLoadManager,
  createProgressiveImage,
  compressImage,
  optimizeVideo,
  imagePerformanceTracker,
  supportsWebP
};