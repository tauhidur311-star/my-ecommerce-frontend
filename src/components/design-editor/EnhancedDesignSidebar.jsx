import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Layers, Plus, Palette, Type, Image, Settings,
  Star, Quote, Mail, Grid, User, Phone, MapPin, Upload,
  Download, Paintbrush, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Link, RotateCcw
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import useDesignStore, { AVAILABLE_SECTIONS } from '../../stores/designStore';
import EnhancedButton from '../ui/EnhancedButton';

// Draggable Section Item for the sidebar
const DraggableSection = ({ section, isActive }) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${section.id}`,
    data: {
      type: 'new-section',
      sectionType: section.id
    }
  });

  const iconMap = {
    layout: Layout,
    star: Star,
    image: Image,
    quote: Quote,
    mail: Mail,
    grid: Grid
  };

  const Icon = iconMap[section.icon] || Plus;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:border-blue-300 hover:shadow-md'
      } ${isActive ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
      onMouseEnter={() => setIsDraggedOver(true)}
      onMouseLeave={() => setIsDraggedOver(false)}
    >
      <div className="text-center">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <h4 className="font-medium text-gray-900 text-sm mb-1">{section.name}</h4>
        <p className="text-xs text-gray-500">{section.description}</p>
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">Dragging...</span>
        </div>
      )}
    </motion.div>
  );
};

// Component Library Panel
const ComponentsPanel = () => {
  const components = [
    { id: 'button', name: 'Button', icon: 'square', description: 'Call-to-action button' },
    { id: 'card', name: 'Card', icon: 'square', description: 'Content card container' },
    { id: 'icon', name: 'Icon', icon: 'star', description: 'Icon element' },
    { id: 'divider', name: 'Divider', icon: 'minus', description: 'Section divider' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Components</h3>
      <div className="grid grid-cols-2 gap-3">
        {components.map((component) => (
          <div key={component.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded mb-2 flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">{component.name}</h4>
            <p className="text-xs text-gray-500">{component.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Global Layout Settings Panel
const LayoutPanel = () => {
  const { globalSettings, updateGlobalSettings } = useDesignStore();

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Layout Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
          <select
            value={globalSettings.layout.maxWidth}
            onChange={(e) => updateGlobalSettings({
              layout: { ...globalSettings.layout, maxWidth: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="1200px">1200px</option>
            <option value="1400px">1400px</option>
            <option value="100%">Full Width</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Global Padding</label>
          <select
            value={globalSettings.layout.padding}
            onChange={(e) => updateGlobalSettings({
              layout: { ...globalSettings.layout, padding: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="10px">Small (10px)</option>
            <option value="20px">Medium (20px)</option>
            <option value="30px">Large (30px)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={globalSettings.layout.backgroundColor}
              onChange={(e) => updateGlobalSettings({
                layout: { ...globalSettings.layout, backgroundColor: e.target.value }
              })}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={globalSettings.layout.backgroundColor}
              onChange={(e) => updateGlobalSettings({
                layout: { ...globalSettings.layout, backgroundColor: e.target.value }
              })}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Typography Settings Panel
const TypographyPanel = () => {
  const { globalSettings, updateGlobalSettings } = useDesignStore();

  const fontFamilies = [
    'Inter, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace'
  ];

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Typography</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select
            value={globalSettings.typography.fontFamily}
            onChange={(e) => updateGlobalSettings({
              typography: { ...globalSettings.typography, fontFamily: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font.split(',')[0]}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
          <select
            value={globalSettings.typography.fontSize.base}
            onChange={(e) => updateGlobalSettings({
              typography: { 
                ...globalSettings.typography, 
                fontSize: { ...globalSettings.typography.fontSize, base: e.target.value }
              }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
          <select
            value={globalSettings.typography.lineHeight}
            onChange={(e) => updateGlobalSettings({
              typography: { ...globalSettings.typography, lineHeight: parseFloat(e.target.value) }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="1.4">1.4</option>
            <option value="1.6">1.6</option>
            <option value="1.8">1.8</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Styling Panel
const StylingPanel = () => {
  const { globalSettings, updateGlobalSettings } = useDesignStore();

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Global Styling</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={globalSettings.colors.primary}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, primary: e.target.value }
              })}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={globalSettings.colors.primary}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, primary: e.target.value }
              })}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={globalSettings.colors.secondary}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, secondary: e.target.value }
              })}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={globalSettings.colors.secondary}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, secondary: e.target.value }
              })}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={globalSettings.colors.text}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, text: e.target.value }
              })}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={globalSettings.colors.text}
              onChange={(e) => updateGlobalSettings({
                colors: { ...globalSettings.colors, text: e.target.value }
              })}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Media Library Panel
const MediaPanel = ({ onSelectMedia }) => {
  const [uploadedImages, setUploadedImages] = useState([
    '/api/placeholder/300/200',
    '/api/placeholder/400/300',
    '/api/placeholder/500/300'
  ]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // In a real app, upload to your media service
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...newUrls, ...prev]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Media Library</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <EnhancedButton variant="outline" size="sm">
            <Upload size={16} />
            Upload
          </EnhancedButton>
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {uploadedImages.map((url, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={() => onSelectMedia?.(url)}
          >
            <img
              src={url}
              alt={`Media ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedDesignSidebar = ({ onSelectMedia }) => {
  const { sidebarMode, setSidebarMode } = useDesignStore();

  const sidebarItems = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'components', label: 'Components', icon: Plus },
    { id: 'styling', label: 'Styling', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'media', label: 'Media', icon: Image },
  ];

  const renderPanelContent = () => {
    switch (sidebarMode) {
      case 'layout':
        return <LayoutPanel />;
      
      case 'sections':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Available Sections</h3>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_SECTIONS.map((section) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        );
      
      case 'components':
        return <ComponentsPanel />;
      
      case 'styling':
        return <StylingPanel />;
      
      case 'typography':
        return <TypographyPanel />;
      
      case 'media':
        return <MediaPanel onSelectMedia={onSelectMedia} />;
      
      default:
        return <div className="text-center text-gray-500">Select a panel</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Sidebar Navigation */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = sidebarMode === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setSidebarMode(item.id)}
                className={`p-3 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarMode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPanelContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedDesignSidebar;