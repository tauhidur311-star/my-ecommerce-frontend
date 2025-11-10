/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const WishlistManager = ({ isModal = false, onClose = null }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadWishlist();
    loadProducts();
  }, []);

  const loadWishlist = async () => {
    try {
      const wishlistData = localStorage.getItem('user-wishlist');
      if (wishlistData) {
        setWishlistItems(JSON.parse(wishlistData));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = localStorage.getItem('admin-products');
      if (productsData) {
        setProducts(JSON.parse(productsData));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const existingItems = [...wishlistItems];
      
      if (existingItems.some(item => item.productId === productId)) {
        toast.error('Product already in wishlist');
        return false;
      }

      const newItem = {
        productId,
        addedAt: new Date().toISOString()
      };

      const updatedItems = [...existingItems, newItem];
      localStorage.setItem('user-wishlist', JSON.stringify(updatedItems));
      setWishlistItems(updatedItems);
      
      toast.success('Added to wishlist!', {
        icon: '❤️',
        duration: 2000
      });
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const updatedItems = wishlistItems.filter(item => item.productId !== productId);
      localStorage.setItem('user-wishlist', JSON.stringify(updatedItems));
      setWishlistItems(updatedItems);
      
      toast.success('Removed from wishlist', {
        icon: '💔',
        duration: 2000
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const moveToCart = async (productId) => {
    try {
      // Get current cart
      const cartData = localStorage.getItem('cart');
      const currentCart = cartData ? JSON.parse(cartData) : [];
      
      // Find the product
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return;
      }

      // Check if already in cart
      const existingCartItem = currentCart.find(item => item.id === productId);
      
      if (existingCartItem) {
        // Increase quantity
        existingCartItem.quantity += 1;
      } else {
        // Add new item to cart
        currentCart.push({
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString()
        });
      }

      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Remove from wishlist
      await removeFromWishlist(productId);
      
      toast.success('Moved to cart!', {
        icon: '🛒',
        duration: 2000
      });
      
      // Trigger cart update event for other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move to cart');
    }
  };

  const getWishlistWithProducts = () => {
    return wishlistItems.map(wishlistItem => {
      const product = products.find(p => p.id === wishlistItem.productId);
      return {
        ...wishlistItem,
        product
      };
    }).filter(item => item.product); // Filter out items where product wasn't found
  };

  const formatPrice = (price) => `৳${price.toLocaleString()}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-3 text-gray-600">Loading wishlist...</span>
      </div>
    );
  }

  const wishlistWithProducts = getWishlistWithProducts();

  const WishlistContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
            <Heart size={20} className="text-white fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-gray-600">{wishlistWithProducts.length} items saved</p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlistWithProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl flex items-center justify-center">
            <Heart size={48} className="text-pink-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Save items you love for later. Click the heart icon on any product to add it to your wishlist!
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-700 transition-all duration-300"
            >
              <ShoppingCart size={20} />
              Continue Shopping
            </button>
          )}
        </div>
      ) : (
        /* Wishlist Items */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistWithProducts.map(({ productId, addedAt, product }) => (
            <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-300">
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => removeFromWishlist(productId)}
                    className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    title="Remove from wishlist"
                  >
                    <Heart size={18} className="text-red-500 fill-current" />
                  </button>
                </div>
                {product.sold && product.showSoldNumbers && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.sold} sold
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  {product.rating && (
                    <div className="flex items-center ml-2">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Added {formatDate(addedAt)}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveToCart(productId)}
                    disabled={!product.inStock}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart size={14} />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => {
                      // You can implement a product view modal here
                      console.log('View product:', product);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {wishlistWithProducts.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-6 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Wishlist Summary</h4>
              <p className="text-sm text-gray-600">
                {wishlistWithProducts.length} items • Total value: {formatPrice(
                  wishlistWithProducts.reduce((sum, item) => sum + (item.product?.price || 0), 0)
                )}
              </p>
            </div>
            <button
              onClick={() => {
                // Move all available items to cart
                const availableItems = wishlistWithProducts.filter(item => item.product?.inStock);
                availableItems.forEach(item => moveToCart(item.productId));
              }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg hover:from-pink-600 hover:to-red-700 transition-all duration-300"
            >
              Add All to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Return as modal or regular component
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <WishlistContent />
          </div>
        </div>
      </div>
    );
  }

  return <WishlistContent />;
};

// Wishlist Hook for other components
export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const wishlistData = localStorage.getItem('user-wishlist');
        if (wishlistData) {
          setWishlistItems(JSON.parse(wishlistData));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };

    loadWishlist();
  }, []);

  const addToWishlist = async (productId) => {
    try {
      const existingItems = [...wishlistItems];
      
      if (existingItems.some(item => item.productId === productId)) {
        toast.error('Product already in wishlist');
        return false;
      }

      const newItem = {
        productId,
        addedAt: new Date().toISOString()
      };

      const updatedItems = [...existingItems, newItem];
      localStorage.setItem('user-wishlist', JSON.stringify(updatedItems));
      setWishlistItems(updatedItems);
      
      toast.success('Added to wishlist!', {
        icon: '❤️',
        duration: 2000
      });
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const updatedItems = wishlistItems.filter(item => item.productId !== productId);
      localStorage.setItem('user-wishlist', JSON.stringify(updatedItems));
      setWishlistItems(updatedItems);
      
      toast.success('Removed from wishlist', {
        icon: '💔',
        duration: 2000
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlistItems.length
  };
};

export default WishlistManager;