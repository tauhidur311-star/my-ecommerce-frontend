import React from 'react';
import { ShoppingCart, Star, Mail, Phone } from 'lucide-react';

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

    // For other section types, show placeholder
    return (
      <div className="py-8 px-4 bg-gray-100 border-2 border-dashed border-gray-300 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Section
        </h3>
        <p className="text-sm text-gray-500">Section loaded successfully</p>
        <pre className="text-xs bg-white p-2 rounded mt-2 max-w-md mx-auto overflow-auto">
          {JSON.stringify(section, null, 2)}
        </pre>
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