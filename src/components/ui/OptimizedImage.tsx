import React, { useEffect, useRef, useState } from 'react';
import { 
  generateOptimizedImageUrl, 
  generateSrcSet, 
  generateSizesAttribute,
  lazyLoadManager,
  createProgressiveImage
} from '../../utils/imageOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  progressive?: boolean;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  quality?: number;
  placeholder?: 'blur' | 'empty' | string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
  aspectRatio?: string;
  breakpoints?: number[];
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  progressive = false,
  priority = false,
  sizes,
  objectFit = 'cover',
  quality = 85,
  placeholder = 'blur',
  onLoad,
  onError,
  fallback = 'https://via.placeholder.com/400x300?text=Image+Not+Found',
  aspectRatio,
  breakpoints = [320, 480, 768, 1024, 1280, 1920]
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [progressiveData, setProgressiveData] = useState<any>(null);

  // Generate optimized URLs
  const optimizedSrc = generateOptimizedImageUrl(src, { width, height, quality });
  const srcSet = generateSrcSet(src, breakpoints);
  const sizesAttr = sizes || generateSizesAttribute();

  // Progressive loading setup
  useEffect(() => {
    if (progressive && !priority) {
      const lowQualitySrc = generateOptimizedImageUrl(src, { width: 50, quality: 20, blur: 20 });
      createProgressiveImage(lowQualitySrc, src).then(setProgressiveData);
    }
  }, [src, progressive, priority]);

  // Lazy loading setup
  useEffect(() => {
    const img = imgRef.current;
    if (!img || priority || !lazy) return;

    lazyLoadManager.observe(img);

    return () => {
      lazyLoadManager.unobserve(img);
    };
  }, [lazy, priority]);

  // Handle load events
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
    
    // Fallback to default image
    if (imgRef.current && imgRef.current.src !== fallback) {
      imgRef.current.src = fallback;
    }
  };

  // Generate placeholder styles
  const getPlaceholderStyle = () => {
    if (placeholder === 'empty') return {};
    
    if (placeholder === 'blur' && progressiveData) {
      return {
        backgroundImage: `url(${progressiveData.lowQuality})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px)',
        transition: 'filter 0.3s ease-in-out'
      };
    }
    
    if (typeof placeholder === 'string' && placeholder !== 'blur') {
      return {
        backgroundImage: `url(${placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    return {
      backgroundColor: '#f3f4f6'
    };
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...getPlaceholderStyle()
  };

  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  } else if (width && height) {
    containerStyle.aspectRatio = `${width}/${height}`;
  }

  // Image styles
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  };

  // Determine src and srcSet based on loading strategy
  const getImageProps = () => {
    if (priority || !lazy) {
      return {
        src: optimizedSrc,
        srcSet,
        sizes: sizesAttr
      };
    }
    
    return {
      'data-src': optimizedSrc,
      'data-srcset': srcSet,
      sizes: sizesAttr,
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'
    };
  };

  return (
    <div 
      className={`relative ${className}`} 
      style={containerStyle}
    >
      <img
        ref={imgRef}
        alt={alt}
        style={imageStyle}
        className={`
          ${lazy ? 'lazy-loading' : ''} 
          ${isLoaded ? 'lazy-loaded' : ''} 
          ${isError ? 'lazy-error' : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...getImageProps()}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;