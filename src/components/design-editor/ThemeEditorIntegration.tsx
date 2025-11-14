/**
 * Theme Editor Integration Component
 * Shows how to integrate the enhanced theme editor into your existing app
 */

import React from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import EnhancedThemeEditor from '../../pages/design/EnhancedThemeEditor';

interface ThemeEditorIntegrationProps {
  // Props for backward compatibility with your existing editor
  onSave?: (sections: any[]) => void;
  onExit?: () => void;
  initialSections?: any[];
  designId?: string;
}

const ThemeEditorIntegration: React.FC<ThemeEditorIntegrationProps> = ({
  onSave,
  onExit,
  initialSections = [],
  designId
}) => {
  const navigate = useNavigate();
  const params = useParams();

  // Handle backward navigation
  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Enhanced Theme Editor */}
      <EnhancedThemeEditor
        designId={designId || params.designId || 'theme-editor'}
        initialSections={initialSections}
      />
    </div>
  );
};

// Example usage component showing the upgrade from old to new editor
export const ThemeEditorUpgradeDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Theme Editor</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your existing theme editor has been upgraded with advanced features, 
            real-time collaboration, and professional section types.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Previous Editor</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Basic sections (header, hero, products)</li>
              <li>✓ Simple drag & drop</li>
              <li>✓ Device preview</li>
              <li>✓ Basic styling options</li>
              <li>✗ Limited section types</li>
              <li>✗ No collaboration</li>
              <li>✗ No animations</li>
              <li>✗ No templates</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Enhanced Editor
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>✓ All previous features</li>
              <li>✓ 8 advanced section types</li>
              <li>✓ Real-time collaboration</li>
              <li>✓ Professional animations</li>
              <li>✓ Industry templates</li>
              <li>✓ Advanced responsive controls</li>
              <li>✓ Export/import system</li>
              <li>✓ Live cursor tracking</li>
              <li>✓ A/B testing ready</li>
              <li>✓ Custom CSS injection</li>
            </ul>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Start Building?</h3>
          <p className="text-gray-600 mb-6">
            Jump into the enhanced editor and experience the difference with advanced features and smooth collaboration.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/design/enhanced'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Enhanced Editor
            </button>
            
            <button
              onClick={() => window.location.href = '/design/legacy'}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Use Legacy Editor
            </button>
          </div>
        </div>

        {/* Migration Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Seamless Migration</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  All your existing designs and sections are fully compatible with the enhanced editor. 
                  Your workflow remains the same, but now with powerful new capabilities at your fingertips.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Route configuration for integration
export const ThemeEditorRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Enhanced editor route */}
      <Route path="/design/enhanced/:designId?" element={<ThemeEditorIntegration />} />
      
      {/* Upgrade demo route */}
      <Route path="/design/upgrade" element={<ThemeEditorUpgradeDemo />} />
      
      {/* Backward compatibility - redirect old routes */}
      <Route path="/design/editor" element={<ThemeEditorIntegration />} />
      <Route path="/theme-editor" element={<ThemeEditorIntegration />} />
    </Routes>
  );
};

export default ThemeEditorIntegration;