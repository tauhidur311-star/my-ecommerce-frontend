import React, { useState } from 'react';
import { Plus, Layers, Archive, Search, Grid, Type, Image, Video, Code, Star } from 'lucide-react';

const SECTION_TYPES = [
  {
    category: 'Layout',
    sections: [
      { type: 'hero', label: 'Hero Section', icon: Star, description: 'Eye-catching header section' },
      { type: 'image-text', label: 'Image + Text', icon: Image, description: 'Side-by-side content' },
      { type: 'html', label: 'Custom HTML', icon: Code, description: 'Custom code block' }
    ]
  },
  {
    category: 'E-commerce',
    sections: [
      { type: 'product-grid', label: 'Product Grid', icon: Grid, description: 'Display products in grid' },
      { type: 'featured-product', label: 'Featured Product', icon: Star, description: 'Highlight single product' }
    ]
  },
  {
    category: 'Content',
    sections: [
      { type: 'testimonials', label: 'Testimonials', icon: Type, description: 'Customer reviews' },
      { type: 'newsletter', label: 'Newsletter', icon: Type, description: 'Email signup form' },
      { type: 'contact-form', label: 'Contact Form', icon: Type, description: 'Contact form' }
    ]
  },
  {
    category: 'Media',
    sections: [
      { type: 'gallery', label: 'Image Gallery', icon: Image, description: 'Photo gallery' },
      { type: 'video', label: 'Video', icon: Video, description: 'Video embed' }
    ]
  },
  {
    category: 'Navigation',
    sections: [
      { type: 'footer', label: 'Footer', icon: Layers, description: 'Site footer' }
    ]
  }
];

const Sidebar = ({ onAddSection, sections, selectedSection, onSelectSection }) => {
  const [activeTab, setActiveTab] = useState('sections');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['Layout', 'E-commerce']);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredSections = SECTION_TYPES.map(category => ({
    ...category,
    sections: category.sections.filter(section =>
      section.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.sections.length > 0);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Editor</h2>
        
        {/* Tab Navigation */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sections'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Sections
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'layers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Layers
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'sections' && (
          <div className="p-4 h-full flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Section Categories */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredSections.map((category) => (
                <div key={category.category}>
                  <button
                    onClick={() => toggleCategory(category.category)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{category.category}</h3>
                      <div className={`transform transition-transform ${
                        expandedCategories.includes(category.category) ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </div>
                    </div>
                  </button>
                  
                  {expandedCategories.includes(category.category) && (
                    <div className="mt-2 space-y-1 ml-2">
                      {category.sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.type}
                            onClick={() => onAddSection(section.type)}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100">
                                <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {section.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {section.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="p-4 h-full">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Page Sections ({sections.length})
            </h3>
            
            {sections.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No sections added yet</p>
                <p className="text-gray-400 text-xs">Add sections from the "Add Sections" tab</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    onClick={() => onSelectSection(section)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSection?.id === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500">
                            Section {index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        #{section.id.split('-').pop()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;