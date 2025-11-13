import React, { useState, useRef } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Zap, 
  TrendingUp, 
  Clock,
  Package
} from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  image?: string;
  images?: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  stock?: number;
  salesCount?: number;
  badges?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  limitedOffer?: {
    endTime: string;
    text: string;
  };
}

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  showQuickActions?: boolean;
  showSocialProof?: boolean;
  showUrgency?: boolean;
  layout?: 'grid' | 'list';
  priority?: boolean;
  className?: string;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  showQuickActions = true,
  showSocialProof = true,
  showUrgency = true,
  layout = 'grid',
  priority = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const hasMultipleImages = images.length > 1;
  
  // Calculate discount percentage
  const discountPercentage = product.discountPercentage || 
    (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

  // Handle add to cart with animation
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    // Add cart animation
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      createCartAnimation(rect);
    }
    
    try {
      await onAddToCart?.(product);
      
      // Success feedback
      const button = e.target as HTMLElement;
      button.classList.add('animate-bounce');
      setTimeout(() => button.classList.remove('animate-bounce'), 500);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Create flying cart animation
  const createCartAnimation = (rect: DOMRect) => {
    const flyingElement = document.createElement('div');
    flyingElement.className = 'fixed z-50 pointer-events-none transition-all duration-700 ease-out';
    flyingElement.style.left = `${rect.left + rect.width / 2}px`;
    flyingElement.style.top = `${rect.top + rect.height / 2}px`;
    flyingElement.innerHTML = `
      <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13h10m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z"></path>
        </svg>
      </div>
    `;
    
    document.body.appendChild(flyingElement);
    
    // Animate to cart icon
    setTimeout(() => {
      const cartElement = document.querySelector('[data-cart-icon]');
      if (cartElement) {
        const cartRect = cartElement.getBoundingClientRect();
        flyingElement.style.left = `${cartRect.left}px`;
        flyingElement.style.top = `${cartRect.top}px`;
        flyingElement.style.transform = 'scale(0.5)';
        flyingElement.style.opacity = '0';
      }
    }, 100);
    
    // Remove element after animation
    setTimeout(() => {
      document.body.removeChild(flyingElement);
    }, 800);
  };

  // Handle wishlist toggle
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsInWishlist(!isInWishlist);
    onAddToWishlist?.(product);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Render badges
  const renderBadges = () => {
    const badges = [];
    
    if (product.isNew) badges.push({ text: 'New', color: 'bg-green-500' });
    if (product.isBestseller) badges.push({ text: 'Bestseller', color: 'bg-orange-500' });
    if (discountPercentage > 0) badges.push({ text: `${discountPercentage}% OFF`, color: 'bg-red-500' });
    if (product.stock && product.stock <= 5) badges.push({ text: 'Low Stock', color: 'bg-yellow-500' });
    
    return badges.map((badge, index) => (
      <span
        key={index}
        className={`inline-block px-2 py-1 text-xs font-bold text-white rounded ${badge.color} mb-1 mr-1`}
      >
        {badge.text}
      </span>
    ));
  };

  // Render urgency indicators
  const renderUrgency = () => {
    if (!showUrgency) return null;
    
    const urgencyItems = [];
    
    if (product.salesCount && product.salesCount > 10) {
      urgencyItems.push(
        <div key="sales" className="flex items-center text-xs text-green-600 mb-1">
          <TrendingUp className="w-3 h-3 mr-1" />
          {product.salesCount} sold
        </div>
      );
    }
    
    if (product.stock && product.stock <= 5) {
      urgencyItems.push(
        <div key="stock" className="flex items-center text-xs text-red-600 mb-1">
          <Clock className="w-3 h-3 mr-1" />
          Only {product.stock} left
        </div>
      );
    }
    
    if (product.limitedOffer) {
      urgencyItems.push(
        <div key="offer" className="flex items-center text-xs text-orange-600 mb-1">
          <Zap className="w-3 h-3 mr-1" />
          {product.limitedOffer.text}
        </div>
      );
    }
    
    return urgencyItems.length > 0 ? (
      <div className="mt-2">
        {urgencyItems}
      </div>
    ) : null;
  };

  // Card content for grid layout
  const renderGridContent = () => (
    <div
      ref={cardRef}
      className={`
        group relative bg-white rounded-xl shadow-sm hover:shadow-xl 
        transition-all duration-300 transform hover:-translate-y-1 overflow-hidden
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage
          src={images[currentImageIndex] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full"
          priority={priority}
          progressive={!priority}
          aspectRatio="1/1"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10">
          {renderBadges()}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full 
                     opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
        >
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>
        
        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView?.(product);
                }}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Image Navigation for Multiple Images */}
        {hasMultipleImages && isHovered && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Rating and Reviews */}
        {showSocialProof && product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-blue-600">
            ৳{product.price?.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Urgency Indicators */}
        {renderUrgency()}
        
        {/* Stock Status */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`
            w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
            transform hover:scale-105 active:scale-95
            ${product.inStock 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isAddingToCart ? 'opacity-75' : ''}
          `}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Adding...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </div>
          )}
        </button>
      </div>
    </div>
  );

  // Card content for list layout
  const renderListContent = () => (
    <div
      ref={cardRef}
      className={`
        group flex bg-white rounded-xl shadow-sm hover:shadow-xl 
        transition-all duration-300 overflow-hidden
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <OptimizedImage
          src={images[currentImageIndex] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full"
          priority={priority}
          aspectRatio="1/1"
        />
        
        <div className="absolute top-2 left-2">
          {renderBadges()}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-xl mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {product.description}
          </p>
          
          {showSocialProof && product.rating && (
            <div className="flex items-center gap-1 mb-4">
              <div className="flex">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-600">
                ৳{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {renderUrgency()}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWishlist}
              className="p-2 border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView?.(product);
              }}
              className="p-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`
                py-2 px-6 rounded-lg font-medium transition-all duration-200
                ${product.inStock 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isAddingToCart ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return layout === 'list' ? renderListContent() : renderGridContent();
};

export default EnhancedProductCard;