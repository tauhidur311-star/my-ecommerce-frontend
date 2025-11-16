import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingCart, Trash2, Star, Filter, Grid, List, Search, X } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist.js';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Define loadProducts at component top level with useCallback
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const localProducts = localStorage.getItem('admin-products');
      if (localProducts) {
        const parsedProducts = JSON.parse(localProducts);
        
        // Filter products that are in wishlist
        const wishlistItems = parsedProducts.filter(product => 
          wishlist.includes(product.id)
        );
        setWishlistProducts(wishlistItems);
        setFilteredProducts(wishlistItems);
      } else {
        // Create sample products if none exist
        const sampleProducts = [
            {
              id: 1,
              name: "Premium Wireless Headphones",
              price: 8500,
              originalPrice: 10000,
              images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"],
              description: "High-quality wireless headphones with noise cancellation",
              stock: 15,
              discount: 15,
              rating: 4.5,
              category: "Electronics"
            },
            {
              id: 2,
              name: "Designer Backpack", 
              price: 3500,
              originalPrice: 4000,
              images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300"],
              description: "Stylish and functional designer backpack",
              stock: 8,
              discount: 12,
              rating: 4.2,
              category: "Fashion"
            },
            {
              id: 3,
              name: "Smart Fitness Watch",
              price: 12000,
              originalPrice: 15000,
              images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"],
              description: "Advanced fitness tracking with heart rate monitor",
              stock: 5,
              discount: 20,
              rating: 4.7,
              category: "Electronics"
            },
            {
              id: 4,
              name: "Organic Cotton T-Shirt",
              price: 1200,
              originalPrice: 1500,
              images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300"],
              description: "Comfortable organic cotton t-shirt",
              stock: 20,
              discount: 20,
              rating: 4.0,
              category: "Fashion"
            }
          ];
          localStorage.setItem('admin-products', JSON.stringify(sampleProducts));
          
          // Add sample products to wishlist for demo
          setWishlistProducts(sampleProducts);
          setFilteredProducts(sampleProducts);
        }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [wishlist]);

  // Call loadProducts in useEffect
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let filtered = [...wishlistProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (priceFilter === 'under-2000') return product.price < 2000;
        if (priceFilter === '2000-5000') return product.price >= 2000 && product.price <= 5000;
        if (priceFilter === '5000-10000') return product.price > 5000 && product.price <= 10000;
        if (priceFilter === 'over-10000') return product.price > 10000;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'name': default: return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [wishlistProducts, searchQuery, priceFilter, sortBy]);

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    toast.success('Removed from wishlist', {
      icon: '💔',
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
      setWishlistProducts([]);
      toast.success('Wishlist cleared', {
        icon: '🧹',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    }
  };

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = existingCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success('Added to cart', {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <Toaster position="top-right" />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-red-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart size={24} className="text-white fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
        </div>

        {wishlistProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-100 to-red-100 rounded-3xl flex items-center justify-center">
              <Heart size={64} className="text-pink-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Discover amazing products and save your favorites for later. Start exploring our collection!
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white transition-all"
                >
                  <Filter size={18} />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <div className="flex bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {wishlistProducts.length > 0 && (
                  <button
                    onClick={handleClearWishlist}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-2000">Under ৳2,000</option>
                      <option value="2000-5000">৳2,000 - ৳5,000</option>
                      <option value="5000-10000">৳5,000 - ৳10,000</option>
                      <option value="over-10000">Over ৳10,000</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={
                      viewMode === 'grid'
                        ? "group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
                        : "group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 flex gap-6"
                    }
                  >
                    <div className={viewMode === 'grid' ? "relative mb-4" : "w-48 flex-shrink-0"}>
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-32'} object-cover rounded-xl`}
                      />
                      {product.discount && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                          -{product.discount}%
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group"
                      >
                        <Heart size={16} className="fill-current text-red-500 group-hover:text-white" />
                      </button>
                    </div>

                    <div className={viewMode === 'grid' ? "" : "flex-1"}>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(product.rating)}
                          <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
                        </div>
                      )}

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-lg ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        <ShoppingCart size={18} />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}