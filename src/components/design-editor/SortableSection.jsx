import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, Settings, Trash2, Eye, EyeOff, Copy, Move
} from 'lucide-react';
import SectionRenderer from '../sections/SectionRenderer';

const SortableSection = ({
  section,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  previewMode = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    data: {
      type: 'section',
      section
    }
  });

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

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(section);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this section?')) {
      onDelete(section.id);
    }
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicate(section.id);
  };

  if (previewMode) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={section.settings?.hidden ? 'hidden' : ''}
      >
        <SectionRenderer
          section={section}
          previewMode={true}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${section.settings?.hidden ? 'opacity-50' : ''}`}
      onClick={handleSelect}
    >
      {/* Drag Overlay - shows when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center z-50">
          <div className="text-blue-600 font-medium">
            Moving {section.type.replace('-', ' ')} section...
          </div>
        </div>
      )}

      {/* Section Controls Overlay */}
      {isSelected && !isDragging && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top toolbar */}
          <div className="absolute -top-10 left-0 right-0 bg-blue-500 text-white text-xs px-3 py-2 rounded-t-lg flex items-center justify-between pointer-events-auto shadow-lg">
            <div className="flex items-center space-x-2">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-blue-600 p-1 rounded flex items-center"
                title="Drag to reorder"
              >
                <GripVertical className="w-3 h-3 mr-1" />
                <span className="font-medium">{section.type.replace('-', ' ').toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleVisibility}
                className="hover:bg-blue-600 p-1 rounded transition-colors"
                title={section.settings?.hidden ? 'Show section' : 'Hide section'}
              >
                {section.settings?.hidden ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
              
              <button
                onClick={handleDuplicate}
                className="hover:bg-blue-600 p-1 rounded transition-colors"
                title="Duplicate section"
              >
                <Copy className="w-3 h-3" />
              </button>
              
              <button
                onClick={handleSelect}
                className="hover:bg-blue-600 p-1 rounded transition-colors"
                title="Edit section"
              >
                <Settings className="w-3 h-3" />
              </button>
              
              <button
                onClick={handleDelete}
                className="hover:bg-red-500 p-1 rounded transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Selection border */}
          <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
        </div>
      )}

      {/* Hover Indicator */}
      {!isSelected && !isDragging && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
            <Move className="w-3 h-3 inline mr-1" />
            {section.type.replace('-', ' ')}
          </div>
          <div className="absolute inset-0 border border-gray-300 border-dashed rounded" />
        </div>
      )}

      {/* Section Content */}
      <div className={`${section.settings?.hidden ? 'opacity-50' : ''}`}>
        <SectionRenderer
          section={section}
          onUpdate={(updates) => onUpdate(section.id, updates)}
          isEditing={isSelected}
          previewMode={false}
        />
      </div>
    </div>
  );
};

export default SortableSection;