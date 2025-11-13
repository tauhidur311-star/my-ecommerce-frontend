import { nanoid } from 'nanoid';

// Generate unique section ID
export const generateSectionId = () => nanoid(10);

// Default section templates
export const createDefaultSection = (type) => {
  const baseSection = {
    id: generateSectionId(),
    type,
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: { top: 60, bottom: 60 },
      hidden: false
    }
  };

  const typeDefaults = {
    hero: {
      content: {
        title: 'Welcome to Our Store',
        subtitle: 'Discover amazing products with exceptional quality',
        ctaText: 'Shop Now',
        ctaUrl: '/products',
        backgroundImage: '',
        alignment: 'center',
        height: 'large'
      }
    },
    features: {
      content: {
        title: 'Why Choose Us',
        items: [
          {
            id: generateSectionId(),
            icon: 'star',
            title: 'Premium Quality',
            description: 'We source only the finest products'
          },
          {
            id: generateSectionId(),
            icon: 'truck',
            title: 'Fast Delivery',
            description: 'Quick and reliable shipping worldwide'
          },
          {
            id: generateSectionId(),
            icon: 'shield',
            title: 'Secure Shopping',
            description: 'Your data and payments are protected'
          }
        ]
      }
    },
    gallery: {
      content: {
        title: 'Our Gallery',
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        columns: 3,
        showTitles: true
      }
    },
    testimonials: {
      content: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            id: generateSectionId(),
            name: 'Sarah Johnson',
            role: 'Happy Customer',
            content: 'Amazing products and excellent service. Highly recommended!',
            rating: 5,
            avatar: '/api/placeholder/80/80'
          }
        ]
      }
    },
    contact: {
      content: {
        title: 'Get In Touch',
        subtitle: "We'd love to hear from you",
        showPhone: true,
        showEmail: true,
        showAddress: true,
        showForm: true,
        formFields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'message', label: 'Message', type: 'textarea', required: true }
        ]
      }
    },
    newsletter: {
      content: {
        title: 'Stay Updated',
        subtitle: 'Subscribe to our newsletter for the latest updates and offers',
        placeholder: 'Enter your email address',
        buttonText: 'Subscribe',
        successMessage: 'Thank you for subscribing!'
      }
    }
  };

  return {
    ...baseSection,
    content: typeDefaults[type]?.content || {}
  };
};

// Validate section data
export const validateSection = (section) => {
  const errors = [];

  if (!section.id) {
    errors.push('Section ID is required');
  }

  if (!section.type) {
    errors.push('Section type is required');
  }

  if (!section.content) {
    errors.push('Section content is required');
  }

  // Type-specific validation
  switch (section.type) {
    case 'hero':
      if (!section.content.title) {
        errors.push('Hero section title is required');
      }
      break;
    case 'features':
      if (!section.content.items || !Array.isArray(section.content.items)) {
        errors.push('Features section must have items array');
      } else if (section.content.items.length === 0) {
        errors.push('Features section must have at least one item');
      }
      break;
    case 'testimonials':
      if (!section.content.testimonials || !Array.isArray(section.content.testimonials)) {
        errors.push('Testimonials section must have testimonials array');
      }
      break;
    case 'newsletter':
      if (!section.content.title) {
        errors.push('Newsletter section title is required');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Clean empty or invalid sections
export const cleanSectionData = (sections) => {
  return sections
    .filter(section => section && section.type && section.content)
    .map(section => ({
      ...section,
      content: cleanObject(section.content),
      settings: cleanObject(section.settings || {})
    }));
};

// Remove undefined/null values from objects
const cleanObject = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

// Generate responsive classes based on device
export const getResponsiveClasses = (device) => {
  switch (device) {
    case 'mobile':
      return 'text-sm px-4';
    case 'tablet':
      return 'text-base px-6';
    default:
      return 'text-base px-8';
  }
};

// Icon mapping for section types
export const getSectionIcon = (type) => {
  const iconMap = {
    hero: '🎯',
    features: '⭐',
    gallery: '🖼️',
    testimonials: '💬',
    contact: '📞',
    newsletter: '📧'
  };
  return iconMap[type] || '📄';
};

// Generate section preview text
export const getSectionPreview = (section) => {
  switch (section.type) {
    case 'hero':
      return section.content.title || 'Hero Section';
    case 'features':
      return `Features (${section.content.items?.length || 0} items)`;
    case 'gallery':
      return `Gallery (${section.content.images?.length || 0} images)`;
    case 'testimonials':
      return `Testimonials (${section.content.testimonials?.length || 0} reviews)`;
    case 'contact':
      return section.content.title || 'Contact Section';
    case 'newsletter':
      return section.content.title || 'Newsletter Section';
    default:
      return `${section.type} Section`;
  }
};

// Export/import utilities
export const exportDesign = (sections, globalSettings) => {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    layout: cleanSectionData(sections),
    globalSettings: cleanObject(globalSettings),
    metadata: {
      sectionCount: sections.length,
      sectionTypes: [...new Set(sections.map(s => s.type))]
    }
  };
};

export const importDesign = (importData) => {
  if (!importData.layout || !Array.isArray(importData.layout)) {
    throw new Error('Invalid design format: layout must be an array');
  }

  const errors = [];
  const validSections = [];

  importData.layout.forEach((section, index) => {
    const validation = validateSection(section);
    if (validation.isValid) {
      validSections.push(section);
    } else {
      errors.push(`Section ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  if (errors.length > 0) {
    console.warn('Import validation warnings:', errors);
  }

  return {
    layout: validSections,
    globalSettings: importData.globalSettings || {},
    warnings: errors
  };
};