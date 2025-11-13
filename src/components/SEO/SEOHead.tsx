import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    name: string;
    price: number;
    currency: string;
    availability: string;
    condition: string;
    brand?: string;
    category?: string;
    sku?: string;
    rating?: number;
    reviewCount?: number;
  };
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  noIndex?: boolean;
  canonical?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'StyleShop - Premium Fashion & Lifestyle Store',
  description = 'Discover premium fashion, accessories, and lifestyle products at StyleShop. Fast delivery, quality guaranteed.',
  keywords = ['fashion', 'shopping', 'ecommerce', 'style', 'clothing', 'accessories'],
  image = '/logo512.png',
  url = window.location.href,
  type = 'website',
  product,
  breadcrumbs = [],
  noIndex = false,
  canonical
}) => {
  const siteName = 'StyleShop';
  const baseUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  
  // Ensure URLs are absolute
  const absoluteUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const absoluteImage = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const canonicalUrl = canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : absoluteUrl;

  // Generate structured data for products
  const generateProductStructuredData = () => {
    if (!product) return null;

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": absoluteImage,
      "description": description,
      "brand": {
        "@type": "Brand",
        "name": product.brand || siteName
      },
      "offers": {
        "@type": "Offer",
        "url": absoluteUrl,
        "priceCurrency": product.currency,
        "price": product.price,
        "availability": `https://schema.org/${product.availability}`,
        "itemCondition": `https://schema.org/${product.condition}`,
        "seller": {
          "@type": "Organization",
          "name": siteName
        }
      }
    };

    if (product.sku) {
      structuredData.sku = product.sku;
    }

    if (product.category) {
      structuredData.category = product.category;
    }

    if (product.rating && product.reviewCount) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      };
    }

    return structuredData;
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = () => {
    if (breadcrumbs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
      }))
    };
  };

  // Generate organization structured data
  const generateOrganizationStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": baseUrl,
    "logo": `${baseUrl}/logo512.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880-XXX-XXXX",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://facebook.com/styleshop",
      "https://instagram.com/styleshop",
      "https://twitter.com/styleshop"
    ]
  });

  const structuredDataArray = [generateOrganizationStructuredData()];
  
  const productStructuredData = generateProductStructuredData();
  if (productStructuredData) {
    structuredDataArray.push(productStructuredData);
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData();
  if (breadcrumbStructuredData) {
    structuredDataArray.push(breadcrumbStructuredData);
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={absoluteUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content={product.currency} />
          <meta property="product:availability" content={product.availability} />
          <meta property="product:condition" content={product.condition} />
          {product.brand && <meta property="product:brand" content={product.brand} />}
          {product.category && <meta property="product:category" content={product.category} />}
        </>
      )}

      {/* Additional Meta Tags for E-commerce */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Prefetch DNS for external resources */}
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

      {/* Structured Data */}
      {structuredDataArray.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data)
          }}
        />
      ))}

      {/* Additional performance hints */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

      {/* Language and locale */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta property="og:locale" content="en_US" />

      {/* Cache control for static assets */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
    </Helmet>
  );
};

export default SEOHead;