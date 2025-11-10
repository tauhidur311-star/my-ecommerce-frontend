import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal, Star, Tag } from 'lucide-react';

const EnhancedSearchFilters = ({ 
  products = [], 
  onFilteredResults = () => {}, 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: '', max: '' },
    inStock: 'all',
    rating: '',
    sizes: [],
    colors: [],
    sortBy: 'newest'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceStats, setPriceStats] = useState({ min: 0, max: 0 });

  // Extract filter options from products
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sizes: [],
    colors: [],
    maxPrice: 0,
    minPrice: 0
  });

  useEffect(() => {
    // Generate filter options from products
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
    const sizes = [...new Set(products.flatMap(p => p.sizes || []))].filter(Boolean);
    const colors = [...new Set(products.flatMap(p => p.colors || []))].filter(Boolean);
    const prices = products.map(p => p.price).filter(p => p > 0);
    
    setFilterOptions({
      categories,
      sizes,
      colors,
      maxPrice: Math.max(...prices, 0),
      minPrice: Math.min(...prices, 0)
    });

    setPriceStats({
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0)
    });
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, products]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = () => {
    let filtered = [...products];

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        (product.colors && product.colors.some(color => 
          color.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.priceRange.max));
    }

    // Stock filter
    if (filters.inStock === 'in_stock') {
      filtered = filtered.filter(product => product.inStock);
    } else if (filters.inStock === 'out_of_stock') {
      filtered = filtered.filter(product => !product.inStock);
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(product => 
        product.rating && product.rating >= minRating
      );
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.some(size => filters.sizes.includes(size))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => 
          filters.colors.some(filterColor => 
            color.toLowerCase().includes(filterColor.toLowerCase())
          )
        )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    onFilteredResults(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterChange = (filterType, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      priceRange: { min: '', max: '' },
      inStock: 'all',
      rating: '',
      sizes: [],
      colors: [],
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           filters.category || 
           filters.priceRange.min || 
           filters.priceRange.max ||
           filters.inStock !== 'all' ||
           filters.rating ||
           filters.sizes.length > 0 ||
           filters.colors.length > 0 ||
           filters.sortBy !== 'newest';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products, categories, colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showAdvancedFilters 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quick:</span>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (৳)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value
                  })}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
                  min="0"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value
                  })}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
                  min="0"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Range: ৳{priceStats.min.toLocaleString()} - ৳{priceStats.max.toLocaleString()}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            {/* Sizes */}
            {filterOptions.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map(size => (
                    <label
                      key={size}
                      className={`px-3 py-1 text-sm rounded-full border cursor-pointer transition-colors ${
                        filters.sizes.includes(size)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size)}
                        onChange={(e) => handleArrayFilterChange('sizes', size, e.target.checked)}
                        className="hidden"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {filterOptions.colors.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.map(color => (
                    <label
                      key={color}
                      className={`px-3 py-1 text-sm rounded-full border cursor-pointer transition-colors ${
                        filters.colors.includes(color)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={(e) => handleArrayFilterChange('colors', color, e.target.checked)}
                        className="hidden"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                <Search size={12} />
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <Tag size={12} />
                {filters.category}
                <button onClick={() => handleFilterChange('category', '')}>
                  <X size={12} />
                </button>
              </span>
            )}
            
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                ৳{filters.priceRange.min || 0} - ৳{filters.priceRange.max || '∞'}
                <button onClick={() => handleFilterChange('priceRange', { min: '', max: '' })}>
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.rating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                <Star size={12} />
                {filters.rating}+ stars
                <button onClick={() => handleFilterChange('rating', '')}>
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.sizes.map(size => (
              <span key={size} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                Size {size}
                <button onClick={() => handleArrayFilterChange('sizes', size, false)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            
            {filters.colors.map(color => (
              <span key={color} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                {color}
                <button onClick={() => handleArrayFilterChange('colors', color, false)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchFilters;