// Redirect to new enhanced design editor
import EnhancedDesignEditor from './EnhancedDesignEditor';

// Export the enhanced version as default
export default EnhancedDesignEditor;

// Keep the old component for reference but redirect to new one
import React from 'react';

const DesignEditor = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sections, setSections] = useState([]);

  const goBack = () => {
    window.history.back();
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const sidebarItems = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'components', label: 'Components', icon: Plus },
    { id: 'styling', label: 'Styling', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'media', label: 'Media', icon: Image },
  ];

  const availableSections = [
    { id: 'hero', name: 'Hero Section', description: 'Large banner with call-to-action' },
    { id: 'features', name: 'Features', description: 'Showcase product features' },
    { id: 'gallery', name: 'Image Gallery', description: 'Display product images' },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews and feedback' },
    { id: 'contact', name: 'Contact Form', description: 'Contact information and form' },
    { id: 'newsletter', name: 'Newsletter', description: 'Email subscription form' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={goBack}
            >
              <ArrowLeft size={16} />
              Back to Admin
            </EnhancedButton>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">Design Editor</h1>
              <p className="text-sm text-gray-600">Customize your store's appearance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={togglePreview}
            >
              <Eye size={16} />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </EnhancedButton>
            
            <EnhancedButton
              variant="primary"
              size="sm"
            >
              <Save size={16} />
              Save Changes
            </EnhancedButton>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Tools</h2>
              
              <nav className="space-y-2 mb-6">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Available Sections</h3>
                <div className="space-y-2">
                  {availableSections.map((section) => (
                    <motion.div
                      key={section.id}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1">
          <div className="p-6">
            {isPreviewMode ? (
              <div className="bg-white rounded-lg shadow-lg min-h-96">
                <div className="p-8 text-center">
                  <Eye className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Preview Mode</h3>
                  <p className="text-gray-600">
                    Your store's design will be previewed here as customers will see it.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg min-h-96">
                <div className="p-8 text-center">
                  <Layout className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Design Canvas</h3>
                  <p className="text-gray-600 mb-6">
                    Drag and drop sections from the sidebar to start building your store design.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {availableSections.slice(0, 6).map((section) => (
                      <motion.div
                        key={section.id}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                        <h4 className="font-medium text-gray-900 text-sm">{section.name}</h4>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {!isPreviewMode && selectedComponent && (
          <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    defaultValue="#ffffff"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="20"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    defaultValue="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignEditor;