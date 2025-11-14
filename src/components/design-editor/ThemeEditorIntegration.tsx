/**
 * Theme Editor Integration Component
 * Shows how to integrate the enhanced theme editor into your existing app
 */

import React from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import EnhancedThemeEditor from '../../pages/design/EnhancedThemeEditor.tsx';

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
            <h1 className="text-3xl font-bold text-gray-900">Professional Theme Editor</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create stunning, professional themes with advanced features, 
            real-time collaboration, and enterprise-grade section types.
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-blue-900 mb-6 flex items-center justify-center">
              <Sparkles className="w-6 h-6 mr-3" />
              Design Editor Features
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Advanced section library</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Real-time collaboration</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Professional animations</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Industry templates</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Responsive design controls</li>
                </ul>
              </div>
              <div>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Export/import system</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Live cursor tracking</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> A/B testing ready</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Custom CSS injection</li>
                  <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Advanced styling options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Start Building?</h3>
          <p className="text-gray-600 mb-6">
            Jump into the enhanced editor and experience the difference with advanced features and smooth collaboration.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/design'}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Open Design Editor
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