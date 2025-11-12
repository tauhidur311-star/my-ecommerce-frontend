import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionRenderer from '../sections/SectionRenderer';
import { GripVertical, Settings, Trash2, Eye, EyeOff } from 'lucide-react';

const SortableSection = ({ 
  section, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onOpenAssetPicker,
  previewMode 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleVisibility = (e) => {
    e.stopPropagation();
    onUpdate(section.id, {
      settings: {
        ...section.settings,
        hidden: !section.settings.hidden
      }
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
        section.settings?.hidden ? 'opacity-50' : ''
      }`}
      onClick={() => onSelect(section)}
    >
      {/* Section Controls Overlay */}
      {isSelected && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 flex items-center justify-between pointer-events-auto">
            <span className="flex items-center space-x-2">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-blue-600 p-1 rounded"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <span>{section.type.replace('-', ' ').toUpperCase()}</span>
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleVisibility}
                className="hover:bg-blue-600 p-1 rounded"
                title={section.settings?.hidden ? 'Show section' : 'Hide section'}
              >
                {section.settings?.hidden ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => onSelect(section)}
                className="hover:bg-blue-600 p-1 rounded"
                title="Edit section"
              >
                <Settings className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this section?')) {
                    onDelete(section.id);
                  }
                }}
                className="hover:bg-red-500 p-1 rounded"
                title="Delete section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Content */}
      <div className={`${section.settings?.hidden ? 'hidden' : ''}`}>
        <SectionRenderer
          section={section}
          onUpdate={(updates) => onUpdate(section.id, updates)}
          onOpenAssetPicker={onOpenAssetPicker}
          isEditing={isSelected}
          previewMode={previewMode}
        />
      </div>

      {/* Hover Indicator */}
      {!isSelected && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            {section.type.replace('-', ' ')}
          </div>
        </div>
      )}
    </div>
  );
};

const Canvas = ({
  sections,
  selectedSection,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
  onOpenAssetPicker,
  previewMode
}) => {
  if (sections.length === 0) {
    return (
      <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Page</h3>
          <p className="text-gray-500 mb-4">Add sections from the sidebar to begin designing your page</p>
          <div className="text-sm text-gray-400">
            Click sections in the sidebar to add them here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {sections.map((section) => (
        <SortableSection
          key={section.id}
          section={section}
          isSelected={selectedSection?.id === section.id}
          onSelect={onSelectSection}
          onUpdate={onUpdateSection}
          onDelete={onDeleteSection}
          onOpenAssetPicker={onOpenAssetPicker}
          previewMode={previewMode}
        />
      ))}
    </div>
  );
};

export default Canvas;