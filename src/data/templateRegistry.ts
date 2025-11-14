/**
 * Template Registry
 * Pre-built templates for different industries, styles, and page types
 */

import type { TemplateRegistry, PageTemplate } from '../types/pageBuilder';

// ====================
// TEMPLATE CATEGORIES
// ====================

export const templateCategories = {
  industry: {
    name: 'Industry',
    description: 'Templates tailored for specific industries',
    icon: 'building-2',
    subcategories: {
      fashion: {
        name: 'Fashion & Apparel',
        description: 'Stylish templates for clothing and fashion brands',
      },
      electronics: {
        name: 'Electronics & Tech',
        description: 'Modern templates for technology products',
      },
      food: {
        name: 'Food & Beverage',
        description: 'Appetizing templates for restaurants and food brands',
      },
      beauty: {
        name: 'Beauty & Cosmetics',
        description: 'Elegant templates for beauty and wellness brands',
      },
      fitness: {
        name: 'Fitness & Sports',
        description: 'Energetic templates for fitness and sports',
      },
      real_estate: {
        name: 'Real Estate',
        description: 'Professional templates for property and real estate',
      },
      automotive: {
        name: 'Automotive',
        description: 'Sleek templates for car dealers and automotive services',
      },
      healthcare: {
        name: 'Healthcare',
        description: 'Clean and trustworthy templates for medical services',
      },
    },
  },
  style: {
    name: 'Style',
    description: 'Templates organized by visual design style',
    icon: 'palette',
    subcategories: {
      minimalist: {
        name: 'Minimalist',
        description: 'Clean, simple designs with plenty of white space',
      },
      bold: {
        name: 'Bold & Vibrant',
        description: 'Eye-catching designs with strong colors and typography',
      },
      luxury: {
        name: 'Luxury',
        description: 'Sophisticated, premium designs for high-end brands',
      },
      modern: {
        name: 'Modern',
        description: 'Contemporary designs with latest design trends',
      },
      classic: {
        name: 'Classic',
        description: 'Timeless designs that never go out of style',
      },
      creative: {
        name: 'Creative',
        description: 'Artistic and unconventional design layouts',
      },
    },
  },
  'page-type': {
    name: 'Page Type',
    description: 'Templates for specific page purposes',
    icon: 'file-text',
    subcategories: {
      homepage: {
        name: 'Homepage',
        description: 'Complete homepage designs to showcase your brand',
      },
      product: {
        name: 'Product Page',
        description: 'Product showcase and e-commerce pages',
      },
      about: {
        name: 'About Us',
        description: 'Company story and team introduction pages',
      },
      contact: {
        name: 'Contact',
        description: 'Contact forms and business information pages',
      },
      landing: {
        name: 'Landing Page',
        description: 'Conversion-focused landing pages',
      },
      blog: {
        name: 'Blog',
        description: 'Blog and content-focused page layouts',
      },
      pricing: {
        name: 'Pricing',
        description: 'Pricing tables and subscription pages',
      },
      portfolio: {
        name: 'Portfolio',
        description: 'Showcase work and case studies',
      },
    },
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Templates for holidays and seasonal campaigns',
    icon: 'calendar',
    subcategories: {
      christmas: {
        name: 'Christmas',
        description: 'Festive holiday-themed templates',
      },
      valentine: {
        name: "Valentine's Day",
        description: 'Romantic and love-themed templates',
      },
      summer: {
        name: 'Summer Sale',
        description: 'Bright and energetic summer campaign templates',
      },
      halloween: {
        name: 'Halloween',
        description: 'Spooky and fun Halloween-themed templates',
      },
      blackfriday: {
        name: 'Black Friday',
        description: 'High-conversion sale and discount templates',
      },
      newyear: {
        name: 'New Year',
        description: 'Fresh start and resolution-themed templates',
      },
    },
  },
};

// ====================
// TEMPLATES
// ====================

export const templates: Record<string, PageTemplate> = {
  // ====================
  // INDUSTRY TEMPLATES
  // ====================
  
  'fashion-boutique': {
    id: 'fashion-boutique',
    name: 'Fashion Boutique',
    description: 'Elegant fashion store with hero video and product showcase',
    category: 'industry',
    subcategory: 'fashion',
    preview: '/templates/previews/fashion-boutique.jpg',
    thumbnail: '/templates/thumbnails/fashion-boutique.jpg',
    sections: [
      { type: 'video', preset: 'hero-video' },
      { type: 'features', preset: 'product-highlights' },
      { type: 'gallery', preset: 'product-gallery' },
      { type: 'testimonials', preset: 'customer-reviews' },
      { type: 'newsletter', preset: 'fashion-newsletter' },
    ],
    globalSettings: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
        accent: '#d4af37',
        text: '#333333',
        background: '#ffffff',
        border: '#e5e5e5',
        muted: '#888888',
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        fontSize: {
          base: '1rem',
          lg: '1.25rem',
          xl: '1.5rem',
          '2xl': '2rem',
          '3xl': '2.5rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          bold: '700',
        },
        lineHeight: 1.6,
      },
    },
    tags: ['fashion', 'boutique', 'luxury', 'video'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  'tech-startup': {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern technology startup with stats and team showcase',
    category: 'industry',
    subcategory: 'electronics',
    preview: '/templates/previews/tech-startup.jpg',
    thumbnail: '/templates/thumbnails/tech-startup.jpg',
    sections: [
      { type: 'hero', preset: 'tech-hero' },
      { type: 'stats', preset: 'company-stats' },
      { type: 'features', preset: 'product-features' },
      { type: 'timeline', preset: 'process-steps' },
      { type: 'team', preset: 'leadership-team' },
      { type: 'pricing', preset: 'saas-pricing' },
      { type: 'cta-block', preset: 'signup-cta' },
    ],
    globalSettings: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#F59E0B',
        text: '#1F2937',
        background: '#FFFFFF',
        border: '#E5E7EB',
        muted: '#6B7280',
      },
    },
    tags: ['tech', 'startup', 'modern', 'saas'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  'restaurant-menu': {
    id: 'restaurant-menu',
    name: 'Restaurant & Menu',
    description: 'Appetizing restaurant template with menu showcase',
    category: 'industry',
    subcategory: 'food',
    preview: '/templates/previews/restaurant-menu.jpg',
    thumbnail: '/templates/thumbnails/restaurant-menu.jpg',
    sections: [
      { type: 'hero', preset: 'restaurant-hero' },
      { type: 'gallery', preset: 'food-gallery' },
      { type: 'features', preset: 'menu-highlights' },
      { type: 'testimonials', preset: 'customer-reviews' },
      { type: 'contact', preset: 'restaurant-contact' },
    ],
    globalSettings: {
      colors: {
        primary: '#D97706',
        secondary: '#92400E',
        accent: '#F59E0B',
        text: '#1F2937',
        background: '#FFFBEB',
        border: '#FDE68A',
        muted: '#78716C',
      },
    },
    tags: ['restaurant', 'food', 'menu', 'hospitality'],
    premium: false,
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // ====================
  // STYLE TEMPLATES
  // ====================

  'minimalist-portfolio': {
    id: 'minimalist-portfolio',
    name: 'Minimalist Portfolio',
    description: 'Clean and simple portfolio design',
    category: 'style',
    subcategory: 'minimalist',
    preview: '/templates/previews/minimalist-portfolio.jpg',
    thumbnail: '/templates/thumbnails/minimalist-portfolio.jpg',
    sections: [
      { type: 'hero', preset: 'minimal-hero' },
      { type: 'gallery', preset: 'portfolio-grid' },
      { type: 'timeline', preset: 'experience-timeline' },
      { type: 'contact', preset: 'simple-contact' },
    ],
    globalSettings: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#6B7280',
        text: '#374151',
        background: '#FFFFFF',
        border: '#F3F4F6',
        muted: '#9CA3AF',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '2rem',
        lg: '4rem',
        xl: '6rem',
        '2xl': '8rem',
      },
    },
    tags: ['minimalist', 'portfolio', 'clean', 'simple'],
    premium: false,
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  'luxury-brand': {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    description: 'Premium luxury brand experience',
    category: 'style',
    subcategory: 'luxury',
    preview: '/templates/previews/luxury-brand.jpg',
    thumbnail: '/templates/thumbnails/luxury-brand.jpg',
    sections: [
      { type: 'video', preset: 'luxury-hero' },
      { type: 'features', preset: 'luxury-features' },
      { type: 'gallery', preset: 'luxury-gallery' },
      { type: 'testimonials', preset: 'luxury-testimonials' },
      { type: 'contact', preset: 'luxury-contact' },
    ],
    globalSettings: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#D4AF37',
        accent: '#F7F7F7',
        text: '#2D2D2D',
        background: '#FFFFFF',
        border: '#E8E8E8',
        muted: '#666666',
      },
      typography: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: {
          base: '1.125rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
        },
      },
    },
    tags: ['luxury', 'premium', 'elegant', 'sophisticated'],
    premium: true,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // ====================
  // PAGE TYPE TEMPLATES
  // ====================

  'conversion-landing': {
    id: 'conversion-landing',
    name: 'High-Converting Landing',
    description: 'Conversion-optimized landing page',
    category: 'page-type',
    subcategory: 'landing',
    preview: '/templates/previews/conversion-landing.jpg',
    thumbnail: '/templates/thumbnails/conversion-landing.jpg',
    sections: [
      { type: 'hero', preset: 'conversion-hero' },
      { type: 'features', preset: 'benefit-features' },
      { type: 'stats', preset: 'social-proof' },
      { type: 'testimonials', preset: 'conversion-testimonials' },
      { type: 'pricing', preset: 'simple-pricing' },
      { type: 'faq', preset: 'conversion-faq' },
      { type: 'cta-block', preset: 'final-cta' },
    ],
    globalSettings: {
      colors: {
        primary: '#EF4444',
        secondary: '#DC2626',
        accent: '#FEF2F2',
        text: '#1F2937',
        background: '#FFFFFF',
        border: '#F3F4F6',
        muted: '#6B7280',
      },
    },
    tags: ['landing', 'conversion', 'marketing', 'sales'],
    premium: true,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  'corporate-about': {
    id: 'corporate-about',
    name: 'Corporate About Us',
    description: 'Professional company story and team page',
    category: 'page-type',
    subcategory: 'about',
    preview: '/templates/previews/corporate-about.jpg',
    thumbnail: '/templates/thumbnails/corporate-about.jpg',
    sections: [
      { type: 'hero', preset: 'company-hero' },
      { type: 'timeline', preset: 'company-history' },
      { type: 'stats', preset: 'company-stats' },
      { type: 'team', preset: 'leadership-team' },
      { type: 'logo-grid', preset: 'partners' },
      { type: 'cta-block', preset: 'contact-cta' },
    ],
    globalSettings: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#EBF4FF',
        text: '#1F2937',
        background: '#FFFFFF',
        border: '#E5E7EB',
        muted: '#6B7280',
      },
    },
    tags: ['corporate', 'about', 'professional', 'company'],
    premium: false,
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // ====================
  // SEASONAL TEMPLATES
  // ====================

  'christmas-sale': {
    id: 'christmas-sale',
    name: 'Christmas Holiday Sale',
    description: 'Festive Christmas promotion template',
    category: 'seasonal',
    subcategory: 'christmas',
    preview: '/templates/previews/christmas-sale.jpg',
    thumbnail: '/templates/thumbnails/christmas-sale.jpg',
    sections: [
      { type: 'hero', preset: 'christmas-hero' },
      { type: 'features', preset: 'holiday-features' },
      { type: 'pricing', preset: 'holiday-pricing' },
      { type: 'stats', preset: 'sale-countdown' },
      { type: 'cta-block', preset: 'holiday-cta' },
    ],
    globalSettings: {
      colors: {
        primary: '#DC2626',
        secondary: '#059669',
        accent: '#FEF3C7',
        text: '#1F2937',
        background: '#FFFEF7',
        border: '#FEE2E2',
        muted: '#78716C',
      },
    },
    tags: ['christmas', 'holiday', 'seasonal', 'sale'],
    premium: false,
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  'black-friday': {
    id: 'black-friday',
    name: 'Black Friday Deals',
    description: 'High-impact Black Friday sale template',
    category: 'seasonal',
    subcategory: 'blackfriday',
    preview: '/templates/previews/black-friday.jpg',
    thumbnail: '/templates/thumbnails/black-friday.jpg',
    sections: [
      { type: 'hero', preset: 'blackfriday-hero' },
      { type: 'stats', preset: 'countdown-timer' },
      { type: 'pricing', preset: 'sale-pricing' },
      { type: 'features', preset: 'deal-features' },
      { type: 'cta-block', preset: 'urgent-cta' },
    ],
    globalSettings: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#EF4444',
        text: '#FFFFFF',
        background: '#000000',
        border: '#374151',
        muted: '#9CA3AF',
      },
    },
    tags: ['black friday', 'sale', 'deals', 'urgent'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
};

// ====================
// TEMPLATE REGISTRY
// ====================

export const templateRegistry: TemplateRegistry = {
  categories: templateCategories,
  templates,
};

export default templateRegistry;