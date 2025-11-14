import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Star, Package, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const EnhancedWishlist = ({ user }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.getWishlist();
      if (response.success) {
        setWishlistItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }));
      
      const response = await api.removeFromWishlist(productId);
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (product) => {
    try {
      setActionLoading(prev => ({ ...prev, [`cart_${product._id}`]: true }));
      
      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(
        item => item.id === product._id
      );

      if (existingItemIndex !== -1) {
        // Update quantity
        currentCart[existingItemIndex].quantity += 1;
        toast.success(`Updated ${product.name} quantity in cart!`);
      } else {
        // Add new item
        const newItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          image: getImageUrl(product),
          quantity: 1,
          selectedSize: product.sizes?.[0] || 'M'
        };
        currentCart.push(newItem);
        toast.success(`${product.name} added to cart!`);
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart: currentCart } 
      }));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setActionLoading(prev => ({ ...prev, [`cart_${product._id}`]: false }));
    }
  };

  const getImageUrl = (product) => {
    const imageFields = [
      product.images?.[0],
      product.image,
      product.imageUrl,
      product.photo,
      product.thumbnail
    ];
    
    for (const imageField of imageFields) {
      if (imageField) {
        if (imageField.includes('http')) {
          return imageField;
        }
        if (imageField.startsWith('/')) {
          return `${process.env.REACT_APP_API_URL}${imageField}`;
        }
        return `${process.env.REACT_APP_API_URL}/${imageField}`;
      }
    }
    
    return 'https://via.placeholder.com/200?text=No+Image';
  };

  const formatPrice = (price, discount = 0) => {
    const finalPrice = discount ? price - (price * discount / 100) : price;
    return finalPrice;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"} 
      />
    ));
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Heart size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Sign in to view your wishlist</h3>
        <p className="text-gray-500 mb-6">Save items you love for later</p>
        <Link 
          to="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-6">Add products you love to your wishlist</p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <ShoppingCart size={20} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wishlist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {wishlistItems.filter(item => item.product.stock > 0).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                ৳{wishlistItems.reduce((total, item) => total + (item.product.price || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative mb-4">
              <img 
                src={getImageUrl(item.product)} 
                alt={item.product.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                }}
              />
              
              {/* Stock Status Badge */}
              {item.product.stock <= 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  Out of Stock
                </div>
              )}
              
              {/* New Badge */}
              {item.product.isNew && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  NEW
                </div>
              )}
              
              {/* Sale Badge */}
              {(item.product.discount > 0 || item.product.onSale) && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  {item.product.discountPercentage || item.product.discount}% OFF
                </div>
              )}

              {/* Remove Button */}
              <button 
                onClick={() => removeFromWishlist(item.product._id)}
                disabled={actionLoading[item.product._id]}
                className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-md"
                title="Remove from wishlist"
              >
                {actionLoading[item.product._id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                )}
              </button>
            </div>
            
            {/* Product Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg line-clamp-2">{item.product.name}</h3>
              
              {/* Rating */}
              {item.product.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(item.product.averageRating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({item.product.reviewCount || 0})
                  </span>
                </div>
              )}
              
              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2">
                {item.product.description || 'No description available'}
              </p>
              
              {/* Price */}
              <div className="flex items-center justify-between">
                {item.product.discount > 0 || item.product.discountPercentage > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-600">
                      ৳{formatPrice(item.product.price, item.product.discountPercentage || item.product.discount)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ৳{item.product.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    ৳{item.product.price || 0}
                  </span>
                )}
              </div>
              
              {/* Stock Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Package size={12} />
                  <span>{item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}</span>
                </div>
                {item.product.salesCount > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>{item.product.salesCount} sold</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => addToCart(item.product)}
                  disabled={item.product.stock <= 0 || actionLoading[`cart_${item.product._id}`]}
                  className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-sm ${
                    item.product.stock <= 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {actionLoading[`cart_${item.product._id}`] ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart size={16} className="inline mr-1" />
                      {item.product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => removeFromWishlist(item.product._id)}
                  disabled={actionLoading[item.product._id]}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-600"
                  title="Remove from wishlist"
                >
                  {actionLoading[item.product._id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
              
              {/* Added Date */}
              <div className="text-xs text-gray-500 text-center border-t pt-2">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const inStockItems = wishlistItems.filter(item => item.product.stock > 0);
              inStockItems.forEach(item => addToCart(item.product));
            }}
            disabled={wishlistItems.filter(item => item.product.stock > 0).length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ShoppingCart size={18} />
            Add All Available to Cart
          </button>
          
          <button
            onClick={() => {
              const outOfStockItems = wishlistItems.filter(item => item.product.stock <= 0);
              outOfStockItems.forEach(item => removeFromWishlist(item.product._id));
            }}
            disabled={wishlistItems.filter(item => item.product.stock <= 0).length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Trash2 size={18} />
            Remove Out of Stock
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <Package size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWishlist;