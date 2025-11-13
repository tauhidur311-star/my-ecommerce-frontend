import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Move, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ImageGallerySection = ({ settings, onOpenAssetPicker, isEditing = false, onUpdateSection }) => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  const defaultSettings = {
    title: 'Our Gallery',
    subtitle: '',
    images: [],
    imagesPerRow: 3,
    showLightbox: true,
    spacing: 'normal',
    aspectRatio: 'square',
    borderRadius: 8,
    showTitles: false
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  const updateSettings = (newSettings) => {
    if (onUpdateSection) {
      onUpdateSection({ ...mergedSettings, ...newSettings });
    }
  };

  const addImage = () => {
    if (onOpenAssetPicker) {
      onOpenAssetPicker((asset) => {
        const newImage = {
          id: Date.now(),
          url: asset.url || asset,
          title: asset.title || '',
          alt: asset.alt || 'Gallery image'
        };
        
        updateSettings({
          images: [...mergedSettings.images, newImage]
        });
      });
    }
  };

  const removeImage = (imageId) => {
    updateSettings({
      images: mergedSettings.images.filter(img => img.id !== imageId)
    });
  };

  const updateImage = (imageId, updates) => {
    updateSettings({
      images: mergedSettings.images.map(img => 
        img.id === imageId ? { ...img, ...updates } : img
      )
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(mergedSettings.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateSettings({ images: items });
  };

  const getGridClasses = () => {
    const imagesPerRow = mergedSettings.imagesPerRow;
    const spacing = mergedSettings.spacing;
    
    let gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (imagesPerRow === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
    if (imagesPerRow === 4) gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    if (imagesPerRow === 5) gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';

    let gap = 'gap-4';
    if (spacing === 'tight') gap = 'gap-2';
    if (spacing === 'loose') gap = 'gap-8';

    return `grid ${gridCols} ${gap}`;
  };

  const getAspectRatio = () => {
    switch (mergedSettings.aspectRatio) {
      case 'landscape': return 'aspect-[4/3]';
      case 'portrait': return 'aspect-[3/4]';
      case 'square': return 'aspect-square';
      default: return 'aspect-auto';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {mergedSettings.title}
          </h2>
          {mergedSettings.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {mergedSettings.subtitle}
            </p>
          )}

          {isEditing && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </button>
            </div>
          )}
        </div>

        {/* Gallery */}
        {mergedSettings.images.length === 0 && isEditing ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-4">No Images in Gallery</h3>
            <button
              onClick={addImage}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Your First Image
            </button>
          </div>
        ) : mergedSettings.images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Gallery coming soon...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="gallery" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={getGridClasses()}
                >
                  {mergedSettings.images.map((image, index) => (
                    <Draggable 
                      key={image.id} 
                      draggableId={image.id.toString()} 
                      index={index}
                      isDragDisabled={!isEditing}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative group ${snapshot.isDragging ? 'z-10' : ''}`}
                          onMouseEnter={() => setHoveredImage(image.id)}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`${getAspectRatio()} relative overflow-hidden bg-gray-100`}
                            style={{ borderRadius: `${mergedSettings.borderRadius}px` }}
                          >
                            <img
                              src={image.url}
                              alt={image.alt || image.title || 'Gallery image'}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                              onClick={() => {
                                if (mergedSettings.showLightbox && !isEditing) {
                                  setLightboxImage(image);
                                }
                              }}
                            />

                            {/* Image Title Overlay */}
                            {mergedSettings.showTitles && image.title && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <h3 className="text-white font-semibold text-sm">
                                  {image.title}
                                </h3>
                              </div>
                            )}

                            {/* Editing Controls */}
                            {isEditing && (
                              <>
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 left-2 p-1 bg-black/50 text-white rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Move className="w-4 h-4" />
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      const newTitle = prompt('Enter image title:', image.title || '');
                                      if (newTitle !== null) {
                                        updateImage(image.id, { title: newTitle });
                                      }
                                    }}
                                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    title="Edit Title"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeImage(image.id)}
                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    title="Delete Image"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt || lightboxImage.title || 'Gallery image'}
                className="max-w-full max-h-full object-contain"
              />
              
              {lightboxImage.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-lg font-semibold">
                    {lightboxImage.title}
                  </h3>
                </div>
              )}

              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImageGallerySection;