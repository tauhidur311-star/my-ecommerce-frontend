import React, { useState } from 'react';
import { 
  X, Search, Layout, Image, Type, Grid3x3, Users, ShoppingBag, 
  MessageSquare, Star, Video, Columns, Package, Tag, Phone, Mail,
  Heart, BarChart3, Gift, Clock, MapPin, FileText, Maximize2
} from 'lucide-react';

const AddSectionModal = ({
  isOpen,
  onClose,
  onAddSection,
  sectionTypes = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const sectionCategories = {
    all: 'All Sections',
    header: 'Header & Navigation',
    hero: 'Hero & Banners',
    content: 'Content',
    products: 'Products',
    media: 'Media',
    social: 'Social Proof',
    forms: 'Forms & CTAs',
    footer: 'Footer'
  };

  const defaultSectionTypes = [
    // Header & Navigation
    { type: 'announcement', name: 'Announcement Bar', icon: Maximize2, description: 'Promotional top bar', category: 'header' },
    { type: 'header', name: 'Header', icon: Layout, description: 'Navigation bar with logo & menu', category: 'header' },
    
    // Hero & Banners
    { type: 'hero', name: 'Hero Banner', icon: Image, description: 'Large banner with CTA', category: 'hero' },
    { type: 'slideshow', name: 'Slideshow', icon: Video, description: 'Image carousel', category: 'hero' },
    
    // Content
    { type: 'text', name: 'Text Section', icon: Type, description: 'Rich text content', category: 'content' },
    { type: 'features', name: 'Features', icon: Grid3x3, description: 'Feature showcase grid', category: 'content' },
    { type: 'about', name: 'About Us', icon: Users, description: 'Company information', category: 'content' },
    
    // Products
    { type: 'products', name: 'Product Grid', icon: ShoppingBag, description: 'Product showcase', category: 'products' },
    { type: 'collection', name: 'Collection', icon: Package, description: 'Product collection display', category: 'products' },
    
    // Social Proof
    { type: 'testimonials', name: 'Testimonials', icon: MessageSquare, description: 'Customer reviews', category: 'social' },
    { type: 'reviews', name: 'Reviews', icon: Star, description: 'Product reviews', category: 'social' },
    
    // Forms & CTAs
    { type: 'contact', name: 'Contact Form', icon: Phone, description: 'Contact information & form', category: 'forms' },
    { type: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Email signup form', category: 'forms' },
    
    // Media
    { type: 'gallery', name: 'Image Gallery', icon: Image, description: 'Photo gallery grid', category: 'media' },
    { type: 'video', name: 'Video Section', icon: Video, description: 'Video embed section', category: 'media' },
    
    // Footer
    { type: 'footer', name: 'Footer', icon: Layout, description: 'Site footer with links', category: 'footer' }
  ];

  const sectionsToDisplay = sectionTypes.length > 0 ? sectionTypes : defaultSectionTypes;

  const filteredSections = sectionsToDisplay.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSection = (sectionType) => {
    onAddSection(sectionType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Section</h2>
            <p className="text-gray-600 mt-1">Choose a section to add to your page</p>
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
                placeholder="Search sections..."
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
              {Object.entries(sectionCategories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((section) => (
                <button
                  key={section.type}
                  onClick={() => handleAddSection(section.type)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                      <section.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                        {section.name}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                        {sectionCategories[section.category] || section.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-800">
                    {section.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} available
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

export default AddSectionModal;