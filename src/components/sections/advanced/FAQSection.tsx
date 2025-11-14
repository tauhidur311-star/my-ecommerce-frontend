/**
 * Advanced FAQ Section Component
 * Supports accordion, grid, and tabs layout with search functionality
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQSectionContent } from '../../../types/pageBuilder';

interface FAQSectionProps {
  content: FAQSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<FAQSectionContent>) => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = content.faqs;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory && activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }

    return filtered;
  }, [content.faqs, searchTerm, activeCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(content.faqs.map(faq => faq.category).filter(Boolean));
    return Array.from(cats);
  }, [content.faqs]);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveCategory('');
  };

  const renderSearchAndFilters = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 space-y-4"
    >
      {/* Search Bar */}
      {content.searchable && (
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* Category Filters */}
      {categories.length > 0 && content.categories && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Search Results Info */}
      {(searchTerm || activeCategory) && (
        <div className="text-center text-sm text-gray-600">
          {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
          {activeCategory && ` in ${activeCategory}`}
        </div>
      )}
    </motion.div>
  );

  const renderAccordionLayout = () => (
    <div className="max-w-3xl mx-auto space-y-4">
      <AnimatePresence>
        {filteredFAQs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {faq.question}
                </h3>
                {faq.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {faq.category}
                  </span>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                {openItems.has(faq.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
            
            <AnimatePresence>
              {openItems.has(faq.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFAQs.map((faq, index) => (
        <motion.div
          key={faq.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
        >
          {faq.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
              <Tag className="w-3 h-3 mr-1" />
              {faq.category}
            </span>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {faq.question}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {faq.answer}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTabsLayout = () => (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              !activeCategory
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Questions
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeCategory === category
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {filteredFAQs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {faq.question}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                {faq.answer}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (isEditing && content.faqs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {content.title || 'FAQ Section'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add FAQ items to display content
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div>Layout: {content.layout}</div>
            <div>Searchable: {content.searchable ? 'Yes' : 'No'}</div>
            <div>Categories: {categories.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
      </motion.div>

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* FAQ Content */}
      {filteredFAQs.length > 0 ? (
        <>
          {content.layout === 'accordion' && renderAccordionLayout()}
          {content.layout === 'grid' && renderGridLayout()}
          {content.layout === 'tabs' && renderTabsLayout()}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No FAQs found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or category filter
          </p>
          <button
            onClick={clearSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FAQSection;