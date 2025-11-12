import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Save, Eye, Upload, Download, RotateCcw, Settings, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

import Sidebar from './Sidebar';
import Canvas from './Canvas';
import Inspector from './Inspector';
import AssetPicker from './AssetPicker';
import { themeAPI } from '../../services/themeAPI';

const ThemeEditor = () => {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerCallback, setAssetPickerCallback] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [isPublishing, setIsPublishing] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);

  // Load initial theme and template
  useEffect(() => {
    loadActiveTheme();
  }, []);

  const loadActiveTheme = async () => {
    try {
      const themes = await themeAPI.getThemes();
      const activeTheme = themes.find(theme => theme.isActive) || themes[0];
      
      if (activeTheme) {
        setCurrentTheme(activeTheme);
        await loadHomeTemplate(activeTheme._id);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      toast.error('Failed to load theme');
    }
  };

  const loadHomeTemplate = async (themeId) => {
    try {
      const templates = await themeAPI.getTemplates(themeId);
      const homeTemplate = templates.find(t => t.pageType === 'home');
      
      if (homeTemplate) {
        setCurrentTemplate(homeTemplate);
        setSections(homeTemplate.json?.sections || []);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedSection(null);
    
    if (!over || active.id === over.id) return;

    setSections(sections => {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return sections;
      
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setIsDirty(true);
      return newSections;
    });
  };

  const handleDragStart = (event) => {
    const section = sections.find(s => s.id === event.active.id);
    setDraggedSection(section);
  };

  const addSection = (sectionType) => {
    const newSection = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      settings: getDefaultSettings(sectionType)
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection);
    setIsDirty(true);
  };

  const updateSection = (sectionId, updates) => {
    setSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    );
    setIsDirty(true);
  };

  const deleteSection = (sectionId) => {
    setSections(sections => sections.filter(s => s.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
    setIsDirty(true);
  };

  const saveDraft = async () => {
    if (!currentTemplate) return;

    try {
      const updatedTemplate = await themeAPI.updateTemplate(currentTemplate._id, {
        json: { sections }
      });
      setCurrentTemplate(updatedTemplate);
      setIsDirty(false);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const publishTemplate = async () => {
    if (!currentTemplate) return;

    setIsPublishing(true);
    try {
      await saveDraft(); // Save first
      await themeAPI.publishTemplate(currentTemplate._id);
      toast.success('Template published successfully');
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error('Failed to publish template');
    } finally {
      setIsPublishing(false);
    }
  };

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

  const exportTemplate = async () => {
    if (!currentTemplate) return;

    try {
      const blob = await themeAPI.exportTemplate(currentTemplate._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template-${currentTemplate.pageType}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template exported successfully');
    } catch (error) {
      console.error('Error exporting template:', error);
      toast.error('Failed to export template');
    }
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

  if (!currentTheme || !currentTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading theme editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
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
          onSelectSection={setSelectedSection}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentTemplate.pageType.charAt(0).toUpperCase() + currentTemplate.pageType.slice(1)} Template
              </h1>
              {isDirty && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { mode: 'desktop', icon: '💻', width: 'w-5' },
                  { mode: 'tablet', icon: '📱', width: 'w-4' },
                  { mode: 'mobile', icon: '📱', width: 'w-3' }
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      previewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <button
                onClick={saveDraft}
                disabled={!isDirty}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>

              <button
                onClick={publishTemplate}
                disabled={isPublishing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>

              <button
                onClick={exportTemplate}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex">
            <div className="flex-1 p-6">
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
                    onSelectSection={setSelectedSection}
                    onUpdateSection={updateSection}
                    onDeleteSection={deleteSection}
                    onOpenAssetPicker={openAssetPicker}
                    previewMode={previewMode}
                  />
                </SortableContext>
              </div>
            </div>

            {/* Inspector Panel */}
            {selectedSection && (
              <Inspector
                section={selectedSection}
                onUpdateSection={updateSection}
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

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <AssetPicker
          onSelect={handleAssetSelect}
          onClose={() => setShowAssetPicker(false)}
        />
      )}
    </div>
  );
};

export default ThemeEditor;