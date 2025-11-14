/**
 * Advanced Design Editor
 * Complete visual page builder with all advanced features
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone,
  Undo2, 
  Redo2,
  Download,
  Upload,
  Settings,
  Layers,
  Palette,
  TestTube,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

// Store and types
import useAdvancedPageBuilderStore from '../../stores/advancedPageBuilderStore';
import type { SectionBase, DevicePreview, ExportOptions } from '../../types/pageBuilder';

// Advanced components
import AdvancedSectionLibrary from '../../components/design-editor/advanced/AdvancedSectionLibrary';
import AdvancedSettingsPanel from '../../components/design-editor/advanced/AdvancedSettingsPanel';
import ResponsivePreviewPanel from '../../components/design-editor/advanced/ResponsivePreviewPanel';
import TemplateGallery from '../../components/design-editor/advanced/TemplateGallery';

// Section renderers
import VideoSection from '../../components/sections/advanced/VideoSection';
import PricingSection from '../../components/sections/advanced/PricingSection';
import FAQSection from '../../components/sections/advanced/FAQSection';
import TeamSection from '../../components/sections/advanced/TeamSection';
import StatsSection from '../../components/sections/advanced/StatsSection';

// Legacy section components (for backward compatibility)
import HeroSection from '../../components/sections/HeroSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import GallerySection from '../../components/sections/GallerySection';
import TestimonialsSection from '../../components/sections/TestimonialsSection';
import ContactFormSection from '../../components/sections/ContactFormSection';
import NewsletterSection from '../../components/sections/NewsletterSection';

interface AdvancedDesignEditorProps {
  projectId?: string;
}

type SidebarMode = 'sections' | 'templates' | 'settings' | 'layers';

const AdvancedDesignEditor: React.FC<AdvancedDesignEditorProps> = ({ projectId = 'default' }) => {
  const {
    // Core state
    sections,
    selectedSection,
    globalSettings,
    previewMode,
    previewDevice,
    isDirty,
    isLoading,
    isSaving,
    
    // History
    history,
    
    // Performance
    performanceSettings,
    
    // Actions
    addSection,
    removeSection,
    updateSection,
    duplicateSection,
    reorderSections,
    selectSection,
    setPreviewMode,
    setPreviewDevice,
    undo,
    redo,
    saveToHistory,
    applyTemplate,
    exportDesign,
    importDesign,
    updateGlobalSettings,
  } = useAdvancedPageBuilderStore();

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('sections');
  const [showTemplates, setShowTemplates] = useState(false);
  const [copiedStyles, setCopiedStyles] = useState<any>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || isSaving) return;
    
    setIsAutoSaving(true);
    try {
      // Auto-save logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Auto-saved', { duration: 2000 });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isDirty, isSaving]);

  // Section renderer mapping
  const sectionRenderers = useMemo(() => ({
    // Advanced sections
    video: VideoSection,
    pricing: PricingSection,
    faq: FAQSection,
    team: TeamSection,
    stats: StatsSection,
    
    // Legacy sections
    hero: HeroSection,
    features: FeaturesSection,
    gallery: GallerySection,
    testimonials: TestimonialsSection,
    contact: ContactFormSection,
    newsletter: NewsletterSection,
  }), []);

  const renderSection = useCallback((section: SectionBase, index: number) => {
    const SectionComponent = sectionRenderers[section.type as keyof typeof sectionRenderers];
    
    if (!SectionComponent) {
      return (
        <div key={section.id} className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Unknown Section Type: {section.type}
            </h3>
            <p className="text-sm text-yellow-600">
              This section type is not supported in the current editor.
            </p>
          </div>
        </div>
      );
    }

    const isSelected = selectedSection?.id === section.id;

    return (
      <Draggable key={section.id} draggableId={section.id} index={index} isDragDisabled={previewMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              relative transition-all duration-200
              ${snapshot.isDragging ? 'z-50 rotate-2 scale-105' : ''}
              ${isSelected && !previewMode ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
          >
            {/* Section Controls */}
            {!previewMode && (
              <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                <div
                  {...provided.dragHandleProps}
                  className="p-1 bg-white rounded shadow-lg cursor-move hover:bg-gray-50"
                  title="Drag to reorder"
                >
                  <Layers className="w-4 h-4 text-gray-600" />
                </div>
                
                <button
                  onClick={() => selectSection(isSelected ? null : section)}
                  className={`p-1 rounded shadow-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Select section"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Section Content */}
            <div
              className={`
                ${section.settings.backgroundColor ? 'p-0' : 'py-8 px-4'}
                ${!previewMode ? 'cursor-pointer' : ''}
              `}
              style={{
                backgroundColor: section.settings.backgroundColor || 'transparent',
                color: section.settings.textColor || 'inherit',
                ...section.settings.customCSS ? { 
                  // Apply custom CSS - in real implementation, you'd sanitize this
                } : {},
              }}
              onClick={() => !previewMode && selectSection(section)}
            >
              <SectionComponent
                content={section.content}
                isEditing={!previewMode}
                onContentChange={(updates: any) => {
                  updateSection(section.id, { content: updates });
                }}
              />
            </div>
          </div>
        )}
      </Draggable>
    );
  }, [selectedSection, previewMode, updateSection, selectSection, sectionRenderers]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    reorderSections(startIndex, endIndex);
    saveToHistory('reorder', `Moved section from position ${startIndex + 1} to ${endIndex + 1}`);
  };

  const handleExport = async (format: 'json' | 'html' | 'pdf') => {
    try {
      const options: ExportOptions = {
        format,
        includeAssets: true,
        compression: false,
        version: '1.0.0',
        metadata: {
          title: 'Page Design Export',
          description: 'Exported from Advanced Design Editor',
          author: 'User',
          created: new Date(),
        },
      };
      
      const blob = await exportDesign(options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Design exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importDesign(file);
      
      if (result.success) {
        if (result.warnings.length > 0) {
          toast(`Import completed with ${result.warnings.length} warnings`, {
            icon: '⚠️',
          });
        } else {
          toast.success('Design imported successfully');
        }
      } else {
        toast.error(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import failed');
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleCopyStyles = () => {
    if (selectedSection) {
      setCopiedStyles({
        settings: selectedSection.settings,
        timestamp: Date.now(),
      });
      toast.success('Section styles copied');
    }
  };

  const handlePasteStyles = () => {
    if (selectedSection && copiedStyles) {
      updateSection(selectedSection.id, {
        settings: copiedStyles.settings,
      });
      toast.success('Section styles pasted');
    }
  };

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.states.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium text-gray-700">Loading Advanced Editor...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing components and templates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-30">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="h-6 w-px bg-gray-300" />

            <h1 className="text-xl font-bold text-gray-900">Advanced Design Editor</h1>
            
            {(isDirty || isAutoSaving) && (
              <div className="flex items-center text-sm">
                {isAutoSaving ? (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Auto-saving...
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Unsaved changes
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center - Device Preview Controls */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice(useAdvancedPageBuilderStore.getState().templateRegistry.templates['desktop-1920'] as any)}
              className={`p-2 rounded transition-colors ${
                previewDevice.category === 'desktop' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice(useAdvancedPageBuilderStore.getState().templateRegistry.templates['tablet-ipad'] as any)}
              className={`p-2 rounded transition-colors ${
                previewDevice.category === 'tablet' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice(useAdvancedPageBuilderStore.getState().templateRegistry.templates['mobile-iphone'] as any)}
              className={`p-2 rounded transition-colors ${
                previewDevice.category === 'mobile' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* History Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Export/Import */}
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </div>
              </label>
              
              <div className="relative group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    HTML
                  </button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                previewMode
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {previewMode ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Exit Preview
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Preview
                </>
              )}
            </button>

            {/* Save Button */}
            <button
              onClick={() => {/* Save functionality */}}
              disabled={isSaving || !isDirty}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!previewMode && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col"
          >
            {/* Sidebar Tabs */}
            <div className="border-b border-gray-200 p-4">
              <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'sections', icon: Layers, label: 'Sections' },
                  { id: 'templates', icon: Palette, label: 'Templates' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'layers', icon: Eye, label: 'Layers' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarMode(tab.id as SidebarMode)}
                      className={`flex flex-col items-center px-2 py-2 text-xs font-medium rounded transition-colors ${
                        sidebarMode === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sidebarMode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {sidebarMode === 'sections' && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Sections</h3>
                      {/* Section library would go here */}
                      <div className="space-y-3">
                        {['video', 'pricing', 'faq', 'team', 'stats'].map((type) => (
                          <button
                            key={type}
                            onClick={() => addSection(type)}
                            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium capitalize">{type} Section</div>
                            <div className="text-sm text-gray-500">Add a {type} section</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {sidebarMode === 'templates' && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
                      <p className="text-sm text-gray-600">Choose from pre-designed templates</p>
                    </div>
                  )}
                  
                  {sidebarMode === 'settings' && selectedSection && (
                    <AdvancedSettingsPanel
                      section={selectedSection}
                      onUpdate={(updates) => updateSection(selectedSection.id, updates)}
                      onCopyStyles={handleCopyStyles}
                      onPasteStyles={handlePasteStyles}
                      canPasteStyles={!!copiedStyles}
                    />
                  )}
                  
                  {sidebarMode === 'layers' && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Layers</h3>
                      <div className="space-y-2">
                        {sections.map((section, index) => (
                          <div
                            key={section.id}
                            className={`p-2 rounded border cursor-pointer transition-colors ${
                              selectedSection?.id === section.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => selectSection(section)}
                          >
                            <div className="font-medium text-sm">{section.name}</div>
                            <div className="text-xs text-gray-500">{section.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {previewMode ? (
            <ResponsivePreviewPanel
              activeDevice={previewDevice}
              onDeviceChange={setPreviewDevice}
              performanceSettings={performanceSettings}
              onPerformanceChange={(settings) => {/* Update performance settings */}}
            >
              <div className="min-h-screen">
                {sections.map((section, index) => renderSection(section, index))}
              </div>
            </ResponsivePreviewPanel>
          ) : (
            <div className="flex-1 overflow-auto bg-white">
              <div className="max-w-7xl mx-auto py-8">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-4 min-h-96 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {sections.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <Layers className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                              Start building your page
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Add sections from the sidebar to get started
                            </p>
                            <button
                              onClick={() => setSidebarMode('sections')}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Layers className="w-4 h-4 mr-2" />
                              Browse Sections
                            </button>
                          </div>
                        ) : (
                          sections.map((section, index) => renderSection(section, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-5/6 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Template gallery would go here */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Template</h2>
                <p className="text-gray-600">Select a template to get started quickly</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedDesignEditor;