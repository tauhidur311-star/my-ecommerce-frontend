import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  ChevronUp,
  ChevronDown,
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface StickyCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  minimumCartValue?: number;
  freeShippingThreshold?: number;
  currency?: string;
}

const StickyCart: React.FC<StickyCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  className = '',
  position = 'bottom-right',
  minimumCartValue = 0,
  freeShippingThreshold = 2000,
  currency = '৳'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isEligibleForFreeShipping = totalPrice >= freeShippingThreshold;
  const freeShippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - totalPrice, 0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsExpanded(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Auto-expand when items are added
  useEffect(() => {
    if (totalItems > 0 && !isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
        // Auto-collapse after 3 seconds
        setTimeout(() => setIsExpanded(false), 3000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getImageUrl = (image?: string) => {
    if (!image) return 'https://via.placeholder.com/60x60?text=Product';
    if (image.startsWith('http')) return image;
    return `${process.env.REACT_APP_API_URL}/uploads/${image}`;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${getPositionClasses()} ${className}`}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="relative">
            {/* Expanded Cart */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Shopping Cart ({totalItems})
                      </h3>
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Free Shipping Progress */}
                    {!isEligibleForFreeShipping && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Free shipping</span>
                          <span>{currency}{remainingForFreeShipping} away</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${freeShippingProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {isEligibleForFreeShipping && (
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <Truck size={14} className="mr-1" />
                        <span>Free shipping unlocked!</span>
                      </div>
                    )}
                  </div>

                  {/* Cart Items */}
                  <div className="max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.size}`}
                        className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0"
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {(item.size || item.color) && (
                            <p className="text-xs text-gray-500">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-gray-900">
                            {currency}{item.price}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 hover:bg-red-100 rounded-md transition-colors text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-gray-900">
                        {currency}{totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={onCheckout}
                        disabled={totalPrice < minimumCartValue}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <CreditCard size={16} />
                        <span>Checkout</span>
                      </button>
                      
                      {items.length > 0 && (
                        <button
                          onClick={onClearCart}
                          className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Clear Cart
                        </button>
                      )}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Shield size={12} />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck size={12} />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart Button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={24} />
              
              {/* Item Count Badge */}
              <motion.span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalItems}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </motion.span>

              {/* Expand/Collapse Indicator */}
              <motion.div
                className="absolute -top-1 -left-1 text-blue-600 bg-white rounded-full p-1"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={12} />
              </motion.div>
            </motion.button>

            {/* Mini Price Display */}
            {!isExpanded && totalPrice > 0 && (
              <motion.div
                className="absolute -top-8 right-0 bg-black text-white px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currency}{totalPrice.toFixed(2)}
                <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-black" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCart;