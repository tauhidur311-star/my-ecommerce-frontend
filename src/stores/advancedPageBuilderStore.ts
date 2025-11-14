/**
 * Advanced Page Builder Store
 * Enhanced Zustand store with TypeScript, history management, templates, and A/B testing
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import type {
  PageBuilderStore,
  SectionBase,
  PageBuilderTheme,
  DevicePreview,
  HistoryManager,
  HistoryState,
  TemplateRegistry,
  PageTemplate,
  ABTest,
  ABTestVariant,
  ExportOptions,
  ImportResult,
  PerformanceSettings
} from '../types/pageBuilder';
import { validateSection } from '../schemas/sectionSchemas';
import { allPresets } from '../data/sectionPresets';
import { templateRegistry } from '../data/templateRegistry';

// ====================
// DEFAULT CONFIGURATIONS
// ====================

const defaultTheme: PageBuilderTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    text: '#1F2937',
    background: '#FFFFFF',
    border: '#E5E7EB',
    muted: '#6B7280',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: 1.6,
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};

const devicePresets: DevicePreview[] = [
  {
    id: 'desktop-1920',
    name: 'Desktop (1920x1080)',
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    pixelRatio: 1,
    touch: false,
    category: 'desktop',
  },
  {
    id: 'desktop-1366',
    name: 'Desktop (1366x768)',
    width: 1366,
    height: 768,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    pixelRatio: 1,
    touch: false,
    category: 'desktop',
  },
  {
    id: 'tablet-ipad',
    name: 'iPad',
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    pixelRatio: 2,
    touch: true,
    category: 'tablet',
  },
  {
    id: 'mobile-iphone',
    name: 'iPhone 12',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    pixelRatio: 3,
    touch: true,
    category: 'mobile',
  },
  {
    id: 'mobile-android',
    name: 'Samsung Galaxy S21',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
    pixelRatio: 3,
    touch: true,
    category: 'mobile',
  },
];

// ====================
// UTILITY FUNCTIONS
// ====================

function createSection(type: string, preset?: string): SectionBase {
  const presetData = preset && allPresets[type as keyof typeof allPresets]?.[preset];
  
  if (!presetData) {
    throw new Error(`Preset "${preset}" not found for section type "${type}"`);
  }

  return {
    id: nanoid(),
    type,
    name: presetData.name,
    content: presetData.content,
    settings: presetData.settings,
    presets: [preset].filter(Boolean),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createHistoryState(
  action: HistoryState['action'],
  sections: SectionBase[],
  selectedSectionId: string | null,
  description: string
): HistoryState {
  return {
    id: nanoid(),
    action,
    timestamp: new Date(),
    sections: JSON.parse(JSON.stringify(sections)), // Deep clone
    selectedSectionId,
    description,
  };
}

// ====================
// MAIN STORE
// ====================

const useAdvancedPageBuilderStore = create<PageBuilderStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ====================
      // CORE STATE
      // ====================
      sections: [],
      selectedSection: null,
      globalSettings: defaultTheme,

      // ====================
      // UI STATE
      // ====================
      previewMode: false,
      previewDevice: devicePresets[0],
      sidebarMode: 'sections',

      // ====================
      // STATUS
      // ====================
      isDirty: false,
      isLoading: false,
      isSaving: false,

      // ====================
      // HISTORY
      // ====================
      history: {
        states: [],
        currentIndex: -1,
        maxStates: 50,
      },

      // ====================
      // TEMPLATES
      // ====================
      templateRegistry,

      // ====================
      // A/B TESTING
      // ====================
      abTests: [],
      currentABTest: null,

      // ====================
      // PERFORMANCE SETTINGS
      // ====================
      performanceSettings: {
        networkSpeed: '4g',
        cpuThrottling: 1,
        cacheDisabled: false,
      } as PerformanceSettings,

      // ====================
      // SECTION ACTIONS
      // ====================

      addSection: (type: string, index?: number, preset?: string) => {
        try {
          const newSection = createSection(type, preset || 'default');
          
          // Validate the section
          validateSection(type as any, {
            type,
            content: newSection.content,
            settings: newSection.settings,
          });

          set((state) => {
            const newSections = [...state.sections];
            const insertIndex = index !== undefined ? index : newSections.length;
            newSections.splice(insertIndex, 0, newSection);

            return {
              sections: newSections,
              selectedSection: newSection,
              isDirty: true,
            };
          });

          get().saveToHistory('add', `Added ${newSection.name} section`);
          toast.success(`${newSection.name} section added`);
        } catch (error) {
          console.error('Failed to add section:', error);
          toast.error('Failed to add section');
        }
      },

      removeSection: (sectionId: string) => {
        const state = get();
        const section = state.sections.find(s => s.id === sectionId);
        
        if (!section) return;

        set((state) => ({
          sections: state.sections.filter(s => s.id !== sectionId),
          selectedSection: state.selectedSection?.id === sectionId ? null : state.selectedSection,
          isDirty: true,
        }));

        get().saveToHistory('remove', `Removed ${section.name} section`);
        toast.success('Section removed');
      },

      updateSection: (sectionId: string, updates: Partial<SectionBase>) => {
        const state = get();
        const section = state.sections.find(s => s.id === sectionId);
        
        if (!section) return;

        try {
          // Validate updates if they include content
          if (updates.content) {
            validateSection(section.type as any, {
              type: section.type,
              content: { ...section.content, ...updates.content },
              settings: updates.settings || section.settings,
            });
          }

          set((state) => ({
            sections: state.sections.map(s =>
              s.id === sectionId
                ? {
                    ...s,
                    ...updates,
                    content: updates.content ? { ...s.content, ...updates.content } : s.content,
                    settings: updates.settings ? { ...s.settings, ...updates.settings } : s.settings,
                    updatedAt: new Date(),
                  }
                : s
            ),
            selectedSection: state.selectedSection?.id === sectionId
              ? { ...state.selectedSection, ...updates }
              : state.selectedSection,
            isDirty: true,
          }));

          // Don't save every update to history immediately (too many states)
          // Instead, debounce or save on specific actions
        } catch (error) {
          console.error('Failed to update section:', error);
          toast.error('Failed to update section');
        }
      },

      duplicateSection: (sectionId: string) => {
        const state = get();
        const section = state.sections.find(s => s.id === sectionId);
        
        if (!section) return;

        const duplicated: SectionBase = {
          ...section,
          id: nanoid(),
          name: `${section.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const index = state.sections.findIndex(s => s.id === sectionId);

        set((state) => {
          const newSections = [...state.sections];
          newSections.splice(index + 1, 0, duplicated);
          return {
            sections: newSections,
            selectedSection: duplicated,
            isDirty: true,
          };
        });

        get().saveToHistory('duplicate', `Duplicated ${section.name} section`);
        toast.success('Section duplicated');
      },

      reorderSections: (startIndex: number, endIndex: number) => {
        set((state) => {
          const newSections = [...state.sections];
          const [moved] = newSections.splice(startIndex, 1);
          newSections.splice(endIndex, 0, moved);

          return {
            sections: newSections,
            isDirty: true,
          };
        });

        get().saveToHistory('reorder', 'Reordered sections');
      },

      selectSection: (section: SectionBase | null) => {
        set({ selectedSection: section });
      },

      // ====================
      // HISTORY ACTIONS
      // ====================

      undo: () => {
        const state = get();
        const { history } = state;
        
        if (history.currentIndex > 0) {
          const previousState = history.states[history.currentIndex - 1];
          set({
            sections: JSON.parse(JSON.stringify(previousState.sections)),
            selectedSection: previousState.selectedSectionId
              ? previousState.sections.find(s => s.id === previousState.selectedSectionId) || null
              : null,
            history: {
              ...history,
              currentIndex: history.currentIndex - 1,
            },
            isDirty: true,
          });
          toast.success('Undone');
        }
      },

      redo: () => {
        const state = get();
        const { history } = state;
        
        if (history.currentIndex < history.states.length - 1) {
          const nextState = history.states[history.currentIndex + 1];
          set({
            sections: JSON.parse(JSON.stringify(nextState.sections)),
            selectedSection: nextState.selectedSectionId
              ? nextState.sections.find(s => s.id === nextState.selectedSectionId) || null
              : null,
            history: {
              ...history,
              currentIndex: history.currentIndex + 1,
            },
            isDirty: true,
          });
          toast.success('Redone');
        }
      },

      saveToHistory: (action: HistoryState['action'], description: string) => {
        const state = get();
        const historyState = createHistoryState(
          action,
          state.sections,
          state.selectedSection?.id || null,
          description
        );

        set((state) => {
          const newHistory = { ...state.history };
          
          // Remove any states after current index (when undoing then making new changes)
          newHistory.states = newHistory.states.slice(0, newHistory.currentIndex + 1);
          
          // Add new state
          newHistory.states.push(historyState);
          newHistory.currentIndex = newHistory.states.length - 1;
          
          // Limit history size
          if (newHistory.states.length > newHistory.maxStates) {
            newHistory.states = newHistory.states.slice(-newHistory.maxStates);
            newHistory.currentIndex = newHistory.states.length - 1;
          }

          return { history: newHistory };
        });
      },

      // ====================
      // TEMPLATE ACTIONS
      // ====================

      applyTemplate: (templateId: string) => {
        const template = get().templateRegistry.templates[templateId];
        if (!template) {
          toast.error('Template not found');
          return;
        }

        try {
          const sections = template.sections.map(sectionConfig => {
            const section = createSection(sectionConfig.type, sectionConfig.preset);
            if (sectionConfig.content) {
              section.content = { ...section.content, ...sectionConfig.content };
            }
            return section;
          });

          set({
            sections,
            selectedSection: null,
            globalSettings: { ...get().globalSettings, ...template.globalSettings },
            isDirty: true,
          });

          get().saveToHistory('template', `Applied ${template.name} template`);
          toast.success(`${template.name} template applied`);
        } catch (error) {
          console.error('Failed to apply template:', error);
          toast.error('Failed to apply template');
        }
      },

      saveAsTemplate: (name: string, category: string) => {
        const state = get();
        const template: PageTemplate = {
          id: nanoid(),
          name,
          description: `Custom template created from current design`,
          category: category as any,
          subcategory: 'custom',
          preview: '',
          thumbnail: '',
          sections: state.sections.map(section => ({
            type: section.type,
            preset: section.presets?.[0] || 'default',
            content: section.content,
          })),
          globalSettings: state.globalSettings,
          tags: ['custom'],
          premium: false,
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // In a real app, this would save to backend
        console.log('Template to save:', template);
        toast.success(`Template "${name}" saved`);
      },

      // ====================
      // EXPORT/IMPORT ACTIONS
      // ====================

      exportDesign: async (options: ExportOptions): Promise<Blob> => {
        const state = get();
        
        switch (options.format) {
          case 'json': {
            const exportData = {
              version: options.version || '1.0.0',
              metadata: options.metadata,
              sections: state.sections,
              globalSettings: state.globalSettings,
              exportedAt: new Date().toISOString(),
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            return new Blob([jsonString], { type: 'application/json' });
          }
          
          case 'html': {
            // Generate static HTML
            const html = generateStaticHTML(state.sections, state.globalSettings);
            return new Blob([html], { type: 'text/html' });
          }
          
          case 'pdf': {
            // Generate PDF (would use a library like jsPDF)
            throw new Error('PDF export not implemented yet');
          }
          
          case 'figma': {
            // Generate Figma plugin data
            throw new Error('Figma export not implemented yet');
          }
          
          default:
            throw new Error(`Unsupported export format: ${options.format}`);
        }
      },

      importDesign: async (file: File): Promise<ImportResult> => {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          const warnings: string[] = [];
          const errors: string[] = [];
          
          // Validate imported data
          if (!data.sections || !Array.isArray(data.sections)) {
            throw new Error('Invalid file format: sections array not found');
          }
          
          // Validate each section
          const validSections: SectionBase[] = [];
          for (const section of data.sections) {
            try {
              validateSection(section.type, section);
              validSections.push({
                ...section,
                id: nanoid(), // Generate new IDs
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } catch (error) {
              errors.push(`Section "${section.type}": ${(error as Error).message}`);
            }
          }
          
          if (validSections.length === 0) {
            throw new Error('No valid sections found in import file');
          }
          
          return {
            success: true,
            sections: validSections,
            globalSettings: data.globalSettings || get().globalSettings,
            warnings,
            errors,
          };
        } catch (error) {
          return {
            success: false,
            sections: [],
            globalSettings: get().globalSettings,
            warnings: [],
            errors: [(error as Error).message],
          };
        }
      },

      // ====================
      // GLOBAL SETTINGS
      // ====================

      updateGlobalSettings: (settings: Partial<PageBuilderTheme>) => {
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            ...settings,
          },
          isDirty: true,
        }));
      },

      // ====================
      // PREVIEW ACTIONS
      // ====================

      setPreviewMode: (enabled: boolean) => {
        set({
          previewMode: enabled,
          selectedSection: enabled ? null : get().selectedSection,
        });
      },

      setPreviewDevice: (device: DevicePreview) => {
        set({ previewDevice: device });
      },

      // ====================
      // A/B TESTING ACTIONS
      // ====================

      createABTest: (test: Omit<ABTest, 'id'>) => {
        const newTest: ABTest = {
          ...test,
          id: nanoid(),
        };
        
        set((state) => ({
          abTests: [...state.abTests, newTest],
        }));
        
        toast.success(`A/B test "${test.name}" created`);
      },

      updateABTest: (testId: string, updates: Partial<ABTest>) => {
        set((state) => ({
          abTests: state.abTests.map(test =>
            test.id === testId ? { ...test, ...updates } : test
          ),
        }));
      },

      startABTest: (testId: string) => {
        set((state) => ({
          abTests: state.abTests.map(test =>
            test.id === testId 
              ? { ...test, status: 'running' as const, startDate: new Date() }
              : test
          ),
          currentABTest: state.abTests.find(test => test.id === testId) || null,
        }));
        
        toast.success('A/B test started');
      },

      stopABTest: (testId: string) => {
        set((state) => ({
          abTests: state.abTests.map(test =>
            test.id === testId 
              ? { ...test, status: 'completed' as const, endDate: new Date() }
              : test
          ),
          currentABTest: null,
        }));
        
        toast.success('A/B test stopped');
      },
    })),
    {
      name: 'advanced-page-builder-store',
    }
  )
);

// ====================
// UTILITY FUNCTIONS
// ====================

function generateStaticHTML(sections: SectionBase[], globalSettings: PageBuilderTheme): string {
  // This is a simplified version - in reality, you'd want a more robust HTML generator
  const sectionsHTML = sections.map(section => {
    return `
      <section data-section-type="${section.type}" data-section-id="${section.id}">
        <!-- Section content would be rendered here -->
        <div class="section-content">
          ${JSON.stringify(section.content, null, 2)}
        </div>
      </section>
    `;
  }).join('\n');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated Page</title>
      <style>
        body {
          font-family: ${globalSettings.typography.fontFamily};
          line-height: ${globalSettings.typography.lineHeight};
          color: ${globalSettings.colors.text};
          background-color: ${globalSettings.colors.background};
          margin: 0;
          padding: 0;
        }
        .section-content {
          padding: 2rem;
          border-bottom: 1px solid ${globalSettings.colors.border};
        }
      </style>
    </head>
    <body>
      ${sectionsHTML}
    </body>
    </html>
  `;
}

export { devicePresets, defaultTheme };
export default useAdvancedPageBuilderStore;