import React, { useState } from 'react';
import { 
  X, Palette, Type, Move, Eye, Download, Upload,
  RefreshCw, Save, Sparkles
} from 'lucide-react';

const ThemeEditorModal = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme
}) => {
  const [activeTab, setActiveTab] = useState('colors');

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Source Sans Pro', 'Oswald', 'Raleway', 'Ubuntu', 'Nunito', 'Playfair Display'
  ];

  const buttonStyles = [
    { value: 'rounded', label: 'Rounded', preview: 'rounded-md' },
    { value: 'square', label: 'Square', preview: 'rounded-none' },
    { value: 'pill', label: 'Pill', preview: 'rounded-full' }
  ];

  const spacingOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxed' }
  ];

  const shadowOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const colorSchemes = [
    { name: 'Classic', bg: '#ffffff', text: '#000000', accent: '#3b82f6' },
    { name: 'Dark', bg: '#000000', text: '#ffffff', accent: '#10b981' },
    { name: 'Warm', bg: '#fef7ed', text: '#9a3412', accent: '#ea580c' },
    { name: 'Cool', bg: '#f0f9ff', text: '#0c4a6e', accent: '#0ea5e9' },
    { name: 'Nature', bg: '#f0fdf4', text: '#14532d', accent: '#16a34a' },
    { name: 'Luxury', bg: '#faf7f5', text: '#292524', accent: '#a855f7' }
  ];

  const handleUpdateTheme = (updates) => {
    onUpdateTheme({ ...theme, ...updates });
  };

  const handleApplyColorScheme = (scheme) => {
    handleUpdateTheme({
      primaryColor: scheme.bg,
      secondaryColor: scheme.text,
      accentColor: scheme.accent
    });
  };

  const handleExportTheme = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'theme-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportTheme = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          onUpdateTheme(importedTheme);
        } catch (error) {
          alert('Invalid theme file format');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Theme Editor</h2>
              <p className="text-gray-600">Customize your store's appearance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTheme}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Export Theme"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer" title="Import Theme">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'layout', label: 'Layout', icon: Move },
            { id: 'effects', label: 'Effects', icon: Sparkles }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Color Schemes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Color Schemes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => handleApplyColorScheme(scheme)}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all"
                    >
                      <div className="flex gap-1 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: scheme.bg }}
                        ></div>
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: scheme.text }}
                        ></div>
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: scheme.accent }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{scheme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.primaryColor || '#000000'}
                      onChange={(e) => handleUpdateTheme({ primaryColor: e.target.value })}
                      className="w-12 h-10 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor || '#000000'}
                      onChange={(e) => handleUpdateTheme({ primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor || '#ffffff'}
                      onChange={(e) => handleUpdateTheme({ secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor || '#ffffff'}
                      onChange={(e) => handleUpdateTheme({ secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.accentColor || '#3b82f6'}
                      onChange={(e) => handleUpdateTheme({ accentColor: e.target.value })}
                      className="w-12 h-10 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.accentColor || '#3b82f6'}
                      onChange={(e) => handleUpdateTheme({ accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Body Font</label>
                  <select
                    value={theme.fontFamily || 'Inter'}
                    onChange={(e) => handleUpdateTheme({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Heading Font</label>
                  <select
                    value={theme.headingFont || 'Inter'}
                    onChange={(e) => handleUpdateTheme({ headingFont: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Preview */}
              <div className="p-6 border rounded-xl bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Typography Preview</h3>
                <div 
                  style={{ 
                    fontFamily: theme.headingFont || 'Inter',
                    color: theme.primaryColor || '#000000'
                  }}
                >
                  <h1 className="text-3xl font-bold mb-2">Heading 1</h1>
                  <h2 className="text-2xl font-semibold mb-2">Heading 2</h2>
                  <h3 className="text-xl font-medium mb-4">Heading 3</h3>
                </div>
                <div 
                  style={{ 
                    fontFamily: theme.fontFamily || 'Inter',
                    color: theme.secondaryColor || '#000000'
                  }}
                >
                  <p className="mb-2">This is body text using your selected font family. It shows how regular paragraphs will appear on your website.</p>
                  <p className="text-sm text-gray-600">This is smaller text that might be used for captions or secondary information.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Button Style</label>
                  <div className="space-y-2">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => handleUpdateTheme({ buttonStyle: style.value })}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          theme.buttonStyle === style.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{style.label}</span>
                          <div 
                            className={`px-4 py-2 bg-blue-600 text-white text-sm ${style.preview}`}
                          >
                            Button
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Spacing</label>
                  <div className="space-y-2">
                    {spacingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateTheme({ spacing: option.value })}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          theme.spacing === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={theme.borderRadius || 8}
                    onChange={(e) => handleUpdateTheme({ borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0px</span>
                    <span>{theme.borderRadius || 8}px</span>
                    <span>24px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Button Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={theme.buttonRadius || 4}
                    onChange={(e) => handleUpdateTheme({ buttonRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0px</span>
                    <span>{theme.buttonRadius || 4}px</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Card Shadow</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {shadowOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleUpdateTheme({ cardShadow: option.value })}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        theme.cardShadow === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className={`w-full h-20 bg-white rounded-lg mb-3 ${
                          option.value === 'small' ? 'shadow-sm' :
                          option.value === 'medium' ? 'shadow-md' :
                          option.value === 'large' ? 'shadow-lg' : ''
                        }`}
                      ></div>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={theme.animations !== false}
                    onChange={(e) => handleUpdateTheme({ animations: e.target.checked })}
                    className="rounded"
                  />
                  <span className="font-medium">Enable Animations</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Add smooth transitions and hover effects throughout the site
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Changes will be applied to your entire site
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditorModal;