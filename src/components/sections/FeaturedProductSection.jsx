import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, Edit, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import enhancedApiService from '../../services/enhancedApi';
import toast from 'react-hot-toast';

const FeaturedProductSection = ({ settings, isEditing = false, onUpdateSection }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const defaultSettings = {
    productId: null,
    customTitle: '',
    customSubtitle: '',
    layout: 'standard',
    showPrice: true,
    showDescription: true,
    showRating: true,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonText: 'Shop Now',
    buttonColor: '#007bff'
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  useEffect(() => {
    if (mergedSettings.productId) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [mergedSettings.productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await enhancedApiService.get(`/products/${mergedSettings.productId}`);
      if (response.success) {
        setProduct(response.data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error loading featured product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await enhancedApiService.get(`/admin/content-settings/search-products?q=${encodeURIComponent(query)}&limit=10`);
      if (response.success) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSelect = async (selectedProduct) => {
    try {
      const updatedSettings = {
        ...mergedSettings,
        productId: selectedProduct._id
      };

      if (onUpdateSection) {
        await onUpdateSection(updatedSettings);
        setProduct(selectedProduct);
        setShowProductModal(false);
        setProductSearch('');
        setSearchResults([]);
        toast.success('Featured product updated!');
      }
    } catch (error) {
      toast.error('Failed to update featured product');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product && !isEditing) {
    return null;
  }

  return (
    <section 
      className="py-16 relative"
      style={{ backgroundColor: mergedSettings.backgroundColor, color: mergedSettings.textColor }}
    >
      <div className="container mx-auto px-4">
        {!product && isEditing ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-4">No Featured Product Selected</h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Select Product
            </button>
          </div>
        ) : (
          <div className={`max-w-6xl mx-auto ${
            mergedSettings.layout === 'banner' ? 'text-center' : 
            mergedSettings.layout === 'card' ? 'max-w-md mx-auto' : 
            'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
          }`}>
            {/* Product Image */}
            <div className={`${
              mergedSettings.layout === 'banner' ? 'mb-8' :
              mergedSettings.layout === 'card' ? 'mb-6' : ''
            }`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img
                  src={product?.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                  alt={product?.name || 'Featured Product'}
                  className={`w-full object-cover rounded-lg shadow-lg ${
                    mergedSettings.layout === 'banner' ? 'h-64 md:h-80' :
                    mergedSettings.layout === 'card' ? 'h-64' : 'h-96'
                  }`}
                />
                
                {isEditing && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                      title="Change Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Badge */}
                {product?.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                      {product.category}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Product Details */}
            <div className={mergedSettings.layout === 'banner' ? 'text-center' : ''}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-4">
                  {mergedSettings.customTitle || product?.name || 'Featured Product'}
                </h2>
                
                {mergedSettings.customSubtitle && (
                  <p className="text-lg text-gray-600 mb-4">
                    {mergedSettings.customSubtitle}
                  </p>
                )}

                {/* Rating */}
                {mergedSettings.showRating && product?.rating && (
                  <div className="flex items-center mb-4 justify-center lg:justify-start">
                    <div className="flex items-center mr-2">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.rating}/5)
                    </span>
                  </div>
                )}

                {/* Description */}
                {mergedSettings.showDescription && product?.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Price */}
                {mergedSettings.showPrice && product?.price && (
                  <div className="mb-6">
                    <span className="text-3xl font-bold" style={{ color: mergedSettings.buttonColor }}>
                      ৳{product.price}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    className="px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                    style={{ 
                      backgroundColor: mergedSettings.buttonColor,
                      color: '#ffffff'
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    {mergedSettings.buttonText}
                  </button>
                  
                  <button className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 inline mr-2" />
                    Add to Wishlist
                  </button>
                </div>

                {/* Stock Status */}
                {product?.inStock !== undefined && (
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold mb-4">Select Featured Product</h3>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-96">
              {searchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((searchProduct) => (
                    <div
                      key={searchProduct._id}
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleProductSelect(searchProduct)}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={searchProduct.images?.[0] || 'https://via.placeholder.com/60x60'}
                          alt={searchProduct.name}
                          className="w-15 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {searchProduct.name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {searchProduct.description}
                          </p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            ৳{searchProduct.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : productSearch ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Type to search products...</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setProductSearch('');
                  setSearchResults([]);
                }}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedProductSection;