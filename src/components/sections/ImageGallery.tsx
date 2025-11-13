import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Heart } from 'lucide-react';

interface ImageGalleryProps {
  settings?: {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'grid' | 'masonry' | 'carousel';
    columns?: number;
    spacing?: string;
    showLightbox?: boolean;
    showCaptions?: boolean;
    images?: Array<{
      id: string;
      url: string;
      thumbnail?: string;
      alt: string;
      caption?: string;
      title?: string;
    }>;
  };
  styles?: {
    container?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    gallery?: string;
    image?: string;
    caption?: string;
    lightbox?: string;
  };
  isEditing?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  settings = {},
  styles = {},
  isEditing = false
}) => {
  const {
    title = 'Gallery',
    subtitle = 'Explore our collection',
    backgroundColor = '#FFFFFF',
    textColor = '#1F2937',
    padding = '4rem 1rem',
    margin = '0',
    layout = 'grid',
    columns = 3,
    spacing = '1rem',
    showLightbox = true,
    showCaptions = true,
    images = []
  } = settings;

  const mockImages = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      alt: 'Modern storefront',
      caption: 'Our beautiful storefront location',
      title: 'Main Store'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
      alt: 'Product showcase',
      caption: 'Featured products in our collection',
      title: 'Product Display'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      alt: 'Shopping experience',
      caption: 'Customers enjoying their shopping experience',
      title: 'Happy Customers'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      alt: 'Product details',
      caption: 'Close-up of our premium products',
      title: 'Quality Details'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      alt: 'Store interior',
      caption: 'Inside our beautifully designed store',
      title: 'Store Interior'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
      alt: 'Team photo',
      caption: 'Meet our amazing team',
      title: 'Our Team'
    }
  ];

  const displayImages = images.length > 0 ? images : mockImages;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  const getGridCols = () => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };
    return colsMap[columns as keyof typeof colsMap] || colsMap[3];
  };

  const renderImage = (image: any, index: number) => (
    <div
      key={image.id || index}
      className={`group relative overflow-hidden rounded-lg bg-gray-200 cursor-pointer transition-transform duration-300 hover:scale-105 ${styles.image || ''}`}
      onClick={() => showLightbox && openLightbox(index)}
    >
      {/* Image */}
      <div className="aspect-square">
        <img
          src={image.thumbnail || image.url}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
        {showLightbox && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2">
            <div className="p-2 bg-white rounded-full shadow-lg">
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {showCaptions && (image.caption || image.title) && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 ${styles.caption || ''}`}>
          <div className="text-white">
            {image.title && (
              <h4 className="font-semibold text-sm">{image.title}</h4>
            )}
            {image.caption && (
              <p className="text-xs opacity-80">{image.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderMasonry = () => {
    const getRandomHeight = (index: number) => {
      const heights = ['h-48', 'h-56', 'h-64', 'h-72'];
      return heights[index % heights.length];
    };

    return (
      <div className={`columns-1 md:columns-2 lg:columns-${Math.min(columns, 4)} gap-${spacing} ${styles.gallery || ''}`}>
        {displayImages.map((image, index) => (
          <div
            key={image.id || index}
            className={`break-inside-avoid mb-${spacing} group relative overflow-hidden rounded-lg bg-gray-200 cursor-pointer ${getRandomHeight(index)}`}
            onClick={() => showLightbox && openLightbox(index)}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
              }}
            />
            
            {/* Overlay and caption similar to grid layout */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              {showLightbox && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-2 bg-white rounded-full shadow-lg">
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              )}
            </div>

            {showCaptions && (image.caption || image.title) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <div className="text-white">
                  {image.title && (
                    <h4 className="font-semibold text-sm">{image.title}</h4>
                  )}
                  {image.caption && (
                    <p className="text-xs opacity-80">{image.caption}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      className={`${styles.container || ''}`}
      style={{
        backgroundColor,
        color: textColor,
        padding,
        margin
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`${styles.content || ''}`}>
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className={`text-lg opacity-80 max-w-2xl mx-auto ${styles.subtitle || ''}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Gallery */}
          {layout === 'masonry' ? (
            renderMasonry()
          ) : (
            <div className={`grid ${getGridCols()} gap-${spacing} ${styles.gallery || ''}`}>
              {displayImages.map((image, index) => renderImage(image, index))}
            </div>
          )}

          {/* No images message */}
          {displayImages.length === 0 && !isEditing && (
            <div className="text-center py-12">
              <p className="text-lg opacity-60">No images to display.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && lightboxOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center ${styles.lightbox || ''}`}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-full max-h-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayImages[currentImageIndex]?.url}
              alt={displayImages[currentImageIndex]?.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Image Info */}
            {showCaptions && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
                <div className="text-white text-center">
                  {displayImages[currentImageIndex]?.title && (
                    <h3 className="text-lg font-semibold mb-1">
                      {displayImages[currentImageIndex].title}
                    </h3>
                  )}
                  {displayImages[currentImageIndex]?.caption && (
                    <p className="text-sm opacity-80">
                      {displayImages[currentImageIndex].caption}
                    </p>
                  )}
                  <p className="text-xs opacity-60 mt-2">
                    {currentImageIndex + 1} of {displayImages.length}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <a
                href={displayImages[currentImageIndex]?.url}
                download
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;