import React, { useState, useEffect } from 'react';
import { Search, Star, Download, Eye, Copy, Plus, Folder, Filter, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

const SectionLibrary = ({ onAddSection, onClose }) => {
  const [reusableBlocks, setReusableBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular'); // popular, recent, name

  const categories = [
    { id: 'all', name: 'All Blocks', count: 0 },
    { id: 'hero', name: 'Hero Sections', count: 0 },
    { id: 'product', name: 'Product Sections', count: 0 },
    { id: 'content', name: 'Content Sections', count: 0 },
    { id: 'testimonial', name: 'Testimonials', count: 0 },
    { id: 'footer', name: 'Footers', count: 0 },
    { id: 'navigation', name: 'Navigation', count: 0 },
    { id: 'gallery', name: 'Galleries', count: 0 },
    { id: 'form', name: 'Forms', count: 0 }
  ];

  useEffect(() => {
    loadReusableBlocks();
  }, []);

  const loadReusableBlocks = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      const response = await fetch('/api/reusable-blocks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReusableBlocks(data.data);
      }
    } catch (error) {
      console.error('Error loading reusable blocks:', error);
      // Load sample data for demo
      loadSampleBlocks();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleBlocks = () => {
    const sampleBlocks = [
      {
        _id: 'hero-1',
        name: 'Modern Hero',
        description: 'Clean and modern hero section with call-to-action',
        category: 'hero',
        type: 'hero',
        tags: ['modern', 'clean', 'cta'],
        usageCount: 45,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUY2Qzk3Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+SGVybyBUaXRsZTwvdGV4dD4KPHR5cGUgeD0iMjAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0Ij5TdWJ0aXRsZSBnb2VzIGhlcmU8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiI+Q1RBIEJVVFRPTJY8L3RleHQ+Cjwvc3ZnPgo=',
        settings: {
          title: 'Transform Your Business Today',
          subtitle: 'Join thousands of companies that trust our solutions to drive growth and innovation',
          buttonText: 'Get Started Free',
          buttonLink: '#signup',
          backgroundColor: '#1f6b97',
          textColor: '#ffffff',
          textAlign: 'center',
          padding: { top: 100, bottom: 100 }
        }
      },
      {
        _id: 'hero-2',
        name: 'E-commerce Hero',
        description: 'Product-focused hero section with featured product',
        category: 'hero',
        type: 'hero',
        tags: ['ecommerce', 'product', 'sale'],
        usageCount: 32,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjU5RTBCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCI+U3VtbWVyIFNhbGU8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiPjUwJSBPRkY8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCI+T24gYWxsIGZlYXR1cmVkIGl0ZW1zPC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiPlNIT1AgTk9XPC90ZXh0Pgo8L3N2Zz4K',
        settings: {
          title: 'Summer Sale',
          subtitle: '50% OFF on all featured items',
          buttonText: 'Shop Now',
          buttonLink: '#sale',
          backgroundColor: '#f59e0b',
          textColor: '#ffffff',
          textAlign: 'center',
          padding: { top: 80, bottom: 80 }
        }
      },
      {
        _id: 'product-grid-1',
        name: 'Featured Products',
        description: 'Clean product grid with filters',
        category: 'product',
        type: 'product-grid',
        tags: ['products', 'grid', 'featured'],
        usageCount: 28,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzNzQxNTEiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5GZWF0dXJlZCBQcm9kdWN0czwvdGV4dD4KPHI+Y3QgeD0iNTAiIHk9IjYwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTVFN0VCIiByeD0iOCIvPgo8cmVjdCB4PSIxNjAiIHk9IjYwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTVFN0VCIiByeD0iOCIvPgo8cmVjdCB4PSIyNzAiIHk9IjYwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTVFN0VCIiByeD0iOCIvPgo8L3N2Zz4K',
        settings: {
          title: 'Featured Products',
          subtitle: 'Our best-selling items',
          limit: 6,
          columns: 3,
          sort: 'featured',
          showTitle: true,
          showFilters: true,
          padding: { top: 60, bottom: 60 }
        }
      },
      {
        _id: 'testimonial-1',
        name: 'Customer Reviews',
        description: 'Showcase customer testimonials with ratings',
        category: 'testimonial',
        type: 'testimonials',
        tags: ['testimonial', 'reviews', 'social-proof'],
        usageCount: 19,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzNzQxNTEiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5XaGF0IE91ciBDdXN0b21lcnMgU2F5PC90ZXh0Pgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiNEMUQ1REIiLz4KPHR5cGUgeD0iMjAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc0ODQiIGZvbnQtc2l6ZT0iMTQiPiJBbWF6aW5nIHByb2R1Y3QgYW5kIGV4Y2VsbGVudCBzZXJ2aWNlISI8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LXNpemU9IjEyIj5Kb2huIERvZTwvdGV4dD4KPHR5cGUgeD0iMjAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGNTlFMEIiIGZvbnQtc2l6ZT0iMTYiPuKYhSDouIUg4piFIOKYhSDiloU8L3RleHQ+Cjwvc3ZnPgo=',
        settings: {
          title: 'What Our Customers Say',
          backgroundColor: '#f9fafb',
          testimonials: [
            {
              name: 'Sarah Johnson',
              content: 'Outstanding quality and customer service. Highly recommended!',
              rating: 5,
              company: 'Tech Startup Inc.'
            },
            {
              name: 'Mike Chen',
              content: 'Game-changing solution for our business. Worth every penny.',
              rating: 5,
              company: 'Digital Solutions'
            }
          ],
          padding: { top: 80, bottom: 80 }
        }
      }
    ];
    
    setReusableBlocks(sampleBlocks);
  };

  const filteredBlocks = reusableBlocks.filter(block => {
    const matchesSearch = !searchTerm || 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => block.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const sortedBlocks = [...filteredBlocks].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usageCount - a.usageCount;
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleUseBlock = async (block) => {
    try {
      // Create new section from reusable block
      const newSection = {
        id: `${block.type}-${Date.now()}`,
        type: block.type,
        settings: { ...block.settings }
      };
      
      onAddSection(newSection);
      
      // Increment usage count (API call)
      try {
        await fetch(`/api/reusable-blocks/${block._id}/use`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Failed to update usage count:', error);
      }
      
      toast.success(`Added ${block.name} to your page`);
      onClose();
    } catch (error) {
      console.error('Error using block:', error);
      toast.error('Failed to add block');
    }
  };

  const getBlockPreview = (block) => {
    if (block.preview) {
      return block.preview;
    }
    
    // Generate default preview based on type
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="#F3F4F6"/>
        <text x="200" y="100" text-anchor="middle" fill="#6B7280" font-size="16">${block.type.toUpperCase()}</text>
      </svg>
    `)}`;
  };

  const availableTags = [...new Set(reusableBlocks.flatMap(block => block.tags))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Section Library</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 py-1">Tags:</span>
                {availableTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const count = category.id === 'all' 
                  ? reusableBlocks.length 
                  : reusableBlocks.filter(block => block.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedBlocks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-medium mb-2">No sections found</p>
                  <p>Try adjusting your search or filters</p>
                </div>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBlocks.map((block) => (
                  <div
                    key={block._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Preview */}
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={getBlockPreview(block)}
                        alt={block.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{block.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-3 h-3 mr-1" />
                          {block.usageCount}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{block.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {block.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {block.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{block.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUseBlock(block)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Use Section
                        </button>
                        <button
                          onClick={() => {
                            // Preview functionality
                            console.log('Preview:', block);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Copy to clipboard functionality
                            navigator.clipboard.writeText(JSON.stringify(block.settings));
                            toast.success('Settings copied to clipboard');
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Copy Settings"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {sortedBlocks.map((block) => (
                  <div
                    key={block._id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Preview */}
                      <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={getBlockPreview(block)}
                          alt={block.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{block.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-3 h-3 mr-1" />
                            {block.usageCount}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{block.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {block.tags.slice(0, 5).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUseBlock(block)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Use
                        </button>
                        <button
                          onClick={() => {
                            console.log('Preview:', block);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLibrary;