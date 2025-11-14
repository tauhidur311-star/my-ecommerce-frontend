import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Eye, Grid, List } from 'lucide-react';
import cookieManager from '../../utils/cookieManager';
import { useTheme } from '../../hooks/useTheme';
import EnhancedButton from '../ui/EnhancedButton';
import GlassCard from '../ui/glass/GlassCard';
import AdminThemeToggle from './AdminThemeToggle';

const AdminPreferences = () => {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState({
    layout: 'grid',
    sidebarCollapsed: false,
    showNotifications: true,
    autoSave: true,
    compactMode: false,
    showPreviewMode: true,
    defaultTab: 'overview',
    itemsPerPage: 20
  });

  // Load preferences from cookies
  useEffect(() => {
    setPreferences({
      layout: cookieManager.getAdminLayout(),
      sidebarCollapsed: cookieManager.isAdminSidebarCollapsed(),
      showNotifications: cookieManager.getCookie('adminShowNotifications') === 'true',
      autoSave: cookieManager.getCookie('adminAutoSave') !== 'false', // Default true
      compactMode: cookieManager.getCookie('adminCompactMode') === 'true',
      showPreviewMode: cookieManager.getCookie('adminShowPreview') !== 'false', // Default true
      defaultTab: cookieManager.getCookie('adminDefaultTab') || 'overview',
      itemsPerPage: parseInt(cookieManager.getCookie('adminItemsPerPage') || '20')
    });
  }, []);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Save to cookies immediately
    switch (key) {
      case 'layout':
        cookieManager.setAdminLayout(value);
        break;
      case 'sidebarCollapsed':
        cookieManager.setAdminSidebarCollapsed(value);
        break;
      case 'showNotifications':
        cookieManager.setCookie('adminShowNotifications', value.toString(), { maxAge: 31536000 });
        break;
      case 'autoSave':
        cookieManager.setCookie('adminAutoSave', value.toString(), { maxAge: 31536000 });
        break;
      case 'compactMode':
        cookieManager.setCookie('adminCompactMode', value.toString(), { maxAge: 31536000 });
        break;
      case 'showPreviewMode':
        cookieManager.setCookie('adminShowPreview', value.toString(), { maxAge: 31536000 });
        break;
      case 'defaultTab':
        cookieManager.setCookie('adminDefaultTab', value, { maxAge: 31536000 });
        break;
      case 'itemsPerPage':
        cookieManager.setCookie('adminItemsPerPage', value.toString(), { maxAge: 31536000 });
        break;
    }
  };

  const resetPreferences = () => {
    const defaultPrefs = {
      layout: 'grid',
      sidebarCollapsed: false,
      showNotifications: true,
      autoSave: true,
      compactMode: false,
      showPreviewMode: true,
      defaultTab: 'overview',
      itemsPerPage: 20
    };
    
    setPreferences(defaultPrefs);
    
    // Clear cookies
    Object.keys(defaultPrefs).forEach(key => {
      switch (key) {
        case 'layout':
          cookieManager.setAdminLayout(defaultPrefs.layout);
          break;
        case 'sidebarCollapsed':
          cookieManager.setAdminSidebarCollapsed(defaultPrefs.sidebarCollapsed);
          break;
        default:
          cookieManager.deleteCookie(`admin${key.charAt(0).toUpperCase() + key.slice(1)}`);
          break;
      }
    });
  };

  const PreferenceSection = ({ title, children }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const TogglePreference = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  const SelectPreference = ({ label, description, value, options, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Preferences</h2>
          <p className="text-gray-600">Customize your admin dashboard experience</p>
        </div>
        
        <div className="flex gap-3">
          <EnhancedButton variant="outline" onClick={resetPreferences}>
            <RotateCcw size={16} />
            Reset to Defaults
          </EnhancedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Appearance">
          <PreferenceSection title="Theme">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-3">Color Theme</p>
              <AdminThemeToggle />
            </div>
          </PreferenceSection>

          <PreferenceSection title="Layout">
            <SelectPreference
              label="Default Layout"
              description="Choose your preferred dashboard layout"
              value={preferences.layout}
              options={[
                { value: 'grid', label: 'Grid View' },
                { value: 'list', label: 'List View' },
                { value: 'compact', label: 'Compact View' }
              ]}
              onChange={(value) => updatePreference('layout', value)}
            />

            <TogglePreference
              label="Compact Mode"
              description="Reduce spacing and use smaller elements"
              value={preferences.compactMode}
              onChange={(value) => updatePreference('compactMode', value)}
            />

            <TogglePreference
              label="Collapse Sidebar"
              description="Start with sidebar collapsed"
              value={preferences.sidebarCollapsed}
              onChange={(value) => updatePreference('sidebarCollapsed', value)}
            />
          </PreferenceSection>
        </GlassCard>

        <GlassCard title="Functionality">
          <PreferenceSection title="Notifications">
            <TogglePreference
              label="Show Notifications"
              description="Display system notifications and alerts"
              value={preferences.showNotifications}
              onChange={(value) => updatePreference('showNotifications', value)}
            />
          </PreferenceSection>

          <PreferenceSection title="Editor">
            <TogglePreference
              label="Auto-save"
              description="Automatically save changes as you type"
              value={preferences.autoSave}
              onChange={(value) => updatePreference('autoSave', value)}
            />

            <TogglePreference
              label="Show Preview Mode"
              description="Enable preview functionality in editors"
              value={preferences.showPreviewMode}
              onChange={(value) => updatePreference('showPreviewMode', value)}
            />
          </PreferenceSection>

          <PreferenceSection title="Navigation">
            <SelectPreference
              label="Default Tab"
              description="Which tab to show when opening admin"
              value={preferences.defaultTab}
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'analytics', label: 'Analytics' },
                { value: 'orders', label: 'Orders' },
                { value: 'products', label: 'Products' },
                { value: 'inventory', label: 'Inventory' },
                { value: 'content', label: 'Content' }
              ]}
              onChange={(value) => updatePreference('defaultTab', value)}
            />

            <SelectPreference
              label="Items Per Page"
              description="Number of items to show in lists"
              value={preferences.itemsPerPage}
              options={[
                { value: '10', label: '10 items' },
                { value: '20', label: '20 items' },
                { value: '50', label: '50 items' },
                { value: '100', label: '100 items' }
              ]}
              onChange={(value) => updatePreference('itemsPerPage', parseInt(value))}
            />
          </PreferenceSection>
        </GlassCard>
      </div>

      <GlassCard title="Current Settings Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Theme:</span>
            <span className="ml-2 capitalize">{theme}</span>
          </div>
          <div>
            <span className="font-medium">Layout:</span>
            <span className="ml-2 capitalize">{preferences.layout}</span>
          </div>
          <div>
            <span className="font-medium">Auto-save:</span>
            <span className="ml-2">{preferences.autoSave ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div>
            <span className="font-medium">Items/Page:</span>
            <span className="ml-2">{preferences.itemsPerPage}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminPreferences;