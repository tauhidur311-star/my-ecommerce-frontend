/**
 * Template Gallery
 * Professional templates for quick page creation
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Download, 
  Zap,
  ShoppingBag,
  Briefcase,
  Camera,
  Heart,
  Users,
  Globe,
  Palette,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Template definitions
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  rating: number;
  downloads: number;
  isPro?: boolean;
  tags: string[];
  sections: string[];
  colors: string[];
  industry: string;
}

const templateData: Template[] = [
  // Business Templates
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'Professional corporate website with clean design',
    category: 'business',
    preview: '/templates/modern-business.jpg',
    rating: 4.8,
    downloads: 1250,
    tags: ['corporate', 'professional', 'clean'],
    sections: ['hero', 'features', 'testimonials', 'team', 'contact-form'],
    colors: ['#3B82F6', '#1E40AF', '#F8FAFC'],
    industry: 'Corporate'
  },
  {
    id: 'startup-landing',
    name: 'Startup Landing',
    description: 'High-converting landing page for tech startups',
    category: 'business',
    preview: '/templates/startup-landing.jpg',
    rating: 4.9,
    downloads: 980,
    isPro: true,
    tags: ['startup', 'tech', 'conversion'],
    sections: ['video', 'pricing', 'stats', 'faq'],
    colors: ['#8B5CF6', '#7C3AED', '#F3F4F6'],
    industry: 'Technology'
  },

  // E-commerce Templates
  {
    id: 'fashion-store',
    name: 'Fashion Store',
    description: 'Elegant e-commerce design for fashion brands',
    category: 'ecommerce',
    preview: '/templates/fashion-store.jpg',
    rating: 4.7,
    downloads: 2100,
    tags: ['fashion', 'elegant', 'shopping'],
    sections: ['hero', 'featured-product', 'gallery', 'testimonials'],
    colors: ['#F59E0B', '#D97706', '#FFFBEB'],
    industry: 'Fashion'
  },
  {
    id: 'tech-store',
    name: 'Tech Store',
    description: 'Modern electronics and gadgets showcase',
    category: 'ecommerce',
    preview: '/templates/tech-store.jpg',
    rating: 4.6,
    downloads: 1560,
    tags: ['technology', 'modern', 'gadgets'],
    sections: ['hero', 'product-grid', 'features', 'newsletter'],
    colors: ['#10B981', '#059669', '#ECFDF5'],
    industry: 'Technology'
  },

  // Portfolio Templates
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Showcase your creative work beautifully',
    category: 'portfolio',
    preview: '/templates/creative-portfolio.jpg',
    rating: 4.8,
    downloads: 890,
    tags: ['creative', 'portfolio', 'showcase'],
    sections: ['hero', 'gallery', 'timeline', 'contact-form'],
    colors: ['#EF4444', '#DC2626', '#FEF2F2'],
    industry: 'Creative'
  },
  {
    id: 'photographer-portfolio',
    name: 'Photographer Portfolio',
    description: 'Professional photography showcase',
    category: 'portfolio',
    preview: '/templates/photographer.jpg',
    rating: 4.9,
    downloads: 1200,
    isPro: true,
    tags: ['photography', 'visual', 'artistic'],
    sections: ['video', 'gallery', 'testimonials', 'contact-form'],
    colors: ['#1F2937', '#374151', '#F9FAFB'],
    industry: 'Photography'
  },

  // Landing Page Templates
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    description: 'Convert visitors into customers with this SaaS template',
    category: 'landing',
    preview: '/templates/saas-landing.jpg',
    rating: 4.8,
    downloads: 1800,
    isPro: true,
    tags: ['saas', 'conversion', 'software'],
    sections: ['hero', 'features', 'pricing', 'testimonials', 'faq'],
    colors: ['#6366F1', '#4F46E5', '#EEF2FF'],
    industry: 'Software'
  },
  {
    id: 'app-landing',
    name: 'App Landing',
    description: 'Mobile app promotion and download page',
    category: 'landing',
    preview: '/templates/app-landing.jpg',
    rating: 4.7,
    downloads: 1350,
    tags: ['mobile', 'app', 'download'],
    sections: ['hero', 'features', 'stats', 'cta-block'],
    colors: ['#EC4899', '#DB2777', '#FDF2F8'],
    industry: 'Mobile Apps'
  }
];

const categories = [
  { id: 'all', name: 'All Templates', icon: Globe },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
  { id: 'portfolio', name: 'Portfolio', icon: Camera },
  { id: 'landing', name: 'Landing Pages', icon: Zap }
];

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onTemplateSelect,
  onClose,
  isOpen = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, rating
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templateData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        template.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort templates
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      default: // popular
        filtered.sort((a, b) => b.downloads - a.downloads);
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full h-5/6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
            <p className="text-gray-600 mt-1">Choose from professionally designed templates</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter size={16} />
              Filters
            </button>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Search and Categories */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <category.icon size={16} />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  whileHover={{ y: -4 }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Preview */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Pro Badge */}
                    {template.isPro && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          PRO
                        </div>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Preview Template</p>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{template.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Download size={12} />
                          <span>{template.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{template.sections.length} sections</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        Use Template
                        <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart size={12} className="text-red-400" />
              <span>All templates are fully customizable</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemplateGallery;