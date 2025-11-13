import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  Download, 
  Upload, 
  Monitor, 
  Tablet, 
  Smartphone,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  History,
  Layers
} from 'lucide-react';

interface ToolbarProps {
  isDirty?: boolean;
  isPublishing?: boolean;
  isSaving?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  lastSaveTime?: Date | null;
  versions?: Array<{
    id: string;
    label: string;
    createdAt: Date;
    createdBy?: string;
  }>;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onPreviewModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onShowVersions?: () => void;
  onShowSettings?: () => void;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isDirty = false,
  isPublishing = false,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  previewMode = 'desktop',
  lastSaveTime,
  versions = [],
  onSaveDraft,
  onPublish,
  onPreview,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onPreviewModeChange,
  onShowVersions,
  onShowSettings,
  className = ''
}) => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    setShowImportDialog(false);
    // Reset file input
    event.target.value = '';
  };

  const formatLastSaveTime = (time: Date | null) => {
    if (!time) return 'Not saved';
    
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Saved just now';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Saved ${hours}h ago`;
    
    return `Saved ${time.toLocaleDateString()}`;
  };

  const previewModeIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone
  };

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left Section - Main Actions */}
        <div className="flex items-center space-x-2">
          {/* Save Draft */}
          <button
            onClick={onSaveDraft}
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
              isDirty
                ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-300 text-gray-500 bg-gray-50'
            }`}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Publish */}
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              isPublishing
                ? 'bg-green-400 border-green-400'
                : 'bg-green-600 border-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Publish Live
              </>
            )}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Preview */}
          <button
            onClick={onPreview}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Section - Preview Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {Object.entries(previewModeIcons).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => onPreviewModeChange?.(mode as typeof previewMode)}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                previewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Right Section - Tools & Status */}
        <div className="flex items-center space-x-3">
          {/* Save Status */}
          <div className="flex items-center text-sm text-gray-500">
            {isDirty ? (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                Unsaved changes
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {formatLastSaveTime(lastSaveTime)}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Tools Dropdown */}
          <div className="flex items-center space-x-1">
            {/* Versions */}
            <button
              onClick={onShowVersions}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title={`Versions (${versions.length})`}
            >
              <History className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={onExport}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import */}
            <div className="relative">
              <button
                onClick={() => setShowImportDialog(true)}
                className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                title="Import JSON"
              >
                <Upload className="w-4 h-4" />
              </button>
              
              {showImportDialog && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Import Template
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setShowImportDialog(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={onShowSettings}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Theme Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Theme Editor</span>
          {versions.length > 0 && (
            <span>{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isPublishing && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border border-green-500 border-t-transparent mr-1" />
              <span className="text-green-600">Publishing...</span>
            </div>
          )}
          {isSaving && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent mr-1" />
              <span className="text-blue-600">Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close import dialog */}
      {showImportDialog && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
};

export default Toolbar;