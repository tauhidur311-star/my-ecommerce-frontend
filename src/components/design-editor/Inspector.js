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
    // Emergency safety wrapper to prevent charAt errors
    try {
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
                  value={section.settings.backgroundImage || ''}
                  onChange={(e) => updateSettings('backgroundImage', e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => onOpenAssetPicker((asset) => {
                    const imageUrl = asset?.url || asset;
                    updateSettings('backgroundImage', typeof imageUrl === 'string' ? imageUrl : '');
                  })}
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
                  onClick={() => onOpenAssetPicker((asset) => {
                    const imageUrl = asset?.url || asset;
                    updateSettings('image', typeof imageUrl === 'string' ? imageUrl : '');
                  })}
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
                value={section.settings.buttonText || 'Subscribe'}
                onChange={(e) => updateSettings('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter button text..."
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Company Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={section.settings.companyName || 'Your Company'}
                  onChange={(e) => updateSettings('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={section.settings.description || 'Short description of your company'}
                  onChange={(e) => updateSettings('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company description"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Quick Links</h4>
              {(section.settings.links || [{ text: 'About', url: '/about' }, { text: 'Contact', url: '/contact' }]).map((link, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.text || ''}
                    onChange={(e) => {
                      const newLinks = [...(section.settings.links || [])];
                      newLinks[index] = { ...link, text: e.target.value };
                      updateSettings('links', newLinks);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Link text"
                  />
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...(section.settings.links || [])];
                      newLinks[index] = { ...link, url: e.target.value };
                      updateSettings('links', newLinks);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newLinks = [...(section.settings.links || []), { text: 'New Link', url: '#' }];
                  updateSettings('links', newLinks);
                }}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                + Add Link
              </button>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Social Media</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={section.settings.socialLinks?.facebook || ''}
                  onChange={(e) => updateSettings('socialLinks', { 
                    ...section.settings.socialLinks, 
                    facebook: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                <input
                  type="url"
                  value={section.settings.socialLinks?.twitter || ''}
                  onChange={(e) => updateSettings('socialLinks', { 
                    ...section.settings.socialLinks, 
                    twitter: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={section.settings.socialLinks?.instagram || ''}
                  onChange={(e) => updateSettings('socialLinks', { 
                    ...section.settings.socialLinks, 
                    instagram: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Colors</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={section.settings.backgroundColor || '#1f2937'}
                  onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <input
                  type="color"
                  value={section.settings.textColor || '#ffffff'}
                  onChange={(e) => updateSettings('textColor', e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300"
                />
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            {/* Content */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Content</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={section.settings.title || 'Image Gallery'}
                  onChange={(e) => updateSettings('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={section.settings.subtitle || 'Browse our collection'}
                  onChange={(e) => updateSettings('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Images</h4>
              {(section.settings.images || []).map((image, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={image.url || ''}
                        onChange={(e) => {
                          const newImages = [...(section.settings.images || [])];
                          newImages[index] = { ...image, url: e.target.value };
                          updateSettings('images', newImages);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Image URL"
                      />
                      <button
                        onClick={() => onOpenAssetPicker && onOpenAssetPicker((assetUrl) => {
                          const newImages = [...(section.settings.images || [])];
                          newImages[index] = { ...image, url: assetUrl };
                          updateSettings('images', newImages);
                        })}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={image.alt || ''}
                    onChange={(e) => {
                      const newImages = [...(section.settings.images || [])];
                      newImages[index] = { ...image, alt: e.target.value };
                      updateSettings('images', newImages);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Alt text"
                  />
                  <button
                    onClick={() => {
                      const newImages = (section.settings.images || []).filter((_, i) => i !== index);
                      updateSettings('images', newImages);
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newImages = [...(section.settings.images || []), { 
                    url: `https://picsum.photos/400/300?random=${Date.now()}`, 
                    alt: 'Gallery Image' 
                  }];
                  updateSettings('images', newImages);
                }}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                + Add Image
              </button>
            </div>

            {/* Layout Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Layout</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images Per Row</label>
                <select
                  value={section.settings.columns || 3}
                  onChange={(e) => updateSettings('columns', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 columns</option>
                  <option value={3}>3 columns</option>
                  <option value={4}>4 columns</option>
                  <option value={5}>5 columns</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
                <select
                  value={section.settings.spacing || 4}
                  onChange={(e) => updateSettings('spacing', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>Small</option>
                  <option value={4}>Medium</option>
                  <option value={6}>Large</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lightbox"
                  checked={section.settings.lightbox || false}
                  onChange={(e) => updateSettings('lightbox', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="lightbox" className="text-sm font-medium text-gray-700">
                  Enable Lightbox
                </label>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6">
            {/* Content */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Content</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={section.settings.title || 'Video Section'}
                  onChange={(e) => updateSettings('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={section.settings.subtitle || 'Watch our featured video'}
                  onChange={(e) => updateSettings('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Video Source */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Video Source</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
                <select
                  value={section.settings.videoType || 'mp4'}
                  onChange={(e) => updateSettings('videoType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {section.settings.videoType === 'youtube' ? 'YouTube URL' : 
                   section.settings.videoType === 'vimeo' ? 'Vimeo URL' : 'Video URL'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={section.settings.videoUrl || ''}
                    onChange={(e) => updateSettings('videoUrl', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      section.settings.videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                      section.settings.videoType === 'vimeo' ? 'https://vimeo.com/...' :
                      'https://example.com/video.mp4'
                    }
                  />
                  {section.settings.videoType === 'mp4' && onOpenAssetPicker && (
                    <button
                      onClick={() => onOpenAssetPicker((assetUrl) => {
                        updateSettings('videoUrl', assetUrl);
                      })}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Browse
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Playback Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Playback Options</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <select
                  value={section.settings.aspectRatio || '16:9'}
                  onChange={(e) => updateSettings('aspectRatio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="21:9">21:9 (Ultrawide)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={section.settings.autoplay || false}
                    onChange={(e) => updateSettings('autoplay', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoplay" className="text-sm font-medium text-gray-700">
                    Autoplay
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="loop"
                    checked={section.settings.loop || false}
                    onChange={(e) => updateSettings('loop', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="loop" className="text-sm font-medium text-gray-700">
                    Loop
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="controls"
                    checked={section.settings.controls !== false}
                    onChange={(e) => updateSettings('controls', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="controls" className="text-sm font-medium text-gray-700">
                    Show Controls
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="muted"
                    checked={section.settings.muted !== false}
                    onChange={(e) => updateSettings('muted', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="muted" className="text-sm font-medium text-gray-700">
                    Muted by Default
                  </label>
                </div>
              </div>
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
    } catch (error) {
      console.error('Inspector content rendering error:', error);
      return (
        <div className="text-center text-red-500 py-8 px-4">
          <p className="mb-4">⚠️ Error loading section settings</p>
          <p className="text-sm mb-4">Section: {section?.type || 'unknown'}</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close Inspector
          </button>
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