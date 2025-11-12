import React, { useState } from 'react';
import { X, Image, Palette, Layout, Type, Link } from 'lucide-react';

const Inspector = ({ section, onUpdateSection, onOpenAssetPicker, onClose }) => {
  const [activeTab, setActiveTab] = useState('content');

  console.log('Inspector opened for section:', section);

  const updateSettings = (key, value) => {
    console.log('Updating setting:', key, 'to:', value);
    onUpdateSection({
      settings: {
        ...section.settings,
        [key]: value
      }
    });
  };

  // Helper function to get current setting value
  const getSetting = (key, defaultValue = '') => {
    return section.settings?.[key] ?? defaultValue;
  };

  const updatePadding = (side, value) => {
    onUpdateSection({
      settings: {
        ...section.settings,
        padding: {
          ...section.settings.padding,
          [side]: parseInt(value) || 0
        }
      }
    });
  };

  const renderContentTab = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={getSetting('title', 'Your Amazing Title')}
                onChange={(e) => {
                  console.log('Title input change:', e.target.value);
                  updateSettings('title', e.target.value);
                }}
                onBlur={(e) => console.log('Title input blur:', e.target.value)}
                onFocus={(e) => console.log('Title input focus:', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={getSetting('subtitle', 'Compelling subtitle goes here')}
                onChange={(e) => {
                  console.log('Subtitle input change:', e.target.value);
                  updateSettings('subtitle', e.target.value);
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subtitle..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={section.settings.buttonText || ''}
                onChange={(e) => updateSettings('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
              <input
                type="text"
                value={getSetting('buttonLink', '#products')}
                onChange={(e) => updateSettings('buttonLink', e.target.value)}
                placeholder="#products"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={getSetting('backgroundImage', '')}
                  onChange={(e) => updateSettings('backgroundImage', e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => onOpenAssetPicker((asset) => updateSettings('backgroundImage', asset.url))}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
              <select
                value={section.settings.textAlign || 'center'}
                onChange={(e) => updateSettings('textAlign', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'product-grid':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={section.settings.title || ''}
                onChange={(e) => updateSettings('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={section.settings.subtitle || ''}
                onChange={(e) => updateSettings('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Products to Show</label>
              <input
                type="number"
                value={section.settings.limit || 8}
                onChange={(e) => updateSettings('limit', parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
              <select
                value={section.settings.columns || 4}
                onChange={(e) => updateSettings('columns', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={6}>6 Columns</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={section.settings.sort || 'featured'}
                onChange={(e) => updateSettings('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTitle"
                checked={section.settings.showTitle !== false}
                onChange={(e) => updateSettings('showTitle', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showTitle" className="text-sm text-gray-700">Show Section Title</label>
            </div>
          </div>
        );

      case 'image-text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={section.settings.title || ''}
                onChange={(e) => updateSettings('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={section.settings.content || ''}
                onChange={(e) => updateSettings('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={section.settings.image || ''}
                  onChange={(e) => updateSettings('image', e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => onOpenAssetPicker((asset) => updateSettings('image', asset.url))}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
              <select
                value={section.settings.imagePosition || 'left'}
                onChange={(e) => updateSettings('imagePosition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={section.settings.buttonText || ''}
                onChange={(e) => updateSettings('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
              <input
                type="text"
                value={section.settings.buttonLink || ''}
                onChange={(e) => updateSettings('buttonLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'html':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom HTML</label>
              <textarea
                value={section.settings.html || ''}
                onChange={(e) => updateSettings('html', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="<div>Your HTML content here...</div>"
              />
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Title</label>
              <input
                type="text"
                value={getSetting('title', 'Image Gallery')}
                onChange={(e) => updateSettings('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter gallery title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images Per Row</label>
              <select
                value={getSetting('columns', 3)}
                onChange={(e) => updateSettings('columns', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show Lightbox</label>
              <input
                type="checkbox"
                checked={getSetting('showLightbox', true)}
                onChange={(e) => updateSettings('showLightbox', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Enable image popup on click</span>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={getSetting('title', 'Subscribe to Our Newsletter')}
                onChange={(e) => updateSettings('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter newsletter title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={getSetting('description', 'Stay updated with our latest news and offers')}
                onChange={(e) => updateSettings('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={getSetting('buttonText', 'Subscribe')}
                onChange={(e) => updateSettings('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter button text..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">No content settings available for this section type.</p>
          </div>
        );
    }
  };

  const renderStyleTab = () => {
    return (
      <div className="space-y-4">
        {/* Colors */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Background Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={section.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={section.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            {(section.type === 'hero' || section.type === 'image-text') && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={section.settings.textColor || '#000000'}
                    onChange={(e) => updateSettings('textColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={section.settings.textColor || '#000000'}
                    onChange={(e) => updateSettings('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacing */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Top Padding</label>
              <input
                type="number"
                value={section.settings.padding?.top || 60}
                onChange={(e) => updatePadding('top', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bottom Padding</label>
              <input
                type="number"
                value={section.settings.padding?.bottom || 60}
                onChange={(e) => updatePadding('bottom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: Type },
    { id: 'style', label: 'Style', icon: Palette },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'style' && renderStyleTab()}
      </div>
    </div>
  );
};

export default Inspector;