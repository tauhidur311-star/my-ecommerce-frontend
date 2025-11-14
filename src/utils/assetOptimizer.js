/**
 * Asset Optimization Utilities
 * Enhanced image and video optimization for theme editor assets
 */

export const optimizeImageForWeb = async (file, options = {}) => {
  const {
    format = 'auto',
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1080,
    resize = true
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate optimized dimensions
      let { width, height } = img;
      
      if (resize && (width > maxWidth || height > maxHeight)) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and optimize
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format
      let outputFormat = 'image/jpeg';
      if (format === 'auto') {
        // Use WebP if supported, otherwise JPEG for photos, PNG for graphics
        if (supportsWebP()) {
          outputFormat = 'image/webp';
        } else {
          outputFormat = file.type.includes('png') ? 'image/png' : 'image/jpeg';
        }
      } else if (format !== 'auto') {
        outputFormat = `image/${format}`;
      }

      // Convert to blob with quality optimization
      canvas.toBlob(
        (blob) => {
          const optimizedFile = new File(
            [blob], 
            `optimized_${file.name.split('.')[0]}.${outputFormat.split('/')[1]}`,
            { type: outputFormat }
          );
          
          resolve({
            file: optimizedFile,
            originalSize: file.size,
            optimizedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100),
            dimensions: { width, height }
          });
        },
        outputFormat,
        quality / 100
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const generateThumbnail = async (file, size = 200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(size / width, size / height);
      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      canvas.width = size;
      canvas.height = size;

      // Center the image
      const x = (size - newWidth) / 2;
      const y = (size - newHeight) / 2;

      // Fill background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, size, size);

      // Draw image
      ctx.drawImage(img, x, y, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          resolve({
            blob,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
            size: blob.size
          });
        },
        'image/jpeg',
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const validateAssetFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/mov',
      'application/pdf', 'text/css', 'text/javascript', 'application/json'
    ]
  } = options;

  const errors = [];

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSize)}`);
  }

  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported`);
  }

  // Specific validations for different file types
  if (file.type.startsWith('image/')) {
    if (file.size > 5 * 1024 * 1024) { // 5MB for images
      errors.push('Images should be under 5MB for optimal performance');
    }
  }

  if (file.type.startsWith('video/')) {
    if (file.size > 50 * 1024 * 1024) { // 50MB for videos
      errors.push('Videos should be under 50MB');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: generateOptimizationWarnings(file)
  };
};

export const generateOptimizationWarnings = (file) => {
  const warnings = [];

  if (file.type === 'image/png' && file.size > 1024 * 1024) {
    warnings.push('Consider converting PNG to JPEG for better compression');
  }

  if (file.type === 'image/gif' && file.size > 2 * 1024 * 1024) {
    warnings.push('Large GIF detected - consider converting to video format');
  }

  if (file.name.includes(' ')) {
    warnings.push('File name contains spaces - consider using hyphens or underscores');
  }

  return warnings;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const getFileCategory = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.includes('pdf')) return 'document';
  if (file.type.includes('css') || file.type.includes('javascript')) return 'code';
  return 'other';
};

export const generateAssetMetadata = async (file) => {
  const metadata = {
    name: file.name,
    size: file.size,
    type: file.type,
    category: getFileCategory(file),
    lastModified: file.lastModified,
    uploadDate: new Date().toISOString()
  };

  // Add image-specific metadata
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;
      metadata.aspectRatio = (dimensions.width / dimensions.height).toFixed(2);
    } catch (error) {
      console.warn('Could not extract image dimensions:', error);
    }
  }

  // Add video-specific metadata
  if (file.type.startsWith('video/')) {
    try {
      const videoDuration = await getVideoDuration(file);
      metadata.duration = videoDuration;
    } catch (error) {
      console.warn('Could not extract video duration:', error);
    }
  }

  return metadata;
};

const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};