import React from 'react';
import { ShoppingCart, Star, Mail, Phone, Eye } from 'lucide-react';

const SafeSectionRenderer = ({ section, products = [], onAddToCart }) => {
  try {
    const settings = section.settings || {};

    // Hero Section
    if (section.type === 'hero') {
      const {
        title = 'Welcome to Your Store',
        subtitle = 'Discover amazing products',
        buttonText = 'Shop Now',
        buttonLink = '#products',
        backgroundColor = '#1f2937',
        textColor = '#ffffff'
      } = settings;

      return (
        <section 
          className="py-20 px-4 text-center min-h-96"
          style={{ 
            backgroundColor,
            color: textColor 
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
            {buttonText && (
              <a 
                href={buttonLink || '#products'}
                className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {buttonText}
              </a>
            )}
          </div>
        </section>
      );
    }

    // Product Grid Section
    if (section.type === 'product-grid') {
      const {
        title = 'Our Products',
        subtitle = 'Discover our collection',
        productsToShow = 8,
        columns = 4,
        showPrices = true,
        showAddToCart = true,
        backgroundColor = '#ffffff',
        textColor = '#1f2937'
      } = settings;

      const displayProducts = products.slice(0, productsToShow);
      const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      };

      return (
        <section 
          className="py-16 px-4"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-lg opacity-80">{subtitle}</p>
            </div>

            <div className={`grid ${gridCols[columns] || gridCols[4]} gap-6`}>
              {displayProducts.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200">
                    <img 
                      src={product.image || product.images?.[0] || 'https://via.placeholder.com/300?text=Product'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {showPrices && (
                      <p className="text-blue-600 font-bold text-xl mb-4">৳{product.price}</p>
                    )}
                    {showAddToCart && (
                      <button
                        onClick={() => onAddToCart?.(product)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Newsletter Section
    if (section.type === 'newsletter') {
      const {
        title = 'Stay Updated',
        subtitle = 'Subscribe to our newsletter',
        description = 'Get the latest news and exclusive offers',
        backgroundColor = '#f3f4f6',
        textColor = '#1f2937',
        buttonColor = '#3b82f6'
      } = settings;

      return (
        <section 
          className="py-16 px-4"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <h3 className="text-xl mb-4 opacity-80">{subtitle}</h3>
            <p className="text-lg mb-8 opacity-80">{description}</p>
            
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: buttonColor }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      );
    }

    // Featured Product Section
    if (section.type === 'featured-product') {
      const {
        title = 'Featured Product',
        subtitle = 'Check out our bestseller',
        backgroundColor = '#ffffff',
        textColor = '#1f2937',
        buttonColor = '#3b82f6'
      } = settings;

      // Get the first product or use a placeholder
      const featuredProduct = products[0] || {
        _id: 'placeholder',
        name: 'Sample Featured Product',
        price: 99.99,
        image: 'https://via.placeholder.com/400x400?text=Featured+Product',
        description: 'This is a sample featured product description.'
      };

      return (
        <section 
          className="py-16 px-4"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-lg opacity-80">{subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Product Image */}
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={featuredProduct.image || featuredProduct.images?.[0] || 'https://via.placeholder.com/400x400?text=Featured+Product'}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">{featuredProduct.name}</h3>
                <p className="text-lg opacity-80">{featuredProduct.description}</p>
                
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold" style={{ color: buttonColor }}>
                    ৳{featuredProduct.price}
                  </span>
                  {featuredProduct.rating && (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < Math.floor(featuredProduct.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart?.(featuredProduct)}
                  className="inline-flex items-center px-8 py-4 rounded-lg font-semibold text-white text-lg transition-colors"
                  style={{ backgroundColor: buttonColor }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Footer Section
    if (section.type === 'footer') {
      const {
        companyName = 'Your Company',
        description = 'Short description of your company',
        links = [
          { text: 'About', url: '/about' },
          { text: 'Contact', url: '/contact' }
        ],
        socialLinks = {
          facebook: '',
          twitter: '',
          instagram: ''
        },
        backgroundColor = '#1f2937',
        textColor = '#ffffff'
      } = settings;

      return (
        <footer className="py-12" style={{ backgroundColor, color: textColor }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Company Info */}
              <div>
                <h3 className="text-xl font-bold mb-4">{companyName}</h3>
                <p className="opacity-80">{description}</p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.url}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.facebook && (
                    <a 
                      href={socialLinks.facebook} 
                      className="opacity-80 hover:opacity-100 transition-opacity"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a 
                      href={socialLinks.twitter} 
                      className="opacity-80 hover:opacity-100 transition-opacity"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      className="opacity-80 hover:opacity-100 transition-opacity"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-current border-opacity-20 mt-8 pt-8 text-center">
              <p className="opacity-80">
                © {new Date().getFullYear()} {companyName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      );
    }

    // Video Section
    if (section.type === 'video') {
      const {
        title = 'Video Section',
        subtitle = 'Watch our featured video',
        videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        videoType = 'mp4', // 'mp4', 'youtube', 'vimeo'
        autoplay = false,
        loop = false,
        controls = true,
        muted = true,
        aspectRatio = '16:9',
        backgroundColor = '#ffffff',
        textColor = '#1f2937'
      } = settings;

      const getAspectRatioClass = () => {
        switch (aspectRatio) {
          case '4:3': return 'aspect-[4/3]';
          case '1:1': return 'aspect-square';
          case '21:9': return 'aspect-[21/9]';
          default: return 'aspect-video'; // 16:9
        }
      };

      const renderVideoEmbed = () => {
        if (videoType === 'youtube') {
          const videoId = videoUrl.includes('youtube.com') 
            ? videoUrl.split('v=')[1]?.split('&')[0] 
            : videoUrl.split('youtu.be/')[1]?.split('?')[0];
          
          if (videoId) {
            return (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            );
          }
        }

        if (videoType === 'vimeo') {
          const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
          
          if (videoId) {
            return (
              <iframe
                src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
                title={title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            );
          }
        }

        // Default to HTML5 video
        return (
          <video
            src={videoUrl}
            autoPlay={autoplay}
            loop={loop}
            controls={controls}
            muted={muted}
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      };

      return (
        <section className="py-16 px-4" style={{ backgroundColor, color: textColor }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-lg opacity-80">{subtitle}</p>
            </div>

            <div className={`relative ${getAspectRatioClass()} bg-gray-900 rounded-lg overflow-hidden shadow-lg`}>
              {renderVideoEmbed()}
            </div>
          </div>
        </section>
      );
    }

    // Gallery Section
    if (section.type === 'gallery') {
      const {
        title = 'Image Gallery',
        subtitle = 'Browse our collection',
        images = [
          { url: 'https://picsum.photos/400/300?random=1', alt: 'Gallery Image 1' },
          { url: 'https://picsum.photos/400/300?random=2', alt: 'Gallery Image 2' },
          { url: 'https://picsum.photos/400/300?random=3', alt: 'Gallery Image 3' },
          { url: 'https://picsum.photos/400/300?random=4', alt: 'Gallery Image 4' }
        ],
        columns = 3,
        spacing = 4,
        lightbox = true,
        backgroundColor = '#ffffff',
        textColor = '#1f2937'
      } = settings;

      const getGridCols = () => {
        switch (columns) {
          case 2: return 'grid-cols-1 md:grid-cols-2';
          case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
          case 5: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
          default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
      };

      return (
        <section className="py-16 px-4" style={{ backgroundColor, color: textColor }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-lg opacity-80">{subtitle}</p>
            </div>

            <div className={`grid ${getGridCols()} gap-${spacing}`}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    if (lightbox) {
                      // Simple lightbox implementation
                      const lightboxDiv = document.createElement('div');
                      lightboxDiv.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                      lightboxDiv.innerHTML = `
                        <div class="max-w-4xl max-h-4xl p-4">
                          <img src="${image.url}" alt="${image.alt}" class="max-w-full max-h-full object-contain rounded-lg" />
                          <button class="absolute top-4 right-4 text-white text-2xl" onclick="this.parentElement.parentElement.remove()">&times;</button>
                        </div>
                      `;
                      document.body.appendChild(lightboxDiv);
                    }
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {lightbox && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // For other section types, show placeholder (remove JSON output)
    return (
      <div className="py-8 px-4 bg-gray-100 border-2 border-dashed border-gray-300 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Section
        </h3>
        <p className="text-sm text-gray-500 mb-4">This section type is not yet implemented</p>
        <div className="text-xs text-gray-400">
          <p>Section ID: {section.id}</p>
          <p>Type: {section.type}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering section:', section, error);
    return (
      <div className="py-4 px-4 bg-red-50 border border-red-200 text-center">
        <h3 className="text-red-800 font-medium">Section Render Error</h3>
        <p className="text-red-600 text-sm">
          Type: {section?.type || 'unknown'} | Error: {error.message}
        </p>
      </div>
    );
  }
};

export default SafeSectionRenderer;