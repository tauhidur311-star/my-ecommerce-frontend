import React from 'react';

const SafeSectionRenderer = ({ section }) => {
  try {
    // Only render hero sections safely for now
    if (section.type === 'hero') {
      const settings = section.settings || {};
      const {
        title = 'Title',
        subtitle = 'Subtitle',
        buttonText = 'Button',
        backgroundColor = '#1f2937',
        textColor = '#ffffff'
      } = settings;

      return (
        <section 
          className="py-20 px-4 text-center min-h-96"
          style={{ 
            backgroundColor,
            color: textColor 
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl mb-8">{subtitle}</p>
            {buttonText && (
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold">
                {buttonText}
              </button>
            )}
          </div>
        </section>
      );
    }

    // For other section types, show placeholder
    return (
      <div className="py-8 px-4 bg-gray-100 border-2 border-dashed border-gray-300 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Section
        </h3>
        <p className="text-sm text-gray-500">Section loaded successfully</p>
        <pre className="text-xs bg-white p-2 rounded mt-2 max-w-md mx-auto overflow-auto">
          {JSON.stringify(section, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    console.error('Error rendering section:', section, error);
    return (
      <div className="py-4 px-4 bg-red-50 border border-red-200 text-center">
        <h3 className="text-red-800 font-medium">Section Render Error</h3>
        <p className="text-red-600 text-sm">
          Type: {section?.type || 'unknown'} | Error: {error.message}
        </p>
      </div>
    );
  }
};

export default SafeSectionRenderer;