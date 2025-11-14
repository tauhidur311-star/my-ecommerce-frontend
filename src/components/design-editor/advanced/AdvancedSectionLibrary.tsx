/**
 * Advanced Section Library
 * Enhanced section picker with categories, search, and previews
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Grid3x3, 
  Type, 
  Image as ImageIcon, 
  Video, 
  Users, 
  Star,
  BarChart3,
  MessageSquare,
  Mail,
  Calendar,
  Award,
  Zap,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define section types and categories
export interface SectionType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  isPro?: boolean;
  tags: string[];
  preview?: string;
}

export interface SectionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  sections: SectionType[];
}

// Section definitions
const sectionTypes: SectionType[] = [
  // Basic sections
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with call-to-action',
    category: 'basic',
    icon: Type,
    tags: ['header', 'banner', 'cta']
  },
  {
    id: 'features',
    name: 'Features Grid',
    description: 'Showcase product features in a grid layout',
    category: 'basic',
    icon: Grid3x3,
    tags: ['features', 'grid', 'benefits']
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Beautiful image showcase with lightbox',
    category: 'basic',
    icon: ImageIcon,
    tags: ['images', 'portfolio', 'showcase']
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews and testimonials',
    category: 'basic',
    icon: MessageSquare,
    tags: ['reviews', 'social proof', 'customers']
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Contact form with validation',
    category: 'basic',
    icon: Mail,
    tags: ['contact', 'form', 'lead generation']
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Email subscription form',
    category: 'basic',
    icon: Mail,
    tags: ['newsletter', 'email', 'subscription']
  },

  // Advanced sections
  {
    id: 'video',
    name: 'Video Hero',
    description: 'Full-width video background with overlay',
    category: 'advanced',
    icon: Video,
    isPro: true,
    tags: ['video', 'hero', 'background']
  },
  {
    id: 'pricing',
    name: 'Pricing Tables',
    description: 'Professional pricing plans layout',
    category: 'advanced',
    icon: BarChart3,
    isPro: true,
    tags: ['pricing', 'plans', 'subscription']
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Expandable FAQ with search',
    category: 'advanced',
    icon: MessageSquare,
    tags: ['faq', 'help', 'support']
  },
  {
    id: 'team',
    name: 'Team Members',
    description: 'Team showcase with bios',
    category: 'advanced',
    icon: Users,
    tags: ['team', 'about', 'people']
  },
  {
    id: 'stats',
    name: 'Statistics Counter',
    description: 'Animated counters and achievements',
    category: 'advanced',
    icon: Award,
    tags: ['stats', 'numbers', 'achievements']
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Process or history timeline',
    category: 'advanced',
    icon: Calendar,
    isPro: true,
    tags: ['timeline', 'process', 'history']
  },
  {
    id: 'logo-grid',
    name: 'Logo Grid',
    description: 'Partner or client logos display',
    category: 'advanced',
    icon: Grid3x3,
    tags: ['logos', 'partners', 'clients']
  },
  {
    id: 'cta-block',
    name: 'CTA Block',
    description: 'Compelling call-to-action section',
    category: 'advanced',
    icon: Zap,
    tags: ['cta', 'conversion', 'action']
  },

  // E-commerce sections
  {
    id: 'product-grid',
    name: 'Product Grid',
    description: 'Product showcase with filters',
    category: 'ecommerce',
    icon: ShoppingBag,
    tags: ['products', 'shop', 'catalog']
  },
  {
    id: 'featured-product',
    name: 'Featured Product',
    description: 'Highlight a specific product',
    category: 'ecommerce',
    icon: Star,
    tags: ['featured', 'product', 'spotlight']
  }
];

// Group sections by category
const sectionCategories: SectionCategory[] = [
  {
    id: 'basic',
    name: 'Basic Sections',
    icon: Grid3x3,
    sections: sectionTypes.filter(s => s.category === 'basic')
  },
  {
    id: 'advanced',
    name: 'Advanced Sections',
    icon: Zap,
    sections: sectionTypes.filter(s => s.category === 'advanced')
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingBag,
    sections: sectionTypes.filter(s => s.category === 'ecommerce')
  }
];

interface AdvancedSectionLibraryProps {
  onSectionSelect: (sectionType: string) => void;
  onClose?: () => void;
  selectedCategory?: string;
}

const AdvancedSectionLibrary: React.FC<AdvancedSectionLibraryProps> = ({
  onSectionSelect,
  onClose,
  selectedCategory = 'basic'
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sections based on search and category
  const filteredSections = useMemo(() => {
    const category = sectionCategories.find(cat => cat.id === activeCategory);
    if (!category) return [];

    if (!searchQuery) return category.sections;

    return category.sections.filter(section => 
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeCategory, searchQuery]);

  const handleSectionClick = (sectionId: string) => {
    onSectionSelect(sectionId);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Section Library</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1">
          {sectionCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <category.icon size={16} />
              <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-3"
          >
            {filteredSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Grid3x3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No sections found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredSections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className="group relative p-4 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Pro Badge */}
                  {section.isPro && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        PRO
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <section.icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{section.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {section.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.button>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Heart size={12} className="text-red-400" />
            <span>Drag & drop to add</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSectionLibrary;