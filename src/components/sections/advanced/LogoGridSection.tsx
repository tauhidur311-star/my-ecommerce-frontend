/**
 * Logo Grid Section Component
 * Displays partner/client logos with adjustable grid and hover effects
 */

import React, { useState } from 'react';
import { Upload, Link2, Grid3x3, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogoGridSectionContent } from '../../../types/pageBuilder';

interface LogoGridSectionProps {
  content: LogoGridSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<LogoGridSectionContent>) => void;
}

const LogoGridSection: React.FC<LogoGridSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const getGridColumns = (device: 'desktop' | 'tablet' | 'mobile') => {
    const cols = content.columns[device];
    return `repeat(${Math.min(cols, content.logos.length || 1)}, minmax(0, 1fr))`;
  };

  const getHoverEffect = (logo: typeof content.logos[0], isHovered: boolean) => {
    if (!isHovered) return {};
    
    switch (content.hoverEffect) {
      case 'scale':
        return { transform: 'scale(1.1)' };
      case 'brightness':
        return { filter: 'brightness(1.2)' };
      case 'color':
        return { filter: 'grayscale(0%)' };
      default:
        return {};
    }
  };

  const handleLogoClick = (logo: typeof content.logos[0]) => {
    if (isEditing) return;
    if (logo.url) {
      window.open(logo.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newLogo = {
          id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          image: imageUrl,
          url: '',
        };

        onContentChange?.({
          logos: [...content.logos, newLogo],
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const handleAddLogoUrl = () => {
    const imageUrl = prompt('Enter logo image URL:');
    const logoUrl = prompt('Enter website URL (optional):');
    const name = prompt('Enter company name:');

    if (imageUrl && name) {
      const newLogo = {
        id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        image: imageUrl.trim(),
        url: logoUrl?.trim() || '',
      };

      onContentChange?.({
        logos: [...content.logos, newLogo],
      });
    }
  };

  const removeLogo = (logoId: string) => {
    onContentChange?.({
      logos: content.logos.filter(logo => logo.id !== logoId),
    });
  };

  const renderEditingTools = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
    >
      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
        <Grid3x3 className="w-4 h-4 mr-2" />
        Logo Management
      </h4>
      
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Upload className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Upload Images</span>
        </label>

        <button
          onClick={handleAddLogoUrl}
          className="flex items-center px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Link2 className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Add URL</span>
        </button>

        <div className="flex items-center space-x-4 ml-auto">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={content.grayscale}
              onChange={(e) => onContentChange?.({ grayscale: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Grayscale</span>
          </label>

          <select
            value={content.hoverEffect}
            onChange={(e) => onContentChange?.({ 
              hoverEffect: e.target.value as typeof content.hoverEffect 
            })}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="none">No Effect</option>
            <option value="scale">Scale</option>
            <option value="brightness">Brightness</option>
            <option value="color">Color</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderLogo = (logo: typeof content.logos[0], index: number) => (
    <motion.div
      key={logo.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={content.hoverEffect !== 'none' ? { y: -2 } : {}}
      className={`
        group relative overflow-hidden rounded-lg transition-all duration-300
        ${logo.url && !isEditing ? 'cursor-pointer' : ''}
        ${isEditing ? 'ring-2 ring-transparent hover:ring-blue-300' : ''}
      `}
      onClick={() => handleLogoClick(logo)}
    >
      {/* Logo Image */}
      <div className="relative aspect-[3/2] bg-gray-50 flex items-center justify-center p-4">
        {logo.image ? (
          <motion.img
            src={logo.image}
            alt={logo.name}
            className={`
              max-w-full max-h-full object-contain transition-all duration-300
              ${content.grayscale ? 'grayscale group-hover:grayscale-0' : ''}
            `}
            style={getHoverEffect(logo, false)}
            whileHover={getHoverEffect(logo, true)}
            onError={(e) => {
              console.error('Logo failed to load:', logo.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Hover Overlay */}
        {(logo.url || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"
          />
        )}

        {/* External Link Indicator */}
        {logo.url && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm"
          >
            <Link2 className="w-3 h-3 text-gray-600" />
          </motion.div>
        )}

        {/* Edit Controls */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewLogo(logo.image);
              }}
              className="p-1 bg-white rounded text-gray-600 hover:text-blue-600"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLogo(logo.id);
              }}
              className="p-1 bg-white rounded text-gray-600 hover:text-red-600"
              title="Remove"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Logo Name */}
      <div className="p-3 bg-white">
        <div className="text-sm font-medium text-gray-900 text-center truncate">
          {logo.name}
        </div>
        {logo.url && (
          <div className="text-xs text-gray-500 text-center mt-1">
            Click to visit
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Grid3x3 className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {content.title || 'Logo Grid Section'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {isEditing 
          ? 'Add company logos to showcase your partnerships and build trust with visitors.'
          : 'No logos to display yet.'
        }
      </p>
      {isEditing && (
        <div className="flex justify-center space-x-4">
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-4 h-4 mr-2" />
            Upload Logos
          </label>
          <button
            onClick={handleAddLogoUrl}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Add URL
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Editing Tools */}
      {isEditing && content.logos.length > 0 && renderEditingTools()}

      {/* Section Header */}
      {(content.title || content.subtitle) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {content.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </motion.div>
      )}

      {/* Logo Grid */}
      {content.logos.length > 0 ? (
        <div 
          className="grid gap-6 md:gap-8"
          style={{
            gridTemplateColumns: `
              ${window.innerWidth >= 1024 ? getGridColumns('desktop') :
                window.innerWidth >= 768 ? getGridColumns('tablet') :
                getGridColumns('mobile')
              }
            `
          }}
        >
          <AnimatePresence mode="popLayout">
            {content.logos.map((logo, index) => renderLogo(logo, index))}
          </AnimatePresence>
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Additional Info */}
      {content.logos.length > 0 && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600">
            {content.logos.length} trusted partner{content.logos.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLogo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewLogo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewLogo}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain bg-white rounded-lg"
              />
              <button
                onClick={() => setPreviewLogo(null)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoGridSection;