import React from 'react';

const CustomHTMLSection = ({ section, settings, isEditing }) => {
  const {
    html = '<div class="prose max-w-none"><p>Custom HTML content goes here</p></div>'
  } = settings;

  if (isEditing) {
    return (
      <section className="py-8 relative">
        <div className="container mx-auto px-4">
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 bg-gray-50">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700">Custom HTML Section</h3>
              <p className="text-sm text-gray-500">Edit this section to add your custom HTML content</p>
            </div>
            
            {/* Preview of HTML content */}
            <div className="bg-white border rounded p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {html.slice(0, 200)}
                {html.length > 200 && '...'}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Custom HTML Section
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div 
          dangerouslySetInnerHTML={{ __html: html }}
          className="prose prose-lg max-w-none"
        />
      </div>
    </section>
  );
};

export default CustomHTMLSection;