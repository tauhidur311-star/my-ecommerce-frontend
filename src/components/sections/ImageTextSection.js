import React from 'react';

const ImageTextSection = ({ section, settings, isEditing, previewMode }) => {
  const {
    title = 'About Our Story',
    content = 'Tell your story here with compelling content that engages your audience.',
    image = '',
    imagePosition = 'left',
    buttonText = '',
    buttonLink = '#',
    backgroundColor = '#ffffff'
  } = settings;

  const isImageLeft = imagePosition === 'left';
  const hasButton = buttonText && buttonText.trim();

  const getLayoutClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'flex-col';
      case 'tablet':
        return 'flex-col lg:flex-row';
      default:
        return 'flex-row';
    }
  };

  const getImageClasses = () => {
    if (previewMode === 'mobile') return 'w-full mb-8';
    return `w-full lg:w-1/2 ${isImageLeft ? 'lg:pr-8' : 'lg:pl-8'} ${isImageLeft ? '' : 'lg:order-2'}`;
  };

  const getContentClasses = () => {
    if (previewMode === 'mobile') return 'w-full';
    return `w-full lg:w-1/2 ${isImageLeft ? 'lg:pl-8' : 'lg:pr-8'} ${isImageLeft ? '' : 'lg:order-1'}`;
  };

  return (
    <section 
      className="py-16"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center ${getLayoutClasses()}`}>
          {/* Image */}
          <div className={getImageClasses()}>
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
                {isEditing && (
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center bg-blue-50 bg-opacity-50">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                      Image Placeholder
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? 'Add an image' : 'Image not available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={getContentClasses()}>
            <div className="max-w-xl">
              {/* Title */}
              {title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {isEditing ? (
                    <span className="border-b-2 border-dashed border-gray-400">
                      {title}
                    </span>
                  ) : (
                    title
                  )}
                </h2>
              )}

              {/* Content */}
              {content && (
                <div className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {isEditing ? (
                    <div className="border border-dashed border-gray-400 p-4 rounded">
                      {content.split('\n').map((paragraph, index) => (
                        <p key={index} className={index > 0 ? 'mt-4' : ''}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    content.split('\n').map((paragraph, index) => (
                      <p key={index} className={index > 0 ? 'mt-4' : ''}>
                        {paragraph}
                      </p>
                    ))
                  )}
                </div>
              )}

              {/* Button */}
              {hasButton && (
                <div>
                  {isEditing ? (
                    <div className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium border-2 border-dashed border-blue-400">
                      {buttonText}
                    </div>
                  ) : (
                    <a
                      href={buttonLink}
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {buttonText}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editing indicators */}
      {isEditing && (
        <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Image + Text Section
        </div>
      )}
    </section>
  );
};

export default ImageTextSection;