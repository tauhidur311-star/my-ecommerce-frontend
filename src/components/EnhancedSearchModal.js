import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';

export default function EnhancedSearchModal({ 
  isOpen, 
  onClose, 
  onSearch, 
  products = [] 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches] = useState(['Shirt', 'Jeans', 'Sneakers', 'Dress']);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load recent searches
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 0) {
      // Generate suggestions based on products
      const filtered = products
        .filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, products]);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      onSearch(searchQuery);
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for products, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gradient-to-r from-gray-50 to-blue-50 focus:from-white focus:to-white shadow-inner"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {query && suggestions.length > 0 && (
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Search size={16} />
                Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(product.name)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/40'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">৳{product.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Clock size={16} />
                  Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(trend)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && suggestions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No products found for "{query}"</p>
              <p className="text-sm mt-2">Try different keywords or browse categories</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">↵</kbd>
                Search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">ESC</kbd>
                Close
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {products.length} products available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}