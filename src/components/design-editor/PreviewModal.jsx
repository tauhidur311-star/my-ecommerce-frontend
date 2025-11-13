import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Tablet, Smartphone, ExternalLink, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DraggableCanvas from './DraggableCanvas';
import EnhancedButton from '../ui/EnhancedButton';

const PreviewModal = ({ isOpen, onClose, sections, globalSettings }) => {
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const devices = [
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%', maxWidth: '1200px' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px', maxWidth: '768px' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px', maxWidth: '375px' }
  ];

  const getPreviewStyles = () => {
    const device = devices.find(d => d.id === previewDevice);
    return {
      width: device.width,
      maxWidth: device.maxWidth,
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: globalSettings?.layout?.backgroundColor || '#ffffff',
      fontFamily: globalSettings?.typography?.fontFamily || 'Inter, sans-serif',
      fontSize: globalSettings?.typography?.fontSize?.base || '16px',
      lineHeight: globalSettings?.typography?.lineHeight || 1.6,
      color: globalSettings?.colors?.text || '#1F2937'
    };
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Design Preview',
          text: 'Check out this design',
          url: window.location.href
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
              
              {/* Device Selector */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {devices.map((device) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setPreviewDevice(device.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        previewDevice === device.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{device.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </EnhancedButton>
              
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={() => window.open('/preview', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </EnhancedButton>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 overflow-auto bg-gray-100">
            <div className="min-h-full">
              {previewDevice !== 'desktop' && (
                <div className="text-center mb-4">
                  <div className="inline-block bg-white px-3 py-1 rounded-full text-sm text-gray-600 shadow-sm">
                    {devices.find(d => d.id === previewDevice)?.label} Preview ({devices.find(d => d.id === previewDevice)?.width})
                  </div>
                </div>
              )}
              
              <div style={getPreviewStyles()} className="bg-white shadow-lg rounded-lg overflow-hidden">
                {sections.length === 0 ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
                      <p>Add sections to see your design preview</p>
                    </div>
                  </div>
                ) : (
                  <DraggableCanvas
                    sections={sections}
                    previewMode={true}
                    onSelectSection={() => {}}
                    onUpdateSection={() => {}}
                    onDeleteSection={() => {}}
                    onDuplicateSection={() => {}}
                    onReorderSections={() => {}}
                    onAddSection={() => {}}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Preview Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Sections: {sections.length}</span>
                <span>Device: {devices.find(d => d.id === previewDevice)?.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Live Preview Mode</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreviewModal;