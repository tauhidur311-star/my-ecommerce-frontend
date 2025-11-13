import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  X, 
  Check,
  TrendingUp,
  Users,
  Clock,
  Gift
} from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  description?: string;
}

interface UpsellCrosssellProps {
  currentProduct?: Product;
  cartItems?: Product[];
  onAddToCart: (product: Product) => void;
  className?: string;
  type?: 'upsell' | 'crosssell' | 'bundle' | 'frequently-bought';
  title?: string;
  products?: Product[];
  maxItems?: number;
  showTimer?: boolean;
  urgencyMessage?: string;
  discount?: number;
  bundlePrice?: number;
}

const UpsellCrosssell = memo(({
  currentProduct,
  cartItems = [],
  onAddToCart,
  className = '',
  type = 'crosssell',
  title,
  products = [],
  maxItems = 4,
  showTimer = false,
  urgencyMessage,
  discount,
  bundlePrice
}: UpsellCrosssellProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isVisible, setIsVisible] = useState(true);

  // Timer countdown effect
  useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddSelectedToCart = () => {
    products.forEach(product => {
      if (selectedProducts.has(product._id)) {
        onAddToCart(product);
      }
    });
    setSelectedProducts(new Set());
  };

  const calculateSavings = () => {
    const selectedItems = products.filter(p => selectedProducts.has(p._id));
    const originalTotal = selectedItems.reduce((sum, p) => sum + (p.originalPrice || p.price), 0);
    const currentTotal = selectedItems.reduce((sum, p) => sum + p.price, 0);
    
    if (bundlePrice && selectedProducts.size > 1) {
      return originalTotal - bundlePrice;
    }
    
    if (discount && selectedProducts.size > 1) {
      return currentTotal * (discount / 100);
    }
    
    return originalTotal - currentTotal;
  };

  const getTotalPrice = () => {
    const selectedItems = products.filter(p => selectedProducts.has(p._id));
    
    if (bundlePrice && selectedProducts.size > 1) {
      return bundlePrice;
    }
    
    const total = selectedItems.reduce((sum, p) => sum + p.price, 0);
    
    if (discount && selectedProducts.size > 1) {
      return total * (1 - discount / 100);
    }
    
    return total;
  };

  const getTitle = () => {
    if (title) return title;
    
    const titles = {
      upsell: 'Upgrade Your Choice',
      crosssell: 'You Might Also Like',
      bundle: 'Complete Your Look',
      'frequently-bought': 'Frequently Bought Together'
    };
    
    return titles[type];
  };

  const getIcon = () => {
    const icons = {
      upsell: <TrendingUp size={20} />,
      crosssell: <ArrowRight size={20} />,
      bundle: <Gift size={20} />,
      'frequently-bought': <Users size={20} />
    };
    
    return icons[type];
  };

  if (!isVisible || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, maxItems);
  const savings = calculateSavings();
  const totalPrice = getTotalPrice();

  return (
    <motion.div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle()}
          </h3>
        </div>
        
        {/* Timer */}
        {showTimer && timeLeft > 0 && (
          <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
            <Clock size={16} />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Urgency Message */}
      {urgencyMessage && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm font-medium">{urgencyMessage}</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnimatePresence>
          {displayProducts.map((product, index) => {
            const isSelected = selectedProducts.has(product._id);
            const discount = product.originalPrice 
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <motion.div
                key={product._id}
                className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleProductSelection(product._id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    -{discount}%
                  </div>
                )}

                {/* Product Image */}
                <div className="aspect-square rounded-t-lg overflow-hidden">
                  <OptimizedImage
                    src={product.image || 'https://via.placeholder.com/200'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {product.rating} ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">৳{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-500 line-through">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bundle Summary */}
      {selectedProducts.size > 0 && (
        <motion.div
          className="bg-white rounded-lg p-4 border border-gray-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-900">
              Selected Items ({selectedProducts.size})
            </span>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                Total: ৳{totalPrice.toFixed(2)}
              </div>
              {savings > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  You save ৳{savings.toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Discount Badge */}
            {(discount || bundlePrice) && selectedProducts.size > 1 && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {discount ? `${discount}% Off Bundle` : 'Bundle Deal'}
              </div>
            )}
          </div>

          <button
            onClick={handleAddSelectedToCart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart size={20} />
            <span>Add Selected to Cart</span>
          </button>
        </motion.div>
      )}

      {/* Individual Add to Cart */}
      {type !== 'bundle' && selectedProducts.size === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {displayProducts.map((product) => (
            <button
              key={product._id}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <ShoppingCart size={16} />
              <span>Add</span>
            </button>
          ))}
        </div>
      )}

      {/* Trust Signals */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Check size={16} className="text-green-500" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check size={16} className="text-green-500" />
            <span>Easy Returns</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check size={16} className="text-green-500" />
            <span>Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

UpsellCrosssell.displayName = 'UpsellCrosssell';

export default UpsellCrosssell;