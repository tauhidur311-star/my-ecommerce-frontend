import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Plus, 
  Search, 
  Grid, 
  Image, 
  MessageSquare, 
  Mail, 
  Phone, 
  Star, 
  Play, 
  Layers,
  Package,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getSectionTypeDisplayName } from './SectionRenderer';

interface SectionType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'layout' | 'content' | 'ecommerce' | 'media' | 'forms';
  tags: string[];
}

interface DraggableSectionItemProps {
  sectionType: SectionType;
  onAdd: (type: string) => void;
}

const DraggableSectionItem: React.FC<DraggableSectionItemProps> = ({ sectionType, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `section-${sectionType.id}`,
    data: {
      type: 'section',
      sectionType: sectionType.id
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const Icon = sectionType.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group p-3 border border-gray-200 rounded-lg cursor-grab hover:cursor-grabbing bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
      onClick={() => onAdd(sectionType.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {sectionType.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {sectionType.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {sectionType.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EnhancedSidebarProps {
  sections: Array<{
    id: string;
    type: string;
    settings?: Record<string, any>;
    visible?: boolean;
  }>;
  selectedSectionId: string | null;
  reusableBlocks?: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    thumbnail?: string;
  }>;
  onSectionAdd: (type: string) => void;
  onSectionSelect: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onReusableBlockAdd?: (blockId: string) => void;
  onCreateReusableBlock?: (sectionId: string) => void;
  className?: string;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  sections,
  selectedSectionId,
  reusableBlocks = [],
  onSectionAdd,
  onSectionSelect,
  onSectionDelete,
  onReusableBlockAdd,
  onCreateReusableBlock,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sections' | 'layers' | 'blocks'>('sections');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['layout', 'content'])
  );

  const sectionTypes: SectionType[] = [
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Eye-catching banner with title, subtitle, and call-to-action',
      icon: Grid,
      category: 'layout',
      tags: ['banner', 'cta', 'landing']
    },
    {
      id: 'product-grid',
      name: 'Product Grid',
      description: 'Display products in a responsive grid layout',
      icon: Package,
      category: 'ecommerce',
      tags: ['products', 'grid', 'shop']
    },
    {
      id: 'featured-product',
      name: 'Featured Product',
      description: 'Showcase a single product with detailed information',
      icon: Star,
      category: 'ecommerce',
      tags: ['featured', 'product', 'highlight']
    },
    {
      id: 'image-text',
      name: 'Image & Text',
      description: 'Combine images with text content side by side',
      icon: Image,
      category: 'content',
      tags: ['image', 'text', 'about']
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Customer reviews and testimonials',
      icon: MessageSquare,
      category: 'content',
      tags: ['reviews', 'social proof', 'customers']
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Email subscription form with benefits',
      icon: Mail,
      category: 'forms',
      tags: ['email', 'subscribe', 'marketing']
    },
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Contact form with optional map and info',
      icon: Phone,
      category: 'forms',
      tags: ['contact', 'form', 'support']
    },
    {
      id: 'image-gallery',
      name: 'Image Gallery',
      description: 'Photo gallery with lightbox functionality',
      icon: Grid,
      category: 'media',
      tags: ['gallery', 'photos', 'lightbox']
    },
    {
      id: 'video',
      name: 'Video Block',
      description: 'Video player with custom controls',
      icon: Play,
      category: 'media',
      tags: ['video', 'media', 'player']
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Site footer with links and information',
      icon: Layers,
      category: 'layout',
      tags: ['footer', 'links', 'info']
    }
  ];

  const categories = {
    layout: { name: 'Layout', icon: Grid },
    content: { name: 'Content', icon: MessageSquare },
    ecommerce: { name: 'E-commerce', icon: Package },
    media: { name: 'Media', icon: Play },
    forms: { name: 'Forms', icon: Mail }
  };

  const filteredSectionTypes = sectionTypes.filter(section => {
    const matchesSearch = searchQuery === '' || 
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || section.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedSectionTypes = filteredSectionTypes.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionType[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderSectionsList = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedCategory === null
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(categories).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Sections by Category */}
      <div className="space-y-4">
        {Object.entries(groupedSectionTypes).map(([categoryKey, categoryTypes]) => {
          const category = categories[categoryKey as keyof typeof categories];
          const isExpanded = expandedCategories.has(categoryKey);
          
          return (
            <div key={categoryKey}>
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <category.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({categoryTypes.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {categoryTypes.map(sectionType => (
                    <DraggableSectionItem
                      key={sectionType.id}
                      sectionType={sectionType}
                      onAdd={onSectionAdd}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSectionTypes.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No sections found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderLayersList = () => (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Page Sections ({sections.length})
      </div>
      
      {sections.length === 0 ? (
        <div className="text-center py-8">
          <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No sections added</p>
          <p className="text-xs text-gray-400 mt-1">Start by adding sections to your page</p>
        </div>
      ) : (
        sections.map((section, index) => (
          <div
            key={section.id}
            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedSectionId === section.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onSectionSelect(section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-500 font-mono">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getSectionTypeDisplayName(section.type as any)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {section.id.split('-')[0]}...
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!section.visible && (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" title="Hidden" />
                )}
                {onCreateReusableBlock && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateReusableBlock(section.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Save as reusable block"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderReusableBlocks = () => (
    <div className="space-y-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Reusable Blocks ({reusableBlocks.length})
      </div>
      
      {reusableBlocks.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No reusable blocks</p>
          <p className="text-xs text-gray-400 mt-1">Save sections as reusable blocks for quick access</p>
        </div>
      ) : (
        reusableBlocks.map(block => (
          <div
            key={block.id}
            className="p-3 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onReusableBlockAdd?.(block.id)}
          >
            <div className="flex items-start space-x-3">
              {block.thumbnail ? (
                <img
                  src={block.thumbnail}
                  alt={block.name}
                  className="w-12 h-8 object-cover rounded bg-gray-100"
                />
              ) : (
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {block.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {getSectionTypeDisplayName(block.type as any)}
                </p>
                {block.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {block.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Design Tools</h2>
        
        {/* Tabs */}
        <div className="mt-3 flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'sections', label: 'Sections', count: sectionTypes.length },
            { id: 'layers', label: 'Layers', count: sections.length },
            { id: 'blocks', label: 'Blocks', count: reusableBlocks.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'sections' && renderSectionsList()}
        {activeTab === 'layers' && renderLayersList()}
        {activeTab === 'blocks' && renderReusableBlocks()}
      </div>
    </div>
  );
};

export default EnhancedSidebar;