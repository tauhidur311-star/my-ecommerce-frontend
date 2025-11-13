import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Share2, Eye } from 'lucide-react';
import { playHover } from '../../utils/soundManager';

/**
 * Animated Card Component with hover effects and interactions
 * 
 * Features:
 * - Smooth hover animations and transitions
 * - Loading states with skeleton animation
 * - Interactive elements (like, share, view)
 * - Multiple layout variants
 * - Sound effects for interactions
 * - Glass morphism design option
 * 
 * Usage:
 * <AnimatedCard
 *   variant="product"
 *   loading={false}
 *   onLike={handleLike}
 *   onShare={handleShare}
 *   onClick={handleClick}
 * >
 *   <CardContent />
 * </AnimatedCard>
 */

const AnimatedCard = ({
  children,
  variant = 'default',
  loading = false,
  onClick,
  onLike,
  onShare,
  onView,
  className = '',
  soundEnabled = true,
  showActions = false,
  liked = false,
  viewCount = 0,
  glassMorphism = false,
  elevation = 'medium'
}) => {
  const [isLiked, setIsLiked] = useState(liked);
  const [views, setViews] = useState(viewCount);

  // Card variants for different use cases
  const variants = {
    default: 'bg-white border border-gray-200',
    product: 'bg-white border border-gray-200 hover:border-blue-300',
    profile: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
    feature: 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30'
  };

  // Elevation levels
  const elevations = {
    none: 'shadow-none',
    small: 'shadow-sm hover:shadow-md',
    medium: 'shadow-md hover:shadow-lg',
    large: 'shadow-lg hover:shadow-xl',
    xlarge: 'shadow-xl hover:shadow-2xl'
  };

  // Animation variants
  const cardVariants = {
    initial: {
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    hover: {
      scale: 1.03,
      y: -8,
      rotateY: 2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Action button variants
  const actionVariants = {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    hover: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  // Handle interactions
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      if (soundEnabled) playHover();
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) onLike(!isLiked);
    if (soundEnabled) playHover();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) onShare();
    if (soundEnabled) playHover();
  };

  const handleView = (e) => {
    e.stopPropagation();
    setViews(prev => prev + 1);
    if (onView) onView();
    if (soundEnabled) playHover();
  };

  const handleMouseEnter = () => {
    if (soundEnabled) playHover();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`
        rounded-xl p-6 animate-pulse
        ${glassMorphism ? variants.glass : variants[variant]}
        ${elevations[elevation]}
        ${className}
      `}>
        <div className="space-y-4">
          {/* Image skeleton */}
          <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
            <div className="bg-gray-200 rounded h-4 w-1/2"></div>
          </div>
          
          {/* Actions skeleton */}
          {showActions && (
            <div className="flex space-x-2 pt-4">
              <div className="bg-gray-200 rounded-full h-8 w-8"></div>
              <div className="bg-gray-200 rounded-full h-8 w-8"></div>
              <div className="bg-gray-200 rounded-full h-8 w-8"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${glassMorphism ? variants.glass : variants[variant]}
        ${elevations[elevation]}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Action buttons overlay */}
      {showActions && (
        <motion.div
          variants={actionVariants}
          className="absolute top-4 right-4 flex flex-col space-y-2"
        >
          {/* Like button */}
          <motion.button
            variants={actionVariants}
            onClick={handleLike}
            className={`
              p-2 rounded-full backdrop-blur-sm transition-colors
              ${isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-500'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart 
              size={16} 
              className={isLiked ? 'fill-current' : ''} 
            />
          </motion.button>

          {/* Share button */}
          <motion.button
            variants={actionVariants}
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-blue-50 hover:text-blue-500 backdrop-blur-sm transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={16} />
          </motion.button>

          {/* View button */}
          <motion.button
            variants={actionVariants}
            onClick={handleView}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-green-50 hover:text-green-500 backdrop-blur-sm transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-1">
              <Eye size={16} />
              {views > 0 && (
                <span className="text-xs font-medium">{views}</span>
              )}
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
        >
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </motion.div>
      )}

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
        whileHover={{
          opacity: [0, 1, 0],
          x: ['-100%', '100%'],
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />
    </motion.div>
  );
};

// Specialized card components for different use cases

// Product card with image and details
export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails,
  loading = false,
  ...props 
}) => (
  <AnimatedCard
    variant="product"
    showActions={true}
    onLike={() => console.log('Liked product:', product?.id)}
    onShare={() => console.log('Shared product:', product?.id)}
    onClick={onViewDetails}
    loading={loading}
    {...props}
  >
    {!loading && product && (
      <div className="p-4">
        {/* Product image */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Product details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              ${product.price}
            </span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Add to cart button */}
        {onAddToCart && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add to Cart
          </motion.button>
        )}
      </div>
    )}
  </AnimatedCard>
);

// Profile/user card
export const ProfileCard = ({ user, loading = false, ...props }) => (
  <AnimatedCard
    variant="profile"
    glassMorphism={true}
    loading={loading}
    {...props}
  >
    {!loading && user && (
      <div className="p-6 text-center">
        <motion.img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {user.name}
        </h3>
        <p className="text-gray-600 mb-4">{user.bio}</p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>{user.followers} followers</span>
          <span>{user.following} following</span>
        </div>
      </div>
    )}
  </AnimatedCard>
);

// Feature highlight card
export const FeatureCard = ({ feature, loading = false, ...props }) => (
  <AnimatedCard
    variant="feature"
    elevation="large"
    loading={loading}
    {...props}
  >
    {!loading && feature && (
      <div className="p-6 text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 text-purple-600"
          whileHover={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600">{feature.description}</p>
      </div>
    )}
  </AnimatedCard>
);

export default AnimatedCard;