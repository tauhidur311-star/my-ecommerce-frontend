import React, { useState } from 'react';
import { 
  X, Type, AlignLeft, Square, Image, Video, ArrowDown, AlignCenter,
  Columns, Grid3x3, Link2, Star, Heart, ShoppingCart, Clock, MapPin,
  Phone, Mail, Quote, Calendar, Search, Plus, ChevronRight
} from 'lucide-react';

const AddBlockModal = ({
  isOpen,
  onClose,
  onAddBlock,
  sectionId
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const blockCategories = {
    all: 'All Blocks',
    text: 'Text & Content',
    media: 'Media',
    layout: 'Layout',
    interactive: 'Interactive',
    ecommerce: 'E-commerce',
    social: 'Social'
  };

  const blockTypes = [
    // Text & Content
    {
      type: 'heading',
      name: 'Heading',
      description: 'Add titles and headings',
      icon: Type,
      category: 'text',
      preview: 'H1'
    },
    {
      type: 'paragraph',
      name: 'Paragraph',
      description: 'Rich text content',
      icon: AlignLeft,
      category: 'text',
      preview: 'Lorem ipsum...'
    },
    {
      type: 'quote',
      name: 'Quote',
      description: 'Customer testimonials or quotes',
      icon: Quote,
      category: 'text',
      preview: '"Quote"'
    },
    {
      type: 'list',
      name: 'List',
      description: 'Bulleted or numbered lists',
      icon: AlignLeft,
      category: 'text',
      preview: '• Item 1\n• Item 2'
    },

    // Media
    {
      type: 'image',
      name: 'Image',
      description: 'Photos and graphics',
      icon: Image,
      category: 'media',
      preview: '🖼️'
    },
    {
      type: 'video',
      name: 'Video',
      description: 'Embedded videos',
      icon: Video,
      category: 'media',
      preview: '▶️'
    },
    {
      type: 'gallery',
      name: 'Image Gallery',
      description: 'Multiple images in a grid',
      icon: Grid3x3,
      category: 'media',
      preview: '🖼️ 🖼️\n🖼️ 🖼️'
    },

    // Layout
    {
      type: 'spacer',
      name: 'Spacer',
      description: 'Add vertical spacing',
      icon: ArrowDown,
      category: 'layout',
      preview: '⬇️'
    },
    {
      type: 'divider',
      name: 'Divider',
      description: 'Horizontal line separator',
      icon: AlignCenter,
      category: 'layout',
      preview: '——————'
    },
    {
      type: 'columns',
      name: 'Columns',
      description: 'Multi-column layout',
      icon: Columns,
      category: 'layout',
      preview: '||  ||'
    },

    // Interactive
    {
      type: 'button',
      name: 'Button',
      description: 'Call-to-action buttons',
      icon: Square,
      category: 'interactive',
      preview: '[Button]'
    },
    {
      type: 'form',
      name: 'Form',
      description: 'Contact or signup forms',
      icon: Mail,
      category: 'interactive',
      preview: '📝 Form'
    },
    {
      type: 'search',
      name: 'Search Bar',
      description: 'Product or content search',
      icon: Search,
      category: 'interactive',
      preview: '🔍 Search'
    },

    // E-commerce
    {
      type: 'product',
      name: 'Product Card',
      description: 'Individual product display',
      icon: ShoppingCart,
      category: 'ecommerce',
      preview: '🛍️ Product'
    },
    {
      type: 'price',
      name: 'Price Display',
      description: 'Product pricing information',
      icon: Star,
      category: 'ecommerce',
      preview: '$99.99'
    },
    {
      type: 'cart',
      name: 'Add to Cart',
      description: 'Shopping cart button',
      icon: ShoppingCart,
      category: 'ecommerce',
      preview: '[Add to Cart]'
    },

    // Social
    {
      type: 'social-links',
      name: 'Social Links',
      description: 'Social media icons',
      icon: Heart,
      category: 'social',
      preview: '📘 🐦 📷'
    },
    {
      type: 'share',
      name: 'Share Buttons',
      description: 'Social sharing options',
      icon: Heart,
      category: 'social',
      preview: 'Share ➤'
    },
    {
      type: 'reviews',
      name: 'Reviews',
      description: 'Customer reviews display',
      icon: Star,
      category: 'social',
      preview: '⭐⭐⭐⭐⭐'
    },

    // Additional useful blocks
    {
      type: 'map',
      name: 'Map',
      description: 'Location map embed',
      icon: MapPin,
      category: 'interactive',
      preview: '🗺️ Map'
    },
    {
      type: 'contact',
      name: 'Contact Info',
      description: 'Address and contact details',
      icon: Phone,
      category: 'text',
      preview: '📞 Contact'
    },
    {
      type: 'countdown',
      name: 'Countdown Timer',
      description: 'Event or sale countdown',
      icon: Clock,
      category: 'interactive',
      preview: '⏰ 00:00'
    },
    {
      type: 'calendar',
      name: 'Calendar',
      description: 'Event calendar display',
      icon: Calendar,
      category: 'interactive',
      preview: '📅 Calendar'
    }
  ];

  const filteredBlocks = blockTypes.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBlock = (blockType) => {
    onAddBlock(sectionId, blockType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Block</h2>
              <p className="text-gray-600">Choose a block to add to your section</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(blockCategories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {Object.entries(blockCategories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => (
                <button
                  key={block.type}
                  onClick={() => handleAddBlock(block.type)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                        <block.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                          {block.name}
                        </h3>
                        <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                          {blockCategories[block.category]}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <p className="text-sm text-gray-600 group-hover:text-gray-800 mb-3">
                    {block.description}
                  </p>
                  
                  {/* Block Preview */}
                  <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-3 transition-colors">
                    <div className="text-xs text-gray-500 mb-1">Preview:</div>
                    <div className="text-sm font-mono text-gray-700 whitespace-pre-line">
                      {block.preview}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>

        {/* Quick Add Section */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Quick Add</p>
              <p className="text-sm text-gray-600">Common blocks for faster workflow</p>
            </div>
            <div className="flex gap-2">
              {[
                { type: 'heading', icon: Type, name: 'Heading' },
                { type: 'paragraph', icon: AlignLeft, name: 'Text' },
                { type: 'image', icon: Image, name: 'Image' },
                { type: 'button', icon: Square, name: 'Button' }
              ].map(block => (
                <button
                  key={block.type}
                  onClick={() => handleAddBlock(block.type)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  title={`Add ${block.name}`}
                >
                  <block.icon className="w-5 h-5 text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlockModal;