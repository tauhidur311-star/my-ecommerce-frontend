import React from 'react';
import { ShoppingCart, Star, Heart } from 'lucide-react';

interface FeaturedProductProps {
  settings?: {
    title?: string;
    subtitle?: string;
    productId?: string;
    showPrice?: boolean;
    showAddToCart?: boolean;
    showWishlist?: boolean;
    showRating?: boolean;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
  };
  styles?: {
    container?: string;
    title?: string;
    subtitle?: string;
    product?: string;
    image?: string;
    content?: string;
    button?: string;
  };
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
  }>;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isEditing?: boolean;
}

const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  settings = {},
  styles = {},
  products = [],
  onAddToCart,
  onAddToWishlist,
  isEditing = false
}) => {
  const {
    title = 'Featured Product',
    subtitle = 'Check out our bestseller',
    productId,
    showPrice = true,
    showAddToCart = true,
    showWishlist = true,
    showRating = true,
    backgroundColor = '#FFFFFF',
    textColor = '#1F2937',
    buttonColor = '#3B82F6',
    alignment = 'center',
    padding = '4rem 1rem',
    margin = '0'
  } = settings;

  // Find the featured product
  const featuredProduct = products.find(p => p._id === productId) || products[0];

  if (!featuredProduct && !isEditing) {
    return null;
  }

  const mockProduct = {
    _id: 'mock-1',
    name: 'Sample Featured Product',
    price: 99.99,
    image: 'https://via.placeholder.com/600x600?text=Featured+Product',
    description: 'This is a sample featured product description that showcases the amazing features.',
    rating: 4.8,
    reviewCount: 124,
    inStock: true
  };

  const product = featuredProduct || mockProduct;

  const getImageUrl = (product: any) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || 'https://via.placeholder.com/600x600?text=No+Image';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }

    return stars;
  };

  return (
    <section
      className={`${styles.container || ''}`}
      style={{
        backgroundColor,
        color: textColor,
        padding,
        margin,
        textAlign: alignment
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-12 ${styles.title || ''}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className={`text-lg opacity-80 ${styles.subtitle || ''}`}>{subtitle}</p>
          )}
        </div>

        {/* Featured Product */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${styles.product || ''}`}>
          {/* Product Image */}
          <div className={`${styles.image || ''}`}>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className={`${styles.content || ''}`} style={{ textAlign: alignment }}>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h3>
            
            {product.description && (
              <p className="text-lg mb-6 opacity-80 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Rating */}
            {showRating && product.rating && (
              <div className={`flex items-center gap-2 mb-6 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm opacity-60">
                  {product.rating} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            {showPrice && (
              <div className="text-3xl font-bold mb-8" style={{ color: buttonColor }}>
                ${product.price?.toFixed(2) || '0.00'}
              </div>
            )}

            {/* Actions */}
            <div className={`flex items-center gap-4 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
              {showAddToCart && (
                <button
                  onClick={() => onAddToCart?.(product)}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${styles.button || ''}`}
                  style={{
                    backgroundColor: buttonColor,
                    color: '#FFFFFF'
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}

              {showWishlist && (
                <button
                  onClick={() => onAddToWishlist?.(product)}
                  className="p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: buttonColor,
                    color: buttonColor
                  }}
                >
                  <Heart className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Stock Status */}
            {!product.inStock && (
              <div className="mt-4 text-sm text-red-600">
                Currently out of stock
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;