import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Layout } from 'lucide-react';

const DropZone = ({ index, onAddSection, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { isOver, setNodeRef } = useDroppable({
    id: `dropzone-${index || 'main'}`,
    data: {
      type: 'drop-zone',
      index
    }
  });

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        className={`relative transition-all duration-200 ${
          isOver ? 'h-16' : 'h-4'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {(isOver || isHovered) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-full border-2 border-dashed rounded-lg transition-all ${
              isOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center justify-center py-2 text-sm text-gray-600">
                <Plus className="w-4 h-4 mr-1" />
                Drop section here
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${
        isOver 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
          isOver 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <Layout className="w-8 h-8" />
        </div>
        
        <h3 className={`text-lg font-medium mb-2 transition-colors ${
          isOver ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {isOver ? 'Drop to Add Section' : 'Start Building Your Page'}
        </h3>
        
        <p className={`mb-4 transition-colors ${
          isOver ? 'text-blue-600' : 'text-gray-500'
        }`}>
          {isOver 
            ? 'Release to add the section here'
            : 'Drag sections from the sidebar to begin designing your page'
          }
        </p>
        
        {!isOver && (
          <div className="text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-4">
              <span>• Drag & drop sections</span>
              <span>• Customize content</span>
              <span>• Preview changes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;