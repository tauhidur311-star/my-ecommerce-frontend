/**
 * Enhanced Theme Editor
 * Revamped with advanced page builder features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Eye, Settings, ChevronDown, X, Menu, 
  Home, ShoppingBag, LayoutGrid, Users, BarChart3, 
  Package, Tag, MessageSquare, Palette, Image as ImageIcon,
  Type, Layout, Columns, Square, ChevronLeft, ChevronRight,
  Save, Undo, Redo, Monitor, Smartphone, Tablet, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline, Link2,
  Video, Grid3x3, Maximize2, Copy, Trash2, ArrowUp, ArrowDown,
  Code, Zap, MoreVertical, Star, Heart, Crown, Target, Users2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import our advanced components (temporarily disabled for build)
// import useAdvancedPageBuilderStore from '../../stores/advancedPageBuilderStore';
// import { useAnimationPreset } from '../../hooks/useAnimationPresets';
// import { useCollaboration } from '../../hooks/useCollaboration';
// import AdvancedSettingsPanel from '../../components/design-editor/advanced/AdvancedSettingsPanel';
// import ResponsivePreviewPanel from '../../components/design-editor/advanced/ResponsivePreviewPanel';
// import CollaborationCursors from '../../components/collaboration/CollaborationCursors';
// import PresenceIndicator from '../../components/collaboration/PresenceIndicator';

// Import advanced sections (temporarily disabled for build)
// import VideoSection from '../../components/sections/advanced/VideoSection';
// import PricingSection from '../../components/sections/advanced/PricingSection';
// import FAQSection from '../../components/sections/advanced/FAQSection';
// import TeamSection from '../../components/sections/advanced/TeamSection';
// import StatsSection from '../../components/sections/advanced/StatsSection';
// import TimelineSection from '../../components/sections/advanced/TimelineSection';
// import LogoGridSection from '../../components/sections/advanced/LogoGridSection';
// import CTABlockSection from '../../components/sections/advanced/CTABlockSection';

// Import legacy sections for backward compatibility
import HeroSection from '../../components/sections/HeroSection.js';
import FeaturesSection from '../../components/sections/FeaturesSection.jsx';
import GallerySection from '../../components/sections/GallerySection.js';
import TestimonialsSection from '../../components/sections/TestimonialsSection.jsx';
import ContactFormSection from '../../components/sections/ContactFormSection.js';
import NewsletterSection from '../../components/sections/NewsletterSection.js';

interface EnhancedThemeEditorProps {
  designId?: string;
  initialSections?: any[];
}

const EnhancedThemeEditor: React.FC<EnhancedThemeEditorProps> = ({ 
  designId = 'theme-editor-demo',
  initialSections = []
}) => {
  // Advanced store integration
  // Mock store implementation (temporarily disabled advanced store)
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [globalSettings, setGlobalSettings] = useState({});
  const [previewMode, setPreviewModeState] = useState(false);
  const [previewDevice, setPreviewDeviceState] = useState('desktop');
  const [isDirty, setIsDirty] = useState(false);
  
  // Mock store functions with error handling
  const addSection = (section) => {
    try {
      // Create a safe section object with default values
      const safeSection = {
        id: Date.now().toString(),
        type: section.type || 'hero',
        content: {
          title: section.content?.title || 'New Section',
          subtitle: section.content?.subtitle || '',
          primaryCTA: {
            text: section.content?.primaryCTA?.text || 'Learn More',
            url: section.content?.primaryCTA?.url || '#'
          },
          secondaryCTA: {
            text: section.content?.secondaryCTA?.text || 'Get Started',
            url: section.content?.secondaryCTA?.url || '#'
          },
          ...section.content
        },
        settings: section.settings || {},
        ...section
      };
      setSections(prev => [...prev, safeSection]);
    } catch (error) {
      console.error('Failed to add section:', error);
      // Add a basic fallback section
      setSections(prev => [...prev, {
        id: Date.now().toString(),
        type: 'hero',
        content: {
          title: 'New Section',
          subtitle: 'Edit this section to customize your content',
          primaryCTA: { text: 'Learn More', url: '#' },
          secondaryCTA: { text: 'Get Started', url: '#' }
        },
        settings: {}
      }]);
    }
  };
  const removeSection = (id) => setSections(prev => prev.filter(s => s.id !== id));
  const updateSection = (id, updates) => setSections(prev => prev.map(s => s.id === id ? {...s, ...updates} : s));
  const duplicateSection = (id) => {
    const section = sections.find(s => s.id === id);
    if (section) addSection({ ...section, id: Date.now().toString() });
  };
  const reorderSections = (startIndex, endIndex) => {
    setSections(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };
  const selectSection = (id) => setSelectedSection(id);
  const setPreviewMode = setPreviewModeState;
  const setPreviewDevice = setPreviewDeviceState;
  const undo = () => console.log('Undo');
  const redo = () => console.log('Redo');
  const history = [];
  const saveToHistory = () => console.log('Save to history');
  const updateGlobalSettings = (updates) => setGlobalSettings(prev => ({ ...prev, ...updates }));

  // Collaboration integration (temporarily disabled)
  // const collaboration = useCollaboration(designId);
  const collaboration = { actions: { broadcastSectionUpdate: () => {} } }; // Mock for now

  // Local state for UI
  const [activeView, setActiveView] = useState('editor');
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<'sections' | 'templates' | 'settings' | 'layers'>('sections');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [deviceMode, setDeviceMode] = useState('desktop');

  // Enhanced section registry
  const sectionRenderers = {
    // Advanced sections
    video: VideoSection,
    pricing: PricingSection,
    faq: FAQSection,
    team: TeamSection,
    stats: StatsSection,
    timeline: TimelineSection,
    'logo-grid': LogoGridSection,
    'cta-block': CTABlockSection,
    
    // Legacy sections (for backward compatibility)
    hero: HeroSection,
    features: FeaturesSection,
    gallery: GallerySection,
    testimonials: TestimonialsSection,
    contact: ContactFormSection,
    newsletter: NewsletterSection,
  };

  // Enhanced section types with categories
  const sectionCategories = {
    basic: {
      name: 'Basic',
      sections: [
        { type: 'hero', name: 'Hero Banner', icon: ImageIcon, description: 'Eye-catching header with call-to-action' },
        { type: 'features', name: 'Features', icon: Star, description: 'Highlight key product features' },
        { type: 'gallery', name: 'Image Gallery', icon: Grid3x3, description: 'Showcase products or portfolio' },
        { type: 'testimonials', name: 'Testimonials', icon: MessageSquare, description: 'Customer reviews and feedback' }
      ]
    },
    advanced: {
      name: 'Advanced',
      sections: [
        { type: 'video', name: 'Video', icon: Video, description: 'YouTube, Vimeo, or background video' },
        { type: 'pricing', name: 'Pricing Tables', icon: Tag, description: 'Multi-tier pricing with features' },
        { type: 'faq', name: 'FAQ', icon: MessageSquare, description: 'Searchable questions and answers' },
        { type: 'team', name: 'Team', icon: Users2, description: 'Team member profiles with social links' },
        { type: 'stats', name: 'Stats/Counters', icon: BarChart3, description: 'Animated numeric counters' },
        { type: 'timeline', name: 'Timeline', icon: ArrowDown, description: 'Process steps or company history' },
        { type: 'logo-grid', name: 'Logo Grid', icon: Grid3x3, description: 'Partner or client logos' },
        { type: 'cta-block', name: 'CTA Block', icon: Target, description: 'High-conversion call-to-action' }
      ]
    },
    ecommerce: {
      name: 'E-commerce',
      sections: [
        { type: 'products', name: 'Product Grid', icon: Package, description: 'Product showcase grid' },
        { type: 'banner', name: 'Announcement', icon: Maximize2, description: 'Promotional banner' },
        { type: 'newsletter', name: 'Newsletter', icon: MessageSquare, description: 'Email subscription form' },
        { type: 'contact', name: 'Contact Form', icon: MessageSquare, description: 'Customer contact form' }
      ]
    }
  };

  const pages = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'products', name: 'Products', icon: ShoppingBag },
    { id: 'collections', name: 'Collections', icon: LayoutGrid },
    { id: 'about', name: 'About', icon: Users },
    { id: 'contact', name: 'Contact', icon: MessageSquare }
  ];

  // Initialize with demo sections if empty
  useEffect(() => {
    if (sections.length === 0 && initialSections.length === 0) {
      // Add demo sections
      const demoSections = [
        { type: 'hero', preset: 'product-demo' },
        { type: 'stats', preset: 'company-stats' },
        { type: 'logo-grid', preset: 'partners' },
        { type: 'cta-block', preset: 'signup-cta' }
      ];

      demoSections.forEach((section, index) => {
        setTimeout(() => {
          addSection(section.type, index, section.preset);
        }, index * 100);
      });
    }
  }, []);

  // Animation hook for smooth transitions
  // const fadeInAnimation = useAnimationPreset('sectionFadeUp'); // Temporarily disabled

  const handleAddSection = useCallback((type: string, preset?: string) => {
    addSection(type, sections.length, preset);
    setShowAddSection(false);
    saveToHistory('add', `Added ${type} section`);
  }, [addSection, sections.length, saveToHistory]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    removeSection(sectionId);
    saveToHistory('delete', `Deleted ${section?.type || 'section'}`);
  }, [removeSection, sections, saveToHistory]);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    duplicateSection(sectionId);
    saveToHistory('duplicate', 'Duplicated section');
  }, [duplicateSection, saveToHistory]);

  const handleMoveSection = useCallback((startIndex: number, endIndex: number) => {
    reorderSections(startIndex, endIndex);
    saveToHistory('reorder', 'Reordered sections');
  }, [reorderSections, saveToHistory]);

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.states.length - 1;

  // Helper function to get device width classes
  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      default: return 'max-w-7xl';
    }
  };

  // Section renderer with advanced features
  const renderSection = useCallback((section: any, index: number) => {
    const SectionComponent = sectionRenderers[section.type as keyof typeof sectionRenderers];
    
    if (!SectionComponent) {
      // Fallback for unknown section types
      return (
        <div className="p-8 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Unknown section type: {section.type}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                This section type is not supported in the current editor.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Apply section settings as styles
    const sectionStyles = {
      backgroundColor: section.settings?.backgroundColor || 'transparent',
      color: section.settings?.textColor || 'inherit',
      padding: section.settings?.padding ? 
        `${section.settings.padding.desktop?.top || 0}px ${section.settings.padding.desktop?.right || 0}px ${section.settings.padding.desktop?.bottom || 0}px ${section.settings.padding.desktop?.left || 0}px` 
        : undefined,
    };

    return (
      <div style={sectionStyles} className="relative">
        <SectionComponent
          content={section.content}
          isEditing={!previewMode}
          onContentChange={(updates: any) => {
            updateSection(section.id, { content: { ...section.content, ...updates } });
            collaboration.actions.broadcastSectionUpdate(section.id, updates);
          }}
        />
      </div>
    );
  }, [sectionRenderers, previewMode, updateSection, collaboration]);

  // Animation preset for sections (temporarily disabled)
  // const sectionFadeUpAnimation = useAnimationPreset('sectionFadeUp');
  const sectionFadeUpAnimation = { ref: null, variants: {}, initial: 'hidden', animate: 'visible', transition: {} };

  // Section renderer with animation wrapper
  const renderSectionWithAnimation = useCallback((section: any, index: number) => {
    const animationConfig = section.settings?.animation;
    
    if (animationConfig && animationConfig.type !== 'none') {
      const animationProps = sectionFadeUpAnimation;
      
      return (
        <motion.div
          key={section.id}
          ref={animationProps.ref}
          variants={animationProps.variants}
          initial={animationProps.initial}
          animate={animationProps.animate}
          transition={animationProps.transition}
        >
          {renderSection(section, index)}
        </motion.div>
      );
    }

    return renderSection(section, index);
  }, [renderSection, sectionFadeUpAnimation]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 relative">
      {/* Collaboration Features (temporarily disabled) */}
      {/* <CollaborationCursors designId={designId} /> */}
      
      {/* Enhanced Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Advanced Builder</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-600">Theme Editor</span>
          
          {/* Collaboration indicator */}
          {/* <PresenceIndicator designId={designId} /> */}
        </div>
        
        <div className="flex items-center gap-4">
          {/* History Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={undo} 
              disabled={!canUndo}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo size={18} />
            </button>
          </div>
          
          {/* Device Preview Controls */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => {
                setDeviceMode('desktop');
                setPreviewDevice(/* desktop device preset */);
              }}
              className={`p-2 rounded transition-colors ${
                deviceMode === 'desktop' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop view"
            >
              <Monitor size={18} />
            </button>
            <button 
              onClick={() => {
                setDeviceMode('tablet');
                setPreviewDevice(/* tablet device preset */);
              }}
              className={`p-2 rounded transition-colors ${
                deviceMode === 'tablet' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet view"
            >
              <Tablet size={18} />
            </button>
            <button 
              onClick={() => {
                setDeviceMode('mobile');
                setPreviewDevice(/* mobile device preset */);
              }}
              className={`p-2 rounded transition-colors ${
                deviceMode === 'mobile' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile view"
            >
              <Smartphone size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Templates</span>
            </button>
            
            <button 
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                previewMode
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Eye size={16} />
              <span className="hidden sm:inline">{previewMode ? 'Exit Preview' : 'Preview'}</span>
            </button>
            
            <button 
              onClick={() => {/* Save functionality */}}
              disabled={!isDirty}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Left Sidebar */}
        {!previewMode && (
          <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
            {/* Sidebar Tabs */}
            <div className="border-b border-gray-200 p-4">
              <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'sections', icon: Plus, label: 'Add' },
                  { id: 'templates', icon: LayoutGrid, label: 'Templates' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'layers', icon: Eye, label: 'Layers' },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarMode(tab.id as any)}
                      className={`flex flex-col items-center px-2 py-2 text-xs font-medium rounded transition-colors ${
                        sidebarMode === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="w-4 h-4 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pages Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">Pages</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {pages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                      activePage === page.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <page.icon size={16} />
                    <span>{page.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarMode === 'sections' && (
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-4">Add Sections</h3>
                  
                  {Object.entries(sectionCategories).map(([categoryId, category]) => (
                    <div key={categoryId} className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {category.sections.map(section => (
                          <button
                            key={section.type}
                            onClick={() => handleAddSection(section.type)}
                            className="w-full flex items-start gap-3 p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-all group"
                          >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <section.icon size={16} className="text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm text-gray-900">{section.name}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-tight">
                                {section.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sidebarMode === 'layers' && (
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-4">Page Layers</h3>
                  <div className="space-y-2">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        onClick={() => selectSection(section)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all group ${
                          selectedSection?.id === section.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm capitalize">{section.name || section.type}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleMoveSection(index, Math.max(0, index - 1)); 
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                              title="Move up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleMoveSection(index, Math.min(sections.length - 1, index + 1)); 
                              }}
                              disabled={index === sections.length - 1}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                              title="Move down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">
                            {section.content?.title || section.content?.content || 'No content'}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDuplicateSection(section.id); 
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Duplicate"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteSection(section.id); 
                              }}
                              className="p-1 hover:bg-red-200 text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {sections.length === 0 && (
                      <div className="text-center py-8">
                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No sections yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add your first section to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {previewMode ? (
            /* Responsive Preview Mode (simplified) */
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              <div className="text-center mb-4">
                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 text-sm rounded-md ${previewDevice === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <Monitor className="w-4 h-4 inline mr-1" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-3 py-1 text-sm rounded-md ${previewDevice === 'tablet' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <Tablet className="w-4 h-4 inline mr-1" />
                    Tablet
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 text-sm rounded-md ${previewDevice === 'mobile' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Mobile
                  </button>
                </div>
              </div>
              <div className={`${getDeviceWidth()} mx-auto bg-white shadow-xl rounded-lg overflow-hidden`}>
                <div className="min-h-screen bg-white">
                  {sections.map((section, index) => renderSectionWithAnimation(section, index))}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode Canvas */
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              <div className={`${getDeviceWidth()} mx-auto bg-white shadow-xl rounded-lg overflow-hidden`}>
                {sections.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-24">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Start Building Your Page</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Add sections from the sidebar to create your perfect design. Choose from basic components or advanced features.
                    </p>
                    <button
                      onClick={() => setSidebarMode('sections')}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Section
                    </button>
                  </div>
                ) : (
                  /* Sections Rendering */
                  <div className="space-y-0">
                    {sections.map((section, index) => (
                      <div key={section.id} className="relative group">
                        {/* Section Content */}
                        <div 
                          className={`transition-all duration-200 ${
                            selectedSection?.id === section.id 
                              ? 'ring-2 ring-blue-500 ring-offset-2' 
                              : ''
                          }`}
                          onClick={() => selectSection(section)}
                        >
                          {renderSection(section, index)}
                        </div>

                        {/* Section Controls Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Hover Controls */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                            <div className="absolute top-2 right-2 flex gap-2 bg-white rounded-lg shadow-lg p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateSection(section.id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                                title="Duplicate section"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSection(index, Math.max(0, index - 1));
                                }}
                                disabled={index === 0}
                                className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                                title="Move up"
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSection(index, Math.min(sections.length - 1, index + 1));
                                }}
                                disabled={index === sections.length - 1}
                                className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                                title="Move down"
                              >
                                <ArrowDown size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id);
                                }}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                title="Delete section"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {selectedSection?.id === section.id && (
                            <div className="absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-br-lg">
                              {section.name || section.type} Selected
                            </div>
                          )}
                        </div>

                        {/* Add Section Between */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              setShowAddSection(true);
                              // Focus on adding after this section
                            }}
                            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                            title="Add section below"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Advanced Settings Panel */}
        {selectedSection && !previewMode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-hidden">
            {/* <AdvancedSettingsPanel
              section={selectedSection}
              onUpdate={(updates) => updateSection(selectedSection.id, updates)}
              onCopyStyles={() => {
                // Copy styles functionality
                navigator.clipboard.writeText(JSON.stringify(selectedSection.settings));
              }}
              onPasteStyles={() => {
                // Paste styles functionality
              }}
              canPasteStyles={false}
            /> */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Section Settings</h3>
                <button 
                  onClick={() => selectSection(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section ID</label>
                  <input 
                    type="text" 
                    value={selectedSection?.id || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                  <input 
                    type="text" 
                    value={selectedSection?.type || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                </div>
                <p className="text-sm text-gray-500 italic">Advanced settings panel temporarily disabled for build.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-5/6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Template Gallery Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
                <p className="text-gray-600 mt-1">Choose from professionally designed templates</p>
              </div>
              <button
                onClick={() => setShowTemplateGallery(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Template Categories */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    id: 'fashion', 
                    name: 'Fashion Store',
                    description: 'Elegant e-commerce with video hero',
                    image: '/templates/fashion-preview.jpg',
                    sections: ['video', 'stats', 'logo-grid', 'cta-block']
                  },
                  { 
                    id: 'tech', 
                    name: 'Tech Startup',
                    description: 'Modern SaaS landing page',
                    image: '/templates/tech-preview.jpg',
                    sections: ['hero', 'features', 'pricing', 'team']
                  },
                  { 
                    id: 'portfolio', 
                    name: 'Creative Portfolio',
                    description: 'Personal portfolio showcase',
                    image: '/templates/portfolio-preview.jpg',
                    sections: ['hero', 'gallery', 'timeline', 'contact']
                  }
                ].map((template) => (
                  <div 
                    key={template.id}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    onClick={() => {
                      // Apply template - add all sections
                      template.sections.forEach((sectionType, index) => {
                        setTimeout(() => {
                          handleAddSection(sectionType);
                        }, index * 200);
                      });
                      setShowTemplateGallery(false);
                    }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {template.sections.length} sections
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Use Template
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Section</h3>
                <button
                  onClick={() => setShowAddSection(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-96">
              {Object.entries(sectionCategories).map(([categoryId, category]) => (
                <div key={categoryId} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {category.sections.map(section => (
                      <button
                        key={section.type}
                        onClick={() => handleAddSection(section.type)}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-all text-left"
                      >
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <section.icon size={16} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{section.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {section.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedThemeEditor;