import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import SortableSection from './SortableSection';
import DropZone from './DropZone';
import { Plus } from 'lucide-react';

const DraggableCanvas = ({
  sections,
  selectedSection,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onReorderSections,
  onAddSection,
  previewMode = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    // Handle reordering existing sections
    if (active.data.current?.type === 'section' && over.data.current?.type === 'section') {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over.id);

      if (oldIndex !== newIndex) {
        onReorderSections(oldIndex, newIndex);
      }
      return;
    }

    // Handle adding new sections from sidebar
    if (active.data.current?.type === 'new-section') {
      const sectionType = active.data.current.sectionType;
      
      if (over.data.current?.type === 'section') {
        // Drop over existing section - insert before it
        const targetIndex = sections.findIndex(section => section.id === over.id);
        onAddSection(sectionType, targetIndex);
      } else if (over.data.current?.type === 'drop-zone') {
        // Drop in empty area or at the end
        onAddSection(sectionType);
      }
    }
  };

  const handleDragStart = (event) => {
    // Clear selection when starting to drag
    if (selectedSection) {
      onSelectSection(null);
    }
  };

  if (sections.length === 0 && !previewMode) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <DropZone onAddSection={onAddSection} />
      </DndContext>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <div className="min-h-full">
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              {!previewMode && index === 0 && (
                <DropZone 
                  index={0}
                  onAddSection={onAddSection}
                  compact
                />
              )}
              
              <SortableSection
                section={section}
                isSelected={selectedSection?.id === section.id}
                onSelect={onSelectSection}
                onUpdate={onUpdateSection}
                onDelete={onDeleteSection}
                onDuplicate={onDuplicateSection}
                previewMode={previewMode}
              />
              
              {!previewMode && (
                <DropZone 
                  index={index + 1}
                  onAddSection={onAddSection}
                  compact
                />
              )}
            </React.Fragment>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default DraggableCanvas;