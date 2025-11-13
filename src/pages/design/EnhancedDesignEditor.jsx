import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Eye, Settings, Upload, Download,
  Undo, Redo, Grid, Smartphone, Monitor, Loader2
} from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import toast from 'react-hot-toast';

import useDesignStore from '../../stores/designStore';
import EnhancedDesignSidebar from '../../components/design-editor/EnhancedDesignSidebar';
import DraggableCanvas from '../../components/design-editor/DraggableCanvas';
import SectionEditor from '../../components/design-editor/SectionEditor';
import PreviewModal from '../../components/design-editor/PreviewModal';
import EnhancedButton from '../../components/ui/EnhancedButton';

const EnhancedDesignEditor = () => {
  const {
    sections,
    selectedSection,
    previewMode,
    isDirty,
    isLoading,
    isSaving,
    globalSettings,
    addSection,
    removeSection,
    reorderSections,
    duplicateSection,
    updateSection,
    selectSection,
    setPreviewMode,
    loadDesign,
    saveDesign,
    resetDesign
  } = useDesignStore();

  const [showPreview, setShowPreview] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaCallback, setMediaCallback] = useState(null);

  // Load design on component mount
  useEffect(() => {
    loadDesign('default'); // Use default store ID or get from URL params
  }, [loadDesign]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleGoBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  const handleSave = async () => {
    const success = await saveDesign();
    if (success) {
      toast.success('Design saved successfully!');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleAddSection = (sectionType, index) => {
    addSection(sectionType, index);
  };

  const handleUpdateSection = (sectionId, updates) => {
    updateSection(sectionId, updates);
  };

  const handleDeleteSection = (sectionId) => {
    removeSection(sectionId);
    if (selectedSection?.id === sectionId) {
      selectSection(null);
    }
  };

  const handleDuplicateSection = (sectionId) => {
    duplicateSection(sectionId);
  };

  const handleReorderSections = (startIndex, endIndex) => {
    reorderSections(startIndex, endIndex);
  };

  const handleSelectSection = (section) => {
    selectSection(section);
  };

  const handleOpenMediaLibrary = (callback) => {
    setMediaCallback(() => callback);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaCallback) {
      mediaCallback(url);
      setMediaCallback(null);
    }
    setMediaLibraryOpen(false);
  };

  const handleExportDesign = () => {
    const designData = {
      layout: sections,
      globalSettings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Design exported successfully!');
  };

  const handleImportDesign = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result);
        if (importData.layout && Array.isArray(importData.layout)) {
          // Import the design
          useDesignStore.setState({
            sections: importData.layout,
            globalSettings: importData.globalSettings || globalSettings,
            isDirty: true,
            selectedSection: null
          });
          toast.success('Design imported successfully!');
        } else {
          throw new Error('Invalid design file format');
        }
      } catch (error) {
        toast.error('Failed to import design file');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading design editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-20">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </EnhancedButton>

            <div className="h-6 w-px bg-gray-300" />

            <h1 className="text-xl font-bold text-gray-900">Design Editor</h1>
            
            {isDirty && (
              <div className="flex items-center text-sm text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                Unsaved changes
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Import/Export */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDesign}
                  className="hidden"
                />
                <EnhancedButton variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                  Import
                </EnhancedButton>
              </label>
              
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={handleExportDesign}
              >
                <Download className="w-4 h-4" />
                Export
              </EnhancedButton>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Preview Button */}
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4" />
              Preview
            </EnhancedButton>

            {/* Save Button */}
            <EnhancedButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </EnhancedButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <EnhancedDesignSidebar
          onSelectMedia={handleMediaSelect}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 p-6 overflow-auto">
            <div 
              className="max-w-full mx-auto min-h-full"
              style={{
                maxWidth: globalSettings?.layout?.maxWidth || '1200px',
                backgroundColor: globalSettings?.layout?.backgroundColor || '#ffffff',
                padding: globalSettings?.layout?.padding || '20px'
              }}
            >
              <DraggableCanvas
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={handleSelectSection}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
                onDuplicateSection={handleDuplicateSection}
                onReorderSections={handleReorderSections}
                onAddSection={handleAddSection}
                previewMode={false}
              />
            </div>
          </div>

          {/* Properties Panel */}
          {selectedSection && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden"
            >
              <SectionEditor
                section={selectedSection}
                onUpdate={handleUpdateSection}
                onDelete={handleDeleteSection}
                onDuplicate={handleDuplicateSection}
                onOpenMediaLibrary={handleOpenMediaLibrary}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        sections={sections}
        globalSettings={globalSettings}
      />

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Sections: {sections.length}</span>
            {selectedSection && (
              <span>Editing: {selectedSection.type.replace('-', ' ')}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isSaving && (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!isSaving && isDirty && (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Unsaved changes</span>
              </>
            )}
            {!isSaving && !isDirty && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>All changes saved</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDesignEditor;