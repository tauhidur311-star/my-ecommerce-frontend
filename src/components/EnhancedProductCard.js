import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';

export default function EnhancedProductCard({ 
  product, 
  index, 
  onProductClick, 
  onQuickView, 
  onAddToWishlist, 
  isWishlisted = false 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageHover = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const currentImage = product.images && product.images[currentImageIndex] 
    ? product.images[currentImageIndex] 
    : 'https://via.placeholder.com/300';

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 opacity-0 animate-fade-in-up"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
      onClick={() => onProductClick(product)}
    >
      {/* Image Container with Overlays */}
      <div className="relative overflow-hidden bg-gray-100">
        <div className="aspect-square relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onMouseEnter={handleImageHover}
            onMouseLeave={handleImageLeave}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                NEW
              </span>
            )}
            {product.discount && (
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                -{product.discount}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-8 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToWishlist(product.id);
              }}
              className={`p-2 rounded-full shadow-lg transition-colors duration-300 ${
                isWishlisted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-blue-500 rounded-full shadow-lg transition-colors duration-300"
            >
              <Eye size={18} />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              className="w-full bg-black/80 hover:bg-black text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Quick Add
            </button>
          </div>

          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Sales Info */}
        {(product.sold && product.showSoldNumbers) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-green-500" />
              <span className="text-sm text-gray-600">
                {product.sold} sold
              </span>
            </div>
          </div>
        )}
        
        {/* Rating Info */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              {product.rating}
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between">
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
          {product.stock === 0 ? (
            <span className="text-sm text-red-500 font-medium">Out of Stock</span>
          ) : (
            <span className="text-sm text-green-600 font-medium">In Stock</span>
          )}
        </div>

        {/* Size Preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-xs text-gray-500">Sizes:</span>
            <div className="flex gap-1">
              {product.sizes.slice(0, 4).map((size, idx) => (
                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{product.sizes.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}