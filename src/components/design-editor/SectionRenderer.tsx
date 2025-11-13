import React from 'react';

// Import all section components
import Footer from '../sections/FooterSection';
import FeaturedProduct from '../sections/FeaturedProduct';
import ProductGrid from '../sections/ProductGridSection';
import Testimonials from '../sections/TestimonialsSection';
import Newsletter from '../sections/NewsletterSection';
import ContactForm from '../sections/ContactFormSection';
import ImageGallery from '../sections/GallerySection';
import VideoBlock from '../sections/VideoBlock';
import HeroSection from '../sections/HeroSection';
import ImageTextSection from '../sections/ImageTextSection';

// Section type mapping
const SECTION_MAP = {
  'hero': HeroSection,
  'product-grid': ProductGrid,
  'featured-product': FeaturedProduct,
  'image-text': ImageTextSection,
  'testimonials': Testimonials,
  'newsletter': Newsletter,
  'contact-form': ContactForm,
  'image-gallery': ImageGallery,
  'video': VideoBlock,
  'footer': Footer
} as const;

interface SectionData {
  id: string;
  type: keyof typeof SECTION_MAP;
  settings?: Record<string, any>;
  styles?: Record<string, any>;
  visible?: boolean;
  responsive?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
}

interface SectionRendererProps {
  section: SectionData;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
    rating?: number;
    reviewCount?: number;
    category?: string;
    inStock?: boolean;
    createdAt?: string;
  }>;
  testimonials?: Array<{
    id: string;
    name: string;
    role?: string;
    company?: string;
    content: string;
    rating?: number;
    avatar?: string;
  }>;
  isSelected?: boolean;
  isEditing?: boolean;
  onSectionClick?: (sectionId: string) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<SectionData>) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddToCart?: (product: any) => void;
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onNewsletterSignup?: (email: string) => Promise<void>;
  onContactSubmit?: (data: any) => Promise<void>;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  products = [],
  testimonials = [],
  isSelected = false,
  isEditing = false,
  onSectionClick,
  onUpdateSection,
  onDeleteSection,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  onNewsletterSignup,
  onContactSubmit
}) => {
  // Get the appropriate component for this section type
  const SectionComponent = SECTION_MAP[section.type];

  if (!SectionComponent) {
    console.warn(`Unknown section type: ${section.type}`);
    return (
      <div className="p-8 border-2 border-dashed border-gray-300 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Unknown section type: {section.type}</p>
        <p className="text-sm text-gray-400 mt-2">ID: {section.id}</p>
      </div>
    );
  }

  // Check if section should be visible based on responsive settings
  const shouldShowSection = () => {
    if (!section.responsive) return section.visible !== false;
    
    // You could implement breakpoint detection here
    // For now, we'll show all sections in editing mode
    if (isEditing) return section.visible !== false;
    
    // In production, you'd check the current viewport
    return section.visible !== false;
  };

  if (!shouldShowSection()) {
    return null;
  }

  // Handle section click for editing
  const handleSectionClick = (e: React.MouseEvent) => {
    if (isEditing && onSectionClick) {
      e.stopPropagation();
      onSectionClick(section.id);
    }
  };

  // Prepare props based on section type
  const getSectionProps = () => {
    const baseProps = {
      settings: section.settings || {},
      styles: section.styles || {},
      isEditing
    };

    switch (section.type) {
      case 'product-grid':
      case 'featured-product':
        return {
          ...baseProps,
          products,
          onAddToCart,
          onQuickView,
          onAddToWishlist
        };
      
      case 'testimonials':
        return {
          ...baseProps,
          testimonials
        };
      
      case 'newsletter':
        return {
          ...baseProps,
          onSubscribe: onNewsletterSignup
        };
      
      case 'contact-form':
        return {
          ...baseProps,
          onSubmit: onContactSubmit
        };
      
      default:
        return baseProps;
    }
  };

  return (
    <div
      className={`relative ${isEditing ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={handleSectionClick}
      data-section-id={section.id}
      data-section-type={section.type}
    >
      {/* Section Selection Indicator */}
      {isEditing && isSelected && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
          <span>
            {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Section
          </span>
          {onDeleteSection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSection(section.id);
              }}
              className="text-white hover:text-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Section Hover Overlay */}
      {isEditing && !isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
      )}

      {/* Render the actual section component */}
      <SectionComponent {...getSectionProps()} />

      {/* Section Info Tooltip for Editing */}
      {isEditing && (
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
            {section.id}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility function to validate section data
export const validateSection = (section: any): section is SectionData => {
  if (!section || typeof section !== 'object') return false;
  if (!section.id || typeof section.id !== 'string') return false;
  if (!section.type || !(section.type in SECTION_MAP)) return false;
  return true;
};

// Utility function to get available section types
export const getAvailableSectionTypes = () => {
  return Object.keys(SECTION_MAP);
};

// Utility function to get section type display name
export const getSectionTypeDisplayName = (type: keyof typeof SECTION_MAP) => {
  const displayNames = {
    'hero': 'Hero Section',
    'product-grid': 'Product Grid',
    'featured-product': 'Featured Product',
    'image-text': 'Image & Text',
    'testimonials': 'Testimonials',
    'newsletter': 'Newsletter',
    'contact-form': 'Contact Form',
    'image-gallery': 'Image Gallery',
    'video': 'Video Block',
    'footer': 'Footer'
  };
  
  return displayNames[type] || type;
};

// Utility function to create a new section with default settings
export const createNewSection = (type: keyof typeof SECTION_MAP, id?: string): SectionData => {
  const defaultSettings = {
    'hero': {
      title: 'Welcome to Your Store',
      subtitle: 'Discover amazing products',
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    },
    'product-grid': {
      title: 'Our Products',
      subtitle: 'Discover our collection',
      productsToShow: 8,
      columns: 4,
      showPrices: true,
      showAddToCart: true
    },
    'featured-product': {
      title: 'Featured Product',
      subtitle: 'Check out our bestseller',
      showPrice: true,
      showAddToCart: true,
      showWishlist: true,
      showRating: true
    },
    'image-text': {
      title: 'About Us',
      content: 'Tell your story here...',
      imagePosition: 'left'
    },
    'testimonials': {
      title: 'What Our Customers Say',
      subtitle: 'Don\'t just take our word for it',
      layout: 'grid',
      showRating: true,
      showImages: true
    },
    'newsletter': {
      title: 'Stay in the Loop',
      subtitle: 'Subscribe to our newsletter',
      description: 'Get the latest updates on new products and exclusive offers.'
    },
    'contact-form': {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you',
      showMap: true,
      showContactInfo: true
    },
    'image-gallery': {
      title: 'Gallery',
      subtitle: 'Explore our collection',
      layout: 'grid',
      columns: 3,
      showLightbox: true,
      showCaptions: true
    },
    'video': {
      title: 'Watch Our Story',
      subtitle: 'Behind the scenes',
      controls: true,
      autoplay: false,
      muted: true
    },
    'footer': {
      companyName: 'Your Store',
      showSocialLinks: true,
      showNewsletter: true,
      showContactInfo: true,
      layout: 'detailed'
    }
  };

  return {
    id: id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    settings: defaultSettings[type] || {},
    styles: {},
    visible: true,
    responsive: {
      mobile: true,
      tablet: true,
      desktop: true
    }
  };
};

export default SectionRenderer;