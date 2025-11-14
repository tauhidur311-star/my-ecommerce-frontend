import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X, Star, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const EnhancedSearch = ({ onProductSelect, className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Debounced search suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.searchProducts(searchQuery, { limit: 8 });
        
        if (response.success) {
          // Transform products to suggestions
          const productSuggestions = response.data.products.map(product => ({
            type: 'product',
            id: product._id,
            title: product.name,
            subtitle: product.category,
            price: product.price,
            image: getImageUrl(product),
            rating: product.averageRating,
            inStock: product.stock > 0
          }));

          // Add search suggestions
          const searchSuggestions = [
            {
              type: 'search',
              id: `search-${searchQuery}`,
              title: `Search for "${searchQuery}"`,
              query: searchQuery
            }
          ];

          setSuggestions([...searchSuggestions, ...productSuggestions]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      debouncedFetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, debouncedFetchSuggestions]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemSelect = (item) => {
    if (item.type === 'product') {
      if (onProductSelect) {
        onProductSelect(item);
      }
    } else {
      setQuery(item.query || item.title);
      handleSearch(item.query || item.title);
    }
    
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(s => s !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    setIsOpen(false);
  };

  const getImageUrl = (product) => {
    const imageFields = [
      product.images?.[0],
      product.image,
      product.imageUrl
    ];
    
    for (const imageField of imageFields) {
      if (imageField) {
        if (imageField.includes('http')) {
          return imageField;
        }
        return `${process.env.REACT_APP_API_URL}${imageField}`;
      }
    }
    
    return 'https://via.placeholder.com/40?text=?';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, categories, brands..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              searchRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto mt-1">
          {/* Loading */}
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {suggestions.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50`}
                  onClick={() => handleItemSelect(item)}
                >
                  {item.type === 'search' ? (
                    <div className="flex items-center space-x-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{item.title}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40?text=?';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <span className="text-sm font-bold text-blue-600">
                            ৳{item.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {item.subtitle}
                          </span>
                          <div className="flex items-center space-x-2">
                            {item.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                {renderStars(item.rating)}
                                <span className="text-xs text-gray-500">
                                  {item.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {!item.inStock && (
                              <span className="text-xs text-red-500">
                                Out of stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default EnhancedSearch;