import React, { useState, useEffect, useCallback } from 'react';
import SectionRenderer from './sections/SectionRenderer';
import SafeSectionRenderer from './SafeSectionRenderer';
import { publicAPI } from '../services/themeAPI.js';
import Navbar from './Navbar';

const DynamicStorefront = ({ pageType = 'home', slug = null }) => {
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seoData, setSeoData] = useState({});

  const loadPublishedLayout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('DynamicStorefront: Fetching published theme for:', pageType, slug);
      const data = await publicAPI.getPublishedTheme(pageType, slug);
      console.log('DynamicStorefront: Received data:', data);
      
      setLayout(data.layout);
      setSeoData(data.seo || {});
      
      // Update document title and meta tags
      if (data.seo?.title) {
        document.title = data.seo.title;
      }
      
      if (data.seo?.description) {
        updateMetaTag('description', data.seo.description);
      }
      
      if (data.seo?.keywords && Array.isArray(data.seo.keywords)) {
        updateMetaTag('keywords', data.seo.keywords.join(', '));
      }
      
    } catch (error) {
      console.error('Error loading published layout:', error);
      console.error('Full error details:', error.response?.data || error.message);
      setError('Failed to load page layout: ' + (error.response?.data?.message || error.message));
      
      // Load fallback layout
      setLayout(getFallbackLayout(pageType));
    } finally {
      setLoading(false);
    }
  }, [pageType, slug]);

  useEffect(() => {
    loadPublishedLayout();
  }, [loadPublishedLayout]);

  const updateMetaTag = (name, content) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }
    metaTag.content = content;
  };

  const getFallbackLayout = (pageType) => {
    const fallbacks = {
      home: {
        sections: [
          {
            id: 'fallback-hero',
            type: 'hero',
            settings: {
              title: 'Welcome to Our Store',
              subtitle: 'Discover amazing products at great prices',
              buttonText: 'Shop Now',
              buttonLink: '#products',
              backgroundColor: '#1f2937',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 }
            }
          },
          {
            id: 'fallback-products',
            type: 'product-grid',
            settings: {
              title: 'Featured Products',
              subtitle: 'Check out our best sellers',
              limit: 8,
              columns: 4,
              sort: 'featured',
              showTitle: true,
              padding: { top: 60, bottom: 60 }
            }
          }
        ]
      },
      about: {
        sections: [
          {
            id: 'fallback-about-hero',
            type: 'hero',
            settings: {
              title: 'About Us',
              subtitle: 'Learn more about our story',
              backgroundColor: '#f3f4f6',
              textColor: '#374151',
              padding: { top: 60, bottom: 60 }
            }
          },
          {
            id: 'fallback-about-content',
            type: 'image-text',
            settings: {
              title: 'Our Story',
              content: 'We are passionate about providing quality products and excellent service to our customers.',
              backgroundColor: '#ffffff',
              padding: { top: 60, bottom: 60 }
            }
          }
        ]
      },
      contact: {
        sections: [
          {
            id: 'fallback-contact-hero',
            type: 'hero',
            settings: {
              title: 'Contact Us',
              subtitle: 'Get in touch with us',
              backgroundColor: '#f3f4f6',
              textColor: '#374151',
              padding: { top: 60, bottom: 60 }
            }
          },
          {
            id: 'fallback-contact-form',
            type: 'contact-form',
            settings: {
              padding: { top: 60, bottom: 60 }
            }
          }
        ]
      }
    };

    return fallbacks[pageType] || { sections: [] };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error && !layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPublishedLayout}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!layout?.sections || !Array.isArray(layout.sections) || layout.sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Theme Preview Not Available</h2>
          <p className="text-gray-600">The theme system is still being configured.</p>
          <a 
            href="/" 
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Main Store
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-storefront">
      {/* Include Navbar for store pages */}
      <Navbar />
      
      {/* Render theme sections with safe renderer */}
      {layout?.sections && Array.isArray(layout.sections) ? (
        layout.sections.map((section, index) => (
          <SafeSectionRenderer
            key={section.id || `section-${index}`}
            section={section}
          />
        ))
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Sections Found</h2>
            <p className="text-gray-600 mb-4">The published theme has no sections to display.</p>
            <pre className="text-xs bg-gray-100 p-4 rounded mt-4 text-left">
              {JSON.stringify(layout, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicStorefront;