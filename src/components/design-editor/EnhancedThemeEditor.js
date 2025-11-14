import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Plus, Save, Eye, Upload, Download, RotateCcw, Settings, Layers,
  Undo2, Redo2, Copy, Keyboard, Smartphone, Tablet, Monitor,
  RefreshCw, History, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import Sidebar from './Sidebar';
import Canvas from './Canvas';
import Inspector from './Inspector';
import EnhancedAssetPicker from './EnhancedAssetPicker';
import ShortcutsPanel from './ShortcutsPanel';
import MultiSelectManager from './MultiSelectManager';
import useUndoRedo from '../../hooks/useUndoRedo.js';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts.js';
import { themeAPI } from '../../services/themeAPI';

const EnhancedThemeEditor = () => {
  // Core state
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  
  // UI state
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [assetPickerCallback, setAssetPickerCallback] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error', 'dirty'

  // Undo/Redo functionality
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    reset: resetHistory
  } = useUndoRedo([], 50);

  // Load initial data
  useEffect(() => {
    loadActiveTheme();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || saveStatus === 'saving' || !currentTemplate) return;

    const autoSaveTimer = setTimeout(() => {
      if (saveStatus === 'dirty') {
        saveDraft(true); // Auto-save
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [sections, autoSaveEnabled, saveStatus]);

  // Keyboard shortcuts
  const shortcuts = [
    // General
    { key: 's', ctrl: true, shift: false, action: () => saveDraft() },
    { key: 's', ctrl: true, shift: true, action: () => publishTemplate() },
    { key: 'z', ctrl: true, shift: false, action: () => handleUndo() },
    { key: 'y', ctrl: true, shift: false, action: () => handleRedo() },
    { key: 'z', ctrl: true, shift: true, action: () => handleRedo() },
    { key: 'escape', ctrl: false, shift: false, action: () => handleEscape() },
    { key: '/', ctrl: false, shift: true, action: () => setShowShortcuts(true) },
    
    // Selection
    { key: 'a', ctrl: true, shift: false, action: () => selectAllSections() },
    { key: 'delete', ctrl: false, shift: false, action: () => deleteSelectedSections() },
    { key: 'c', ctrl: true, shift: false, action: () => copySections() },
    { key: 'v', ctrl: true, shift: false, action: () => pasteSections() },
    { key: 'd', ctrl: true, shift: false, action: () => duplicateSection() },
    
    // Quick add sections
    { key: 'h', ctrl: false, shift: false, action: () => addSection('hero') },
    { key: 'p', ctrl: false, shift: false, action: () => addSection('product-grid') },
    { key: 'i', ctrl: false, shift: false, action: () => addSection('image-text') },
    { key: 't', ctrl: false, shift: false, action: () => addSection('testimonials') },
    { key: 'f', ctrl: false, shift: false, action: () => addSection('footer') },
    { key: 'c', ctrl: false, shift: false, action: () => addSection('html') },
    
    // Preview modes
    { key: 'd', ctrl: false, shift: false, action: () => setPreviewMode('desktop') },
    { key: 'm', ctrl: false, shift: false, action: () => setPreviewMode('mobile') },
    { key: 'tab', ctrl: false, shift: false, action: () => cyclePreviewMode() }
  ];

  useKeyboardShortcuts(shortcuts);

  const loadActiveTheme = async () => {
    try {
      console.log('Loading themes...');
      const themes = await themeAPI.getThemes();
      
      let activeTheme = themes.find(theme => theme.isActive) || themes[0];
      
      if (!activeTheme) {
        activeTheme = await themeAPI.createTheme({
          name: 'Default Theme',
          description: 'Auto-generated default theme'
        });
      }
      
      if (activeTheme) {
        setCurrentTheme(activeTheme);
        await loadHomeTemplate(activeTheme._id);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      toast.error('Failed to load theme');
      createFallbackTheme();
    }
  };

  const loadHomeTemplate = async (themeId) => {
    try {
      const templates = await themeAPI.getTemplates(themeId);
      let homeTemplate = templates.find(t => t.pageType === 'home');
      
      if (!homeTemplate) {
        homeTemplate = {
          _id: 'temp-home',
          pageType: 'home',
          json: { sections: [] },
          status: 'draft'
        };
      }
      
      setCurrentTemplate(homeTemplate);
      const initialSections = homeTemplate.json?.sections || [];
      setSections(initialSections);
      resetHistory(initialSections);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
      createFallbackTemplate();
    }
  };

  const createFallbackTheme = () => {
    const fallbackTheme = {
      _id: 'fallback-theme',
      name: 'Local Theme',
      isActive: true
    };
    setCurrentTheme(fallbackTheme);
    createFallbackTemplate();
  };

  const createFallbackTemplate = () => {
    const fallbackTemplate = {
      _id: 'fallback-home',
      pageType: 'home',
      json: { sections: [] },
      status: 'draft'
    };
    setCurrentTemplate(fallbackTemplate);
    setSections([]);
    resetHistory([]);
  };

  // Enhanced section management
  const updateSections = useCallback((newSections, addToUndo = true) => {
    setSections(newSections);
    if (addToUndo) {
      addToHistory(newSections);
    }
    setSaveStatus('dirty');
  }, [addToHistory]);

  const addSection = (sectionType) => {
    const newSection = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      settings: getDefaultSettings(sectionType)
    };

    const newSections = [...sections, newSection];
    updateSections(newSections);
    setSelectedSection(newSection);
    setSelectedSections([]);
    toast.success(`Added ${sectionType.replace('-', ' ')} section`);
  };

  const updateSection = (sectionId, updates) => {
    const newSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    );
    
    updateSections(newSections);
    
    if (selectedSection?.id === sectionId) {
      setSelectedSection({ ...selectedSection, ...updates });
    }
  };

  const deleteSection = (sectionId) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    updateSections(newSections);
    
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
    
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const deleteSelectedSections = () => {
    if (selectedSections.length === 0 && selectedSection) {
      deleteSection(selectedSection.id);
      return;
    }
    
    if (selectedSections.length === 0) return;
    
    if (window.confirm(`Delete ${selectedSections.length} selected sections?`)) {
      const sectionIds = selectedSections.map(s => s.id);
      const newSections = sections.filter(s => !sectionIds.includes(s.id));
      updateSections(newSections);
      setSelectedSections([]);
      setSelectedSection(null);
      toast.success(`Deleted ${sectionIds.length} sections`);
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setSections(previousState);
      setSelectedSection(null);
      setSelectedSections([]);
      setSaveStatus('dirty');
      toast.success('Undone');
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setSections(nextState);
      setSelectedSection(null);
      setSelectedSections([]);
      setSaveStatus('dirty');
      toast.success('Redone');
    }
  };

  // Copy/Paste functionality
  const copySections = () => {
    const toCopy = selectedSections.length > 0 ? selectedSections : 
                   selectedSection ? [selectedSection] : [];
    
    if (toCopy.length === 0) return;
    
    setClipboard(toCopy.map(section => ({
      ...section,
      id: `${section.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })));
    
    toast.success(`Copied ${toCopy.length} section(s)`);
  };

  const pasteSections = () => {
    if (clipboard.length === 0) return;
    
    const pastedSections = clipboard.map(section => ({
      ...section,
      id: `${section.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    const newSections = [...sections, ...pastedSections];
    updateSections(newSections);
    setSelectedSections(pastedSections);
    toast.success(`Pasted ${pastedSections.length} section(s)`);
  };

  const duplicateSection = () => {
    if (!selectedSection) return;
    
    const duplicated = {
      ...selectedSection,
      id: `${selectedSection.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const currentIndex = sections.findIndex(s => s.id === selectedSection.id);
    const newSections = [
      ...sections.slice(0, currentIndex + 1),
      duplicated,
      ...sections.slice(currentIndex + 1)
    ];
    
    updateSections(newSections);
    setSelectedSection(duplicated);
    toast.success('Section duplicated');
  };

  // Multi-selection
  const selectAllSections = () => {
    setSelectedSections(sections);
    setSelectedSection(null);
    toast.success(`Selected all ${sections.length} sections`);
  };

  const handleSectionSelect = (section, multiSelect = false) => {
    if (multiSelect) {
      setSelectedSections(prev => {
        const isSelected = prev.find(s => s.id === section.id);
        if (isSelected) {
          return prev.filter(s => s.id !== section.id);
        } else {
          return [...prev, section];
        }
      });
      setSelectedSection(null);
    } else {
      setSelectedSection(section);
      setSelectedSections([]);
    }
  };

  const handleEscape = () => {
    setSelectedSection(null);
    setSelectedSections([]);
    setShowAssetPicker(false);
    setShowShortcuts(false);
  };

  const cyclePreviewMode = () => {
    const modes = ['desktop', 'tablet', 'mobile'];
    const currentIndex = modes.indexOf(previewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPreviewMode(modes[nextIndex]);
  };

  // Enhanced save functionality
  const saveDraft = async (isAutoSave = false) => {
    if (!currentTemplate || saveStatus === 'saving') return;

    try {
      setSaveStatus('saving');
      if (!isAutoSave) {
        toast.loading('Saving draft...', { id: 'save' });
      }

      const updatedTemplate = await themeAPI.updateTemplate(currentTemplate._id, {
        json: { sections }
      });
      
      setCurrentTemplate(updatedTemplate);
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        toast.success('Draft saved successfully', { id: 'save' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      if (!isAutoSave) {
        toast.error('Failed to save draft', { id: 'save' });
      }
    }
  };

  const publishTemplate = async () => {
    if (!currentTemplate || isPublishing) return;

    setIsPublishing(true);
    try {
      await saveDraft();
      await themeAPI.publishTemplate(currentTemplate._id);
      toast.success('Template published successfully');
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error('Failed to publish template');
    } finally {
      setIsPublishing(false);
    }
  };

  // Drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedSection(null);
    
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(section => section.id === active.id);
    const newIndex = sections.findIndex(section => section.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newSections = arrayMove(sections, oldIndex, newIndex);
    updateSections(newSections);
  };

  const handleDragStart = (event) => {
    const section = sections.find(s => s.id === event.active.id);
    setDraggedSection(section);
  };

  // Asset picker
  const openAssetPicker = (callback) => {
    setAssetPickerCallback(() => callback);
    setShowAssetPicker(true);
  };

  const handleAssetSelect = (asset) => {
    if (assetPickerCallback) {
      assetPickerCallback(asset);
    }
    setShowAssetPicker(false);
    setAssetPickerCallback(null);
  };

  const getDefaultSettings = (sectionType) => {
    const defaults = {
      hero: {
        title: 'Your Amazing Title',
        subtitle: 'Compelling subtitle goes here',
        buttonText: 'Get Started',
        buttonLink: '#',
        backgroundImage: '',
        textColor: '#ffffff',
        backgroundColor: '#1f2937',
        padding: { top: 80, bottom: 80 },
        textAlign: 'center'
      },
      'product-grid': {
        title: 'Featured Products',
        subtitle: 'Check out our latest collection',
        limit: 8,
        columns: 4,
        sort: 'featured',
        showTitle: true,
        showFilters: false,
        padding: { top: 60, bottom: 60 }
      },
      'image-text': {
        title: 'About Our Story',
        content: 'Tell your story here with compelling content that engages your audience.',
        image: '',
        imagePosition: 'left',
        buttonText: 'Learn More',
        buttonLink: '#',
        backgroundColor: '#ffffff',
        padding: { top: 60, bottom: 60 }
      },
      testimonials: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            name: 'John Doe',
            content: 'Amazing product and excellent service!',
            rating: 5,
            image: ''
          }
        ],
        backgroundColor: '#f9fafb',
        padding: { top: 60, bottom: 60 }
      },
      footer: {
        companyName: 'Your Company',
        description: 'Short description of your company',
        links: [
          { text: 'About', url: '/about' },
          { text: 'Contact', url: '/contact' }
        ],
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: ''
        },
        backgroundColor: '#1f2937',
        textColor: '#ffffff'
      },
      html: {
        html: '<div class="prose max-w-none"><p>Custom HTML content goes here</p></div>',
        padding: { top: 40, bottom: 40 }
      }
    };

    return defaults[sectionType] || {};
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'dirty': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'error': return 'Save failed';
      case 'dirty': return autoSaveEnabled ? 'Auto-saving...' : 'Unsaved changes';
      default: return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved';
    }
  };

  if (!currentTheme || !currentTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced theme editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden" style={{paddingTop: '60px'}}>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Sidebar */}
        <Sidebar 
          onAddSection={addSection}
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={(section) => handleSectionSelect(section, false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentTemplate.pageType.charAt(0).toUpperCase() + currentTemplate.pageType.slice(1)} Template
              </h1>
              
              {/* Save Status */}
              <span className={`text-sm ${getSaveStatusColor()}`}>
                {getSaveStatusText()}
              </span>
              
              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                  title="Desktop (D)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-md ${previewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                  title="Mobile (M)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Help */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Keyboard Shortcuts (?)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Save Draft */}
              <button
                onClick={() => saveDraft(false)}
                disabled={saveStatus === 'saving'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                title="Save (Ctrl+S)"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>

              {/* Publish */}
              <button
                onClick={publishTemplate}
                disabled={isPublishing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                title="Publish (Ctrl+Shift+S)"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-6 overflow-y-auto">
              <div 
                className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
                style={{ width: getPreviewWidth(), maxWidth: '100%' }}
              >
                <SortableContext 
                  items={sections.map(s => s.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <Canvas
                    sections={sections}
                    selectedSection={selectedSection}
                    selectedSections={selectedSections}
                    onSelectSection={(section, event) => {
                      const multiSelect = event?.ctrlKey || event?.metaKey;
                      handleSectionSelect(section, multiSelect);
                    }}
                    onUpdateSection={updateSection}
                    onDeleteSection={deleteSection}
                    onOpenAssetPicker={openAssetPicker}
                    previewMode={previewMode}
                  />
                </SortableContext>
              </div>
            </div>

            {/* Inspector Panel */}
            {selectedSection && selectedSections.length === 0 && (
              <Inspector
                section={selectedSection}
                onUpdateSection={(updates) => updateSection(selectedSection.id, updates)}
                onOpenAssetPicker={openAssetPicker}
                onClose={() => setSelectedSection(null)}
              />
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedSection && (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 opacity-80">
              <div className="text-sm font-medium text-gray-900">{draggedSection.type}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Multi-Select Manager */}
      <MultiSelectManager
        selectedSections={selectedSections}
        onDeleteSelected={deleteSelectedSections}
        onCopySelected={copySections}
        onToggleVisibility={(sections, hide) => {
          sections.forEach(section => {
            updateSection(section.id, {
              settings: { ...section.settings, hidden: hide }
            });
          });
        }}
        onClearSelection={() => setSelectedSections([])}
      />

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <EnhancedAssetPicker
          onSelect={handleAssetSelect}
          onClose={() => setShowAssetPicker(false)}
        />
      )}

      {/* Shortcuts Panel */}
      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default EnhancedThemeEditor;