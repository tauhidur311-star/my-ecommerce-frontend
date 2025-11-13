import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';

// Section schemas and default content
export const SECTION_SCHEMAS = {
  hero: {
    type: 'hero',
    defaultContent: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products with exceptional quality',
      ctaText: 'Shop Now',
      ctaUrl: '/products',
      backgroundImage: '',
      alignment: 'center',
      height: 'large'
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 80, bottom: 80 }
    }
  },
  features: {
    type: 'features',
    defaultContent: {
      title: 'Why Choose Us',
      items: [
        {
          id: nanoid(),
          icon: 'star',
          title: 'Premium Quality',
          description: 'We source only the finest products'
        },
        {
          id: nanoid(),
          icon: 'truck',
          title: 'Fast Delivery',
          description: 'Quick and reliable shipping worldwide'
        },
        {
          id: nanoid(),
          icon: 'shield',
          title: 'Secure Shopping',
          description: 'Your data and payments are protected'
        }
      ]
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 }
    }
  },
  gallery: {
    type: 'gallery',
    defaultContent: {
      title: 'Our Gallery',
      images: [],
      columns: 3,
      showTitles: true
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 }
    }
  },
  testimonials: {
    type: 'testimonials',
    defaultContent: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          id: nanoid(),
          name: 'Sarah Johnson',
          role: 'Happy Customer',
          content: 'Amazing products and excellent service. Highly recommended!',
          rating: 5,
          avatar: ''
        }
      ]
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 }
    }
  },
  contact: {
    type: 'contact',
    defaultContent: {
      title: 'Get In Touch',
      subtitle: 'We\'d love to hear from you',
      showPhone: true,
      showEmail: true,
      showAddress: true,
      showForm: true,
      formFields: [
        { id: 'name', label: 'Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'message', label: 'Message', type: 'textarea', required: true }
      ]
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 }
    }
  },
  newsletter: {
    type: 'newsletter',
    defaultContent: {
      title: 'Stay Updated',
      subtitle: 'Subscribe to our newsletter for the latest updates and offers',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe',
      successMessage: 'Thank you for subscribing!'
    },
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 }
    }
  }
};

// Available sections for the sidebar
export const AVAILABLE_SECTIONS = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner with call-to-action',
    icon: 'layout',
    category: 'headers'
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Showcase product features',
    icon: 'star',
    category: 'content'
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Display product images',
    icon: 'image',
    category: 'media'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews and feedback',
    icon: 'quote',
    category: 'social'
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Contact information and form',
    icon: 'mail',
    category: 'forms'
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email subscription form',
    icon: 'mail',
    category: 'forms'
  }
];

const useDesignStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      sections: [],
      selectedSection: null,
      previewMode: false,
      sidebarMode: 'sections',
      isDirty: false,
      isLoading: false,
      isSaving: false,
      storeId: 'default',

      // Global design settings
      globalSettings: {
        layout: {
          maxWidth: '1200px',
          padding: '20px',
          backgroundColor: '#ffffff'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: {
            base: '16px',
            h1: '2.5rem',
            h2: '2rem',
            h3: '1.5rem'
          },
          lineHeight: 1.6
        },
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          text: '#1F2937',
          background: '#FFFFFF'
        },
        spacing: {
          small: '1rem',
          medium: '2rem',
          large: '4rem'
        }
      },

      // Actions
      addSection: (sectionType, index = -1) => {
        const schema = SECTION_SCHEMAS[sectionType];
        if (!schema) {
          toast.error('Unknown section type');
          return;
        }

        const newSection = {
          id: nanoid(),
          type: sectionType,
          content: { ...schema.defaultContent },
          settings: { ...schema.settings }
        };

        set((state) => {
          const newSections = [...state.sections];
          if (index >= 0) {
            newSections.splice(index, 0, newSection);
          } else {
            newSections.push(newSection);
          }
          
          return {
            sections: newSections,
            selectedSection: newSection,
            isDirty: true
          };
        });

        toast.success(`${schema.defaultContent.title || sectionType} section added`);
      },

      removeSection: (sectionId) => {
        set((state) => ({
          sections: state.sections.filter(s => s.id !== sectionId),
          selectedSection: state.selectedSection?.id === sectionId ? null : state.selectedSection,
          isDirty: true
        }));
        toast.success('Section removed');
      },

      reorderSections: (startIndex, endIndex) => {
        set((state) => {
          const newSections = Array.from(state.sections);
          const [removed] = newSections.splice(startIndex, 1);
          newSections.splice(endIndex, 0, removed);
          
          return {
            sections: newSections,
            isDirty: true
          };
        });
      },

      duplicateSection: (sectionId) => {
        set((state) => {
          const section = state.sections.find(s => s.id === sectionId);
          if (!section) return state;

          const duplicated = {
            ...section,
            id: nanoid(),
            content: { ...section.content }
          };

          const index = state.sections.findIndex(s => s.id === sectionId);
          const newSections = [...state.sections];
          newSections.splice(index + 1, 0, duplicated);

          return {
            sections: newSections,
            selectedSection: duplicated,
            isDirty: true
          };
        });
        toast.success('Section duplicated');
      },

      updateSection: (sectionId, updates) => {
        set((state) => ({
          sections: state.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  ...updates,
                  content: updates.content ? { ...section.content, ...updates.content } : section.content,
                  settings: updates.settings ? { ...section.settings, ...updates.settings } : section.settings
                }
              : section
          ),
          isDirty: true
        }));
      },

      selectSection: (section) => {
        set({ selectedSection: section });
      },

      setSidebarMode: (mode) => {
        set({ sidebarMode: mode });
      },

      setPreviewMode: (previewMode) => {
        set({ previewMode, selectedSection: previewMode ? null : get().selectedSection });
      },

      updateGlobalSettings: (updates) => {
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            ...updates
          },
          isDirty: true
        }));
      },

      // Load design from backend
      loadDesign: async (storeId) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/design/${storeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              set({
                sections: data.data.layout || [],
                globalSettings: data.data.globalSettings || get().globalSettings,
                storeId,
                isDirty: false
              });
              toast.success('Design loaded successfully');
            } else {
              // Initialize empty design for new store
              set({ sections: [], storeId, isDirty: false });
            }
          } else {
            // Initialize empty design on error
            set({ sections: [], storeId, isDirty: false });
          }
        } catch (error) {
          console.error('Error loading design:', error);
          set({ sections: [], storeId, isDirty: false });
          toast.error('Failed to load design');
        } finally {
          set({ isLoading: false });
        }
      },

      // Save design to backend
      saveDesign: async () => {
        const { sections, globalSettings, storeId } = get();
        
        set({ isSaving: true });
        try {
          const response = await fetch(`/api/design/${storeId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              layout: sections,
              globalSettings
            })
          });

          if (response.ok) {
            set({ isDirty: false });
            toast.success('Design saved successfully');
            return true;
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save design');
          }
        } catch (error) {
          console.error('Error saving design:', error);
          toast.error(error.message || 'Failed to save design');
          return false;
        } finally {
          set({ isSaving: false });
        }
      },

      // Reset design
      resetDesign: () => {
        set({
          sections: [],
          selectedSection: null,
          isDirty: false
        });
        toast.success('Design reset');
      }
    })),
    {
      name: 'design-store'
    }
  )
);

export default useDesignStore;