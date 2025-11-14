/**
 * Page Builder Utility Functions
 * Helper functions for the advanced page builder system
 */

import { z } from 'zod';
import type { 
  SectionBase, 
  PageBuilderTheme, 
  ResponsiveSettings,
  DevicePreview,
  ExportOptions,
  ImportResult
} from '../types/pageBuilder';
import { SectionSchemas, validateSection } from '../schemas/sectionSchemas';

// ====================
// SECTION UTILITIES
// ====================

export const createDefaultSection = (type: string): Partial<SectionBase> => {
  const baseSection = {
    type,
    name: `${type.charAt(0).toUpperCase()}${type.slice(1)} Section`,
    settings: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      padding: {
        desktop: { top: 80, bottom: 80, left: 20, right: 20 },
        tablet: { top: 60, bottom: 60, left: 16, right: 16 },
        mobile: { top: 40, bottom: 40, left: 16, right: 16 },
      } as ResponsiveSettings<any>,
      visibility: {
        desktop: true,
        tablet: true,
        mobile: true,
      },
    },
    presets: [],
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Add default content based on section type
  switch (type) {
    case 'video':
      return {
        ...baseSection,
        content: {
          title: 'Video Section',
          videoType: 'youtube',
          autoplay: false,
          loop: false,
          muted: false,
          controls: true,
          aspectRatio: '16:9',
        },
      };
    
    case 'pricing':
      return {
        ...baseSection,
        content: {
          title: 'Pricing Plans',
          plans: [],
          layout: 'grid',
          columns: { desktop: 3, tablet: 2, mobile: 1 },
        },
      };
    
    case 'faq':
      return {
        ...baseSection,
        content: {
          title: 'Frequently Asked Questions',
          faqs: [],
          layout: 'accordion',
          searchable: true,
        },
      };
    
    case 'team':
      return {
        ...baseSection,
        content: {
          title: 'Our Team',
          members: [],
          layout: 'grid',
          columns: { desktop: 3, tablet: 2, mobile: 1 },
        },
      };
    
    case 'stats':
      return {
        ...baseSection,
        content: {
          title: 'Our Impact',
          stats: [],
          layout: 'horizontal',
          animateOnScroll: true,
          duration: 2000,
        },
      };
    
    case 'timeline':
      return {
        ...baseSection,
        content: {
          title: 'Timeline',
          items: [],
          layout: 'vertical',
          alternating: true,
        },
      };
    
    default:
      return baseSection;
  }
};

// ====================
// VALIDATION UTILITIES
// ====================

export const validateSectionData = (section: any): { isValid: boolean; errors: string[] } => {
  try {
    if (!section.type) {
      return { isValid: false, errors: ['Section type is required'] };
    }

    validateSection(section.type, section);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { isValid: false, errors: [(error as Error).message] };
  }
};

export const sanitizeContent = (content: any): any => {
  if (typeof content !== 'object' || content === null) {
    return content;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === 'string') {
      // Basic HTML sanitization
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeContent(item));
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeContent(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// ====================
// RESPONSIVE UTILITIES
// ====================

export const getResponsiveValue = <T>(
  responsive: ResponsiveSettings<T> | T,
  device: 'desktop' | 'tablet' | 'mobile'
): T => {
  if (!responsive || typeof responsive !== 'object') {
    return responsive as T;
  }

  const responsiveSettings = responsive as ResponsiveSettings<T>;
  
  // Return device-specific value or fallback to desktop
  return responsiveSettings[device] || responsiveSettings.desktop || responsiveSettings as T;
};

export const createResponsiveSettings = <T>(value: T): ResponsiveSettings<T> => ({
  desktop: value,
  tablet: value,
  mobile: value,
});

export const mergeResponsiveSettings = <T>(
  base: ResponsiveSettings<T>,
  overrides: Partial<ResponsiveSettings<T>>
): ResponsiveSettings<T> => ({
  desktop: overrides.desktop || base.desktop,
  tablet: overrides.tablet || base.tablet,
  mobile: overrides.mobile || base.mobile,
});

// ====================
// THEME UTILITIES
// ====================

export const generateCSSVariables = (theme: PageBuilderTheme): string => {
  const variables: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables.push(`--color-${key}: ${value};`);
  });

  // Typography
  variables.push(`--font-family: ${theme.typography.fontFamily};`);
  variables.push(`--line-height: ${theme.typography.lineHeight};`);
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables.push(`--font-size-${key}: ${value};`);
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    variables.push(`--font-weight-${key}: ${value};`);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables.push(`--spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables.push(`--border-radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    variables.push(`--shadow-${key}: ${value};`);
  });

  return `:root {\n  ${variables.join('\n  ')}\n}`;
};

export const applyThemeToElement = (element: HTMLElement, theme: PageBuilderTheme): void => {
  const cssVariables = generateCSSVariables(theme);
  const styleElement = document.createElement('style');
  styleElement.textContent = cssVariables;
  
  // Remove existing theme styles
  const existingStyle = document.querySelector('[data-theme-variables]');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  styleElement.setAttribute('data-theme-variables', 'true');
  document.head.appendChild(styleElement);
};

// ====================
// EXPORT/IMPORT UTILITIES
// ====================

export const generateStaticHTML = (
  sections: SectionBase[],
  theme: PageBuilderTheme,
  options: ExportOptions
): string => {
  const cssVariables = generateCSSVariables(theme);
  
  const sectionsHTML = sections
    .filter(section => section.settings.visibility?.desktop !== false)
    .map(section => {
      const padding = getResponsiveValue(section.settings.padding, 'desktop');
      const styles = [
        `background-color: ${section.settings.backgroundColor || 'transparent'}`,
        `color: ${section.settings.textColor || 'inherit'}`,
        padding ? `padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : '',
        section.settings.customCSS || '',
      ].filter(Boolean).join('; ');

      return `
        <section 
          data-section-type="${section.type}" 
          data-section-id="${section.id}"
          style="${styles}"
        >
          <!-- ${section.name} -->
          <div class="section-content">
            ${generateSectionHTML(section)}
          </div>
        </section>
      `;
    })
    .join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.metadata.title}</title>
      <meta name="description" content="${options.metadata.description}">
      <style>
        ${cssVariables}
        
        body {
          margin: 0;
          padding: 0;
          font-family: var(--font-family);
          line-height: var(--line-height);
          color: var(--color-text);
          background-color: var(--color-background);
        }
        
        .section-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .section-content {
            padding: 0 1rem;
          }
        }
        
        /* Animation styles */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
      </style>
    </head>
    <body>
      ${sectionsHTML}
      
      <script>
        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
            }
          });
        });
        
        document.querySelectorAll('section').forEach(section => {
          observer.observe(section);
        });
      </script>
    </body>
    </html>
  `;
};

const generateSectionHTML = (section: SectionBase): string => {
  // This is a simplified version - in reality, you'd want to generate
  // proper HTML for each section type based on its content
  switch (section.type) {
    case 'video':
      return `
        <div class="video-section">
          <h2>${section.content.title}</h2>
          ${section.content.subtitle ? `<p>${section.content.subtitle}</p>` : ''}
          ${section.content.videoUrl ? `<video src="${section.content.videoUrl}" controls></video>` : ''}
        </div>
      `;
    
    case 'pricing':
      return `
        <div class="pricing-section">
          <h2>${section.content.title}</h2>
          <div class="pricing-grid">
            ${section.content.plans?.map((plan: any) => `
              <div class="pricing-card">
                <h3>${plan.name}</h3>
                <p>${plan.description}</p>
                <div class="price">${plan.price === 0 ? 'Free' : `$${plan.price}`}</div>
                <ul>
                  ${plan.features?.map((feature: string) => `<li>${feature}</li>`).join('') || ''}
                </ul>
                <a href="${plan.ctaUrl}" class="cta-button">${plan.ctaText}</a>
              </div>
            `).join('') || ''}
          </div>
        </div>
      `;
    
    default:
      return `
        <div class="section-${section.type}">
          <h2>${section.content.title || section.name}</h2>
          <pre>${JSON.stringify(section.content, null, 2)}</pre>
        </div>
      `;
  }
};

// ====================
// DEVICE UTILITIES
// ====================

export const getDeviceBreakpoint = (device: DevicePreview): string => {
  switch (device.category) {
    case 'mobile':
      return `(max-width: ${device.width}px)`;
    case 'tablet':
      return `(min-width: ${device.width}px) and (max-width: 1023px)`;
    case 'desktop':
      return `(min-width: 1024px)`;
    default:
      return '';
  }
};

export const getCurrentDevice = (width: number): 'desktop' | 'tablet' | 'mobile' => {
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
};

// ====================
// PERFORMANCE UTILITIES
// ====================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ====================
// LOCAL STORAGE UTILITIES
// ====================

export const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export default {
  createDefaultSection,
  validateSectionData,
  sanitizeContent,
  getResponsiveValue,
  createResponsiveSettings,
  mergeResponsiveSettings,
  generateCSSVariables,
  applyThemeToElement,
  generateStaticHTML,
  getDeviceBreakpoint,
  getCurrentDevice,
  debounce,
  throttle,
  saveToLocalStorage,
  loadFromLocalStorage,
};