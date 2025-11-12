import React from 'react';

const HeroSection = ({ section, settings, isEditing, previewMode }) => {
  const {
    title = 'Welcome to Your Store',
    subtitle = 'Discover amazing products',
    buttonText = 'Shop Now',
    buttonLink = '#',
    backgroundImage = '',
    textColor = '#ffffff',
    backgroundColor = '#1f2937',
    textAlign = 'center'
  } = settings;

  const containerStyles = {
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: textColor,
    minHeight: previewMode === 'mobile' ? '400px' : '500px',
  };

  const overlayStyles = backgroundImage ? {
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  } : {};

  const getTextSize = () => {
    switch (previewMode) {
      case 'mobile':
        return {
          title: 'text-3xl',
          subtitle: 'text-lg',
          button: 'px-6 py-2 text-sm'
        };
      case 'tablet':
        return {
          title: 'text-4xl',
          subtitle: 'text-xl',
          button: 'px-8 py-3 text-base'
        };
      default:
        return {
          title: 'text-6xl',
          subtitle: 'text-xl',
          button: 'px-8 py-4 text-lg'
        };
    }
  };

  const textSizes = getTextSize();

  return (
    <section 
      className="relative flex items-center justify-center"
      style={containerStyles}
    >
      {/* Background overlay for better text readability */}
      {backgroundImage && (
        <div 
          className="absolute inset-0"
          style={overlayStyles}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div 
          className={`max-w-4xl mx-auto text-${textAlign}`}
        >
          {/* Title */}
          {title && (
            <h1 
              className={`${textSizes.title} font-bold mb-6 leading-tight`}
              style={{ color: textColor }}
            >
              {isEditing ? (
                <span className="inline-block border-b-2 border-dashed border-current pb-1">
                  {title}
                </span>
              ) : (
                title
              )}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p 
              className={`${textSizes.subtitle} mb-8 opacity-90`}
              style={{ color: textColor }}
            >
              {isEditing ? (
                <span className="inline-block border-b border-dashed border-current pb-1">
                  {subtitle}
                </span>
              ) : (
                subtitle
              )}
            </p>
          )}

          {/* CTA Button */}
          {buttonText && (
            <div className="flex justify-center">
              {isEditing ? (
                <div 
                  className={`${textSizes.button} bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer border-2 border-dashed border-gray-400`}
                >
                  {buttonText}
                </div>
              ) : (
                <a
                  href={buttonLink}
                  className={`${textSizes.button} bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block`}
                >
                  {buttonText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editing indicators */}
      {isEditing && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Hero Section
        </div>
      )}
    </section>
  );
};

export default HeroSection;