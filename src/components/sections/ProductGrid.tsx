import React from 'react';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';

interface ProductGridProps {
  settings?: {
    title?: string;
    subtitle?: string;
    productsToShow?: number;
    columns?: number;
    showPrices?: boolean;
    showAddToCart?: boolean;
    showQuickView?: boolean;
    showWishlist?: boolean;
    showRating?: boolean;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    padding?: string;
    margin?: string;
    filterByCategory?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
  };
  styles?: {
    container?: string;
    title?: string;
    subtitle?: string;
    grid?: string;
    card?: string;
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
    category?: string;
    inStock?: boolean;
    createdAt?: string;
  }>;
  onAddToCart?: (product: any) => void;
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isEditing?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  settings = {},
  styles = {},
  products = [],
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  isEditing = false
}) => {
  const {
    title = 'Our Products',
    subtitle = 'Discover our amazing collection',
    productsToShow = 8,
    columns = 4,
    showPrices = true,
    showAddToCart = true,
    showQuickView = true,
    showWishlist = true,
    showRating = true,
    backgroundColor = '#FFFFFF',
    textColor = '#1F2937',
    buttonColor = '#3B82F6',
    padding = '4rem 1rem',
    margin = '0',
    filterByCategory,
    sortBy = 'name',
    sortOrder = 'asc'
  } = settings;

  // Mock products for editing mode
  const mockProducts = Array.from({ length: 8 }, (_, i) => ({
    _id: `mock-${i + 1}`,
    name: `Sample Product ${i + 1}`,
    price: 29.99 + (i * 10),
    image: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
    description: `This is a sample product description for product ${i + 1}.`,
    rating: 4 + (Math.random() * 1),
    reviewCount: Math.floor(Math.random() * 100) + 10,
    category: ['Electronics', 'Clothing', 'Home', 'Sports'][i % 4],
    inStock: Math.random() > 0.1,
    createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
  }));

  const displayProducts = products.length > 0 ? products : mockProducts;

  // Filter and sort products
  let filteredProducts = [...displayProducts];

  // Filter by category
  if (filterByCategory && filterByCategory !== 'all') {
    filteredProducts = filteredProducts.filter(
      product => product.category?.toLowerCase() === filterByCategory.toLowerCase()
    );
  }

  // Sort products
  filteredProducts.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'newest':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'name':
      default:
        comparison = a.name.localeCompare(b.name);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Limit products to show
  filteredProducts = filteredProducts.slice(0, productsToShow);

  const getImageUrl = (product: any) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const getGridCols = () => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };
    return colsMap[columns as keyof typeof colsMap] || colsMap[4];
  };

  return (
    <section
      className={`${styles.container || ''}`}
      style={{
        backgroundColor,
        color: textColor,
        padding,
        margin
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className={`text-center mb-12 ${styles.title || ''}`}>
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className={`text-lg opacity-80 max-w-2xl mx-auto ${styles.subtitle || ''}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className={`grid ${getGridCols()} gap-6 ${styles.grid || ''}`}>
          {filteredProducts.map((product, index) => (
            <div
              key={product._id || index}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${styles.card || ''}`}
            >
              {/* Product Image */}
              <div className={`relative aspect-square bg-gray-100 overflow-hidden ${styles.image || ''}`}>
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {showQuickView && (
                      <button
                        onClick={() => onQuickView?.(product)}
                        className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" style={{ color: buttonColor }} />
                      </button>
                    )}
                    
                    {showWishlist && (
                      <button
                        onClick={() => onAddToWishlist?.(product)}
                        className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        title="Add to Wishlist"
                      >
                        <Heart className="w-4 h-4" style={{ color: buttonColor }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stock Badge */}
                {!product.inStock && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-4 ${styles.content || ''}`}>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                
                {/* Rating */}
                {showRating && product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                {showPrices && (
                  <div className="text-xl font-bold mb-4" style={{ color: buttonColor }}>
                    ${product.price?.toFixed(2) || '0.00'}
                  </div>
                )}

                {/* Add to Cart Button */}
                {showAddToCart && (
                  <button
                    onClick={() => onAddToCart?.(product)}
                    disabled={!product.inStock}
                    className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${styles.button || ''}`}
                    style={{
                      backgroundColor: product.inStock ? buttonColor : '#9CA3AF',
                      color: '#FFFFFF'
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && !isEditing && (
          <div className="text-center py-12">
            <p className="text-lg opacity-60">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;