import React from 'react';
import HeroSection from './HeroSection';
import ProductGridSection from './ProductGridSection';
import ImageTextSection from './ImageTextSection';
import TestimonialsSection from './TestimonialsSection';
import FooterSection from './FooterSection';
import CustomHTMLSection from './CustomHTMLSection';
import GallerySection from './GallerySection';
import NewsletterSection from './NewsletterSection';
import ContactFormSection from './ContactFormSection';

const SECTION_MAP = {
  hero: HeroSection,
  'product-grid': ProductGridSection,
  'featured-product': ProductGridSection,
  'image-text': ImageTextSection,
  testimonials: TestimonialsSection,
  footer: FooterSection,
  html: CustomHTMLSection,
  gallery: GallerySection,
  newsletter: NewsletterSection,
  'contact-form': ContactFormSection,
  video: CustomHTMLSection, // Can be handled as HTML for now
};

const SectionRenderer = ({ 
  section, 
  onUpdate, 
  onOpenAssetPicker, 
  isEditing = false, 
  previewMode = 'desktop' 
}) => {
  const SectionComponent = SECTION_MAP[section.type];

  if (!SectionComponent) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg m-4">
        <div className="text-center">
          <h3 className="text-red-800 font-medium">Unknown Section Type</h3>
          <p className="text-red-600 text-sm mt-1">
            Section type "{section.type}" is not supported yet.
          </p>
        </div>
      </div>
    );
  }

  // Apply responsive classes based on preview mode
  const getResponsiveClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'text-sm';
      case 'tablet':
        return 'text-base';
      default:
        return '';
    }
  };

  // Apply section-level styling
  const sectionStyles = {
    backgroundColor: section.settings?.backgroundColor || 'transparent',
    color: section.settings?.textColor || 'inherit',
    paddingTop: `${section.settings?.padding?.top || 0}px`,
    paddingBottom: `${section.settings?.padding?.bottom || 0}px`,
  };

  return (
    <div 
      className={`section-wrapper ${getResponsiveClasses()}`}
      style={sectionStyles}
    >
      <SectionComponent
        section={section}
        settings={section.settings || {}}
        onUpdate={onUpdate}
        onOpenAssetPicker={onOpenAssetPicker}
        isEditing={isEditing}
        previewMode={previewMode}
      />
    </div>
  );
};

export default SectionRenderer;