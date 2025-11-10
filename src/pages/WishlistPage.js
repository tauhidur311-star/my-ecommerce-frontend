import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all products to match with wishlist IDs
    const loadProducts = () => {
      try {
        const localProducts = localStorage.getItem('admin-products');
        if (localProducts) {
          const parsedProducts = JSON.parse(localProducts);
          setProducts(parsedProducts);
          
          // Filter products that are in wishlist
          const wishlistItems = parsedProducts.filter(product => 
            wishlist.includes(product.id)
          );
          setWishlistProducts(wishlistItems);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [wishlist]);

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
      setWishlistProducts([]);
      toast.success('Wishlist cleared');
    }
  };

  const handleAddToCart = (product) => {
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Add product to cart (assuming default size if sizes exist)
    const defaultSize = product.sizes?.[0] || 'One Size';
    const cartItem = {
      ...product,
      selectedSize: defaultSize,
      quantity: 1
    };

    // Check if item already exists
    const existingItem = existingCart.find(
      item => item.id === product.id && item.selectedSize === defaultSize
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = existingCart.map(item =>
        item.id === product.id && item.selectedSize === defaultSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, cartItem];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Store</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart size={32} className="text-red-500 fill-current" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          
          {wishlistProducts.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product, index) => (
              <div 
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors group"
                  >
                    <Heart 
                      size={18} 
                      className="text-red-500 fill-current group-hover:scale-110 transition-transform" 
                    />
                  </button>

                  {/* Quick add to cart */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-black/80 hover:bg-black text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Quick Add
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discount && (
                      <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                        -{product.discount}% OFF
                      </span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ৳{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 border border-gray-300 hover:border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}