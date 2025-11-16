import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';

// API constants outside component
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductGridSection = ({ section, settings, isEditing, previewMode }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure settings exist
  const safeSettings = settings || {};

  const {
    title = 'Featured Products',
    subtitle = 'Check out our latest collection',
    limit = 8,
    columns = 4,
    sort = 'featured',
    showTitle = true,
    showFilters = false
  } = safeSettings;

  useEffect(() => {
    loadProducts();
  }, [limit, sort]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to load from API
      const response = await fetch(`${API_BASE_URL}/api/products?limit=${limit}&sort=${sort}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const productData = data.products || data.data || data;
        setProducts(productData.slice(0, limit));
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('admin-products');
        if (stored) {
          const productData = JSON.parse(stored);
          setProducts(productData.slice(0, limit));
        } else {
          // Use sample data
          setProducts(generateSampleProducts(limit));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use sample data on error
      setProducts(generateSampleProducts(limit));
    } finally {
      setLoading(false);
    }
  }, [limit, sort]);

  const generateSampleProducts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `sample-${i + 1}`,
      name: `Sample Product ${i + 1}`,
      price: (Math.random() * 100 + 20).toFixed(2),
      images: ['https://via.placeholder.com/300x300?text=Product+' + (i + 1)],
      category: 'sample',
      inStock: true,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 100),
      description: `This is a sample product description for product ${i + 1}.`
    }));
  };

  const getGridColumns = () => {
    switch (previewMode) {
      case 'mobile':
        return 'grid-cols-2';
      case 'tablet':
        return 'grid-cols-3';
      default:
        return `grid-cols-${Math.min(columns, 6)}`;
    }
  };

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  const renderProductCard = (product) => (
    <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Stock badge */}
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {isEditing ? (
            <span className="border-b border-dashed border-gray-400">
              {product.name}
            </span>
          ) : (
            product.name
          )}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {product.description || 'Product description'}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          
          {!isEditing && (
            <button 
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderLoadingGrid = () => (
    <div className={`grid ${getGridColumns()} gap-6`}>
      {Array.from({ length: limit }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {showTitle && (title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isEditing ? (
                  <span className="border-b-2 border-dashed border-gray-400">
                    {title}
                  </span>
                ) : (
                  title
                )}
              </h2>
            )}
            
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {isEditing ? (
                  <span className="border-b border-dashed border-gray-400">
                    {subtitle}
                  </span>
                ) : (
                  subtitle
                )}
              </p>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          renderLoadingGrid()
        ) : (products && products.length > 0) ? (
          <div className={`grid ${getGridColumns()} gap-6`}>
            {products.map(renderProductCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">
              {isEditing 
                ? 'Add some products to see them displayed here' 
                : 'Check back later for new products'
              }
            </p>
          </div>
        )}

        {/* View All Link */}
        {!isEditing && products.length >= limit && (
          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-block bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View All Products
            </a>
          </div>
        )}
      </div>

      {/* Editing indicators */}
      {isEditing && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Product Grid Section
        </div>
      )}
    </section>
  );
};

export default ProductGridSection;