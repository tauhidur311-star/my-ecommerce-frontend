/**
 * Advanced Settings Panel
 * Comprehensive settings with visual style builder, animations, responsive controls, and more
 */

import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Spacing, 
  Smartphone, 
  Tablet, 
  Monitor,
  Search,
  Copy,
  Clipboard,
  RotateCcw,
  Code,
  Eye,
  Settings,
  Zap,
  Flask as TestTube,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionBase, ResponsiveSettings, AnimationSettings } from '../../../types/pageBuilder.ts';

interface AdvancedSettingsPanelProps {
  section: SectionBase;
  onUpdate: (updates: Partial<SectionBase>) => void;
  onCopyStyles?: () => void;
  onPasteStyles?: () => void;
  canPasteStyles?: boolean;
}

type SettingsTab = 'style' | 'responsive' | 'animation' | 'seo' | 'advanced' | 'testing';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  section,
  onUpdate,
  onCopyStyles,
  onPasteStyles,
  canPasteStyles = false,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('style');
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const [customCSS, setCustomCSS] = useState(section.settings.customCSS || '');

  const tabs = [
    { id: 'style', label: 'Visual Style', icon: Palette },
    { id: 'responsive', label: 'Responsive', icon: Smartphone },
    { id: 'animation', label: 'Animation', icon: Zap },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'advanced', label: 'Advanced', icon: Code },
    { id: 'testing', label: 'A/B Testing', icon: TestTube },
  ] as const;

  const devices = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
  ] as const;

  const updateSettings = (updates: any) => {
    onUpdate({
      settings: {
        ...section.settings,
        ...updates,
      },
    });
  };

  const updateResponsiveSettings = <T,>(key: keyof SectionBase['settings'], value: T) => {
    const current = section.settings[key] as ResponsiveSettings<T> || {};
    updateSettings({
      [key]: {
        ...current,
        [activeDevice]: value,
      },
    });
  };

  const getResponsiveValue = <T,>(key: keyof SectionBase['settings']): T => {
    const responsive = section.settings[key] as ResponsiveSettings<T>;
    return responsive?.[activeDevice] as T;
  };

  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (color: string) => void
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );

  const renderSpacingControls = (
    label: string,
    value: { top: number; bottom: number; left: number; right: number } = 
      { top: 0, bottom: 0, left: 0, right: 0 },
    onChange: (spacing: { top: number; bottom: number; left: number; right: number }) => void
  ) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Top</label>
          <input
            type="number"
            min="0"
            max="200"
            value={value.top}
            onChange={(e) => onChange({ ...value, top: Number(e.target.value) })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Bottom</label>
          <input
            type="number"
            min="0"
            max="200"
            value={value.bottom}
            onChange={(e) => onChange({ ...value, bottom: Number(e.target.value) })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Left</label>
          <input
            type="number"
            min="0"
            max="200"
            value={value.left}
            onChange={(e) => onChange({ ...value, left: Number(e.target.value) })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Right</label>
          <input
            type="number"
            min="0"
            max="200"
            value={value.right}
            onChange={(e) => onChange({ ...value, right: Number(e.target.value) })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Colors
        </h4>
        <div className="space-y-4">
          {renderColorPicker(
            'Background Color',
            section.settings.backgroundColor || '',
            (color) => updateSettings({ backgroundColor: color })
          )}
          {renderColorPicker(
            'Text Color',
            section.settings.textColor || '',
            (color) => updateSettings({ textColor: color })
          )}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Type className="w-4 h-4 mr-2" />
          Typography
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="Inter">Inter</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Times">Times New Roman</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <input
              type="range"
              min="12"
              max="72"
              defaultValue="16"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Style Actions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Style Actions</h4>
        <div className="flex space-x-2">
          <button
            onClick={onCopyStyles}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </button>
          <button
            onClick={onPasteStyles}
            disabled={!canPasteStyles}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            <Clipboard className="w-4 h-4 mr-1" />
            Paste
          </button>
          <button className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-6">
      {/* Device Selector */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {devices.map((device) => {
          const DeviceIcon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${
                activeDevice === device.id
                  ? 'bg-blue-50 text-blue-600 border-r border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 border-r border-gray-200 last:border-r-0'
              }`}
            >
              <DeviceIcon className="w-4 h-4 mr-1" />
              {device.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Spacing className="w-4 h-4 mr-2" />
            Spacing for {devices.find(d => d.id === activeDevice)?.label}
          </h4>
          
          {renderSpacingControls(
            'Padding',
            getResponsiveValue('padding'),
            (spacing) => updateResponsiveSettings('padding', spacing)
          )}
          
          {renderSpacingControls(
            'Margin',
            getResponsiveValue('margin'),
            (spacing) => updateResponsiveSettings('margin', spacing)
          )}
        </div>

        {/* Visibility Controls */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Visibility
          </h4>
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{device.label}</span>
                <input
                  type="checkbox"
                  checked={section.settings.visibility?.[device.id] !== false}
                  onChange={(e) => {
                    updateSettings({
                      visibility: {
                        ...section.settings.visibility,
                        [device.id]: e.target.checked,
                      },
                    });
                  }}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnimationTab = () => {
    const animation = section.settings.animation || {
      type: 'none',
      duration: 500,
      delay: 0,
      easing: 'ease',
      trigger: 'scroll',
    };

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Animation Settings
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Type
              </label>
              <select
                value={animation.type}
                onChange={(e) => {
                  updateSettings({
                    animation: {
                      ...animation,
                      type: e.target.value as AnimationSettings['type'],
                    },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="scale">Scale</option>
                <option value="bounce">Bounce</option>
                <option value="flip">Flip</option>
              </select>
            </div>

            {animation.type !== 'none' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration ({animation.duration}ms)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="100"
                    value={animation.duration}
                    onChange={(e) => {
                      updateSettings({
                        animation: {
                          ...animation,
                          duration: Number(e.target.value),
                        },
                      });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay ({animation.delay}ms)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={animation.delay}
                    onChange={(e) => {
                      updateSettings({
                        animation: {
                          ...animation,
                          delay: Number(e.target.value),
                        },
                      });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Easing
                  </label>
                  <select
                    value={animation.easing}
                    onChange={(e) => {
                      updateSettings({
                        animation: {
                          ...animation,
                          easing: e.target.value as AnimationSettings['easing'],
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger
                  </label>
                  <select
                    value={animation.trigger}
                    onChange={(e) => {
                      updateSettings({
                        animation: {
                          ...animation,
                          trigger: e.target.value as AnimationSettings['trigger'],
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="scroll">On Scroll</option>
                    <option value="hover">On Hover</option>
                    <option value="click">On Click</option>
                    <option value="load">On Load</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSEOTab = () => {
    const seo = section.settings.seo || {};

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            SEO Settings
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={seo.title || ''}
                onChange={(e) => {
                  updateSettings({
                    seo: { ...seo, title: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter meta title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seo.description || ''}
                onChange={(e) => {
                  updateSettings({
                    seo: { ...seo, description: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter meta description..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {(seo.description || '').length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={seo.keywords?.join(', ') || ''}
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                  updateSettings({
                    seo: { ...seo, keywords },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter keywords separated by commas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                value={seo.ogImage || ''}
                onChange={(e) => {
                  updateSettings({
                    seo: { ...seo, ogImage: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          Custom CSS
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS Code
            </label>
            <textarea
              rows={8}
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              onBlur={() => updateSettings({ customCSS })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="/* Add your custom CSS here */
.my-section {
  /* Custom styles */
}"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                previewMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Disable Preview' : 'Enable Preview'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Options
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Lazy Loading
              </label>
              <p className="text-xs text-gray-500">
                Improve performance by loading content when visible
              </p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Critical CSS
              </label>
              <p className="text-xs text-gray-500">
                Include this section in critical CSS
              </p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <TestTube className="w-4 h-4 mr-2" />
          A/B Testing
        </h4>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TestTube className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                A/B Test Available
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Create variants of this section to test different designs and content.
            </p>
            <button className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-sm rounded-md transition-colors">
              Create Variant
            </button>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Current Variants</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Original</span>
                  <div className="text-xs text-gray-500">50% traffic</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {section.name} Settings
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Layers className="w-4 h-4 mr-1" />
          {section.type} section
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-4">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TabIcon className="w-3 h-3 mr-1" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'style' && renderStyleTab()}
            {activeTab === 'responsive' && renderResponsiveTab()}
            {activeTab === 'animation' && renderAnimationTab()}
            {activeTab === 'seo' && renderSEOTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
            {activeTab === 'testing' && renderTestingTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedSettingsPanel;