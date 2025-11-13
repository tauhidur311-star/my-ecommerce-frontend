import React, { useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import SectionRenderer, { createNewSection, getSectionTypeDisplayName } from './SectionRenderer';

interface SectionData {
  id: string;
  type: string;
  settings?: Record<string, any>;
  styles?: Record<string, any>;
  visible?: boolean;
  responsive?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
}

interface SortableSectionProps {
  section: SectionData;
  isSelected: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  products?: any[];
  testimonials?: any[];
  onSelect: (sectionId: string) => void;
  onUpdate: (sectionId: string, updates: Partial<SectionData>) => void;
  onDelete: (sectionId: string) => void;
  onDuplicate: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
  onAddToCart?: (product: any) => void;
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onNewsletterSignup?: (email: string) => Promise<void>;
  onContactSubmit?: (data: any) => Promise<void>;
}

const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  isSelected,
  previewMode,
  products,
  testimonials,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  ...handlers
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      {/* Section Controls Overlay */}
      <div className={`absolute top-0 left-0 right-0 z-40 bg-blue-500 text-white px-4 py-2 flex items-center justify-between transition-all duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="flex items-center space-x-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 hover:bg-blue-400 rounded"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <span className="text-sm font-medium">
            {getSectionTypeDisplayName(section.type as any)}
          </span>
          
          {!section.visible && (
            <span className="text-xs bg-blue-400 px-2 py-0.5 rounded">Hidden</span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(section.id);
            }}
            className="p-1 hover:bg-blue-400 rounded transition-colors"
            title={section.visible ? 'Hide section' : 'Show section'}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Duplicate */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(section.id);
            }}
            className="p-1 hover:bg-blue-400 rounded transition-colors"
            title="Duplicate section"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}
            className="p-1 hover:bg-red-500 rounded transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className={`${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
        <SectionRenderer
          section={section}
          products={products}
          testimonials={testimonials}
          isSelected={isSelected}
          isEditing={true}
          onSectionClick={onSelect}
          onUpdateSection={onUpdate}
          onDeleteSection={onDelete}
          {...handlers}
        />
      </div>
    </div>
  );
};

interface EnhancedCanvasProps {
  sections: SectionData[];
  selectedSectionId: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  products?: any[];
  testimonials?: any[];
  onSectionsReorder: (sections: SectionData[]) => void;
  onSectionSelect: (sectionId: string | null) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<SectionData>) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionDuplicate: (sectionId: string) => void;
  onSectionAdd: (sectionType: string, position?: number) => void;
  onAddToCart?: (product: any) => void;
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onNewsletterSignup?: (email: string) => Promise<void>;
  onContactSubmit?: (data: any) => Promise<void>;
  className?: string;
}

const EnhancedCanvas: React.FC<EnhancedCanvasProps> = ({
  sections,
  selectedSectionId,
  previewMode,
  products = [],
  testimonials = [],
  onSectionsReorder,
  onSectionSelect,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onSectionAdd,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  onNewsletterSignup,
  onContactSubmit,
  className = ''
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        onSectionsReorder(newSections);
      }
    }
  };

  const handleSectionToggleVisibility = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      onSectionUpdate(sectionId, { visible: !section.visible });
    }
  };

  const handleSectionDuplicate = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newSection = createNewSection(section.type as any);
      newSection.settings = { ...section.settings };
      newSection.styles = { ...section.styles };
      newSection.responsive = { ...section.responsive };
      
      const index = sections.findIndex(s => s.id === sectionId);
      onSectionAdd(section.type, index + 1);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas (not on a section)
    if (e.target === e.currentTarget) {
      onSectionSelect(null);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const getPreviewScale = () => {
    if (!canvasRef.current) return 1;
    
    const canvasWidth = canvasRef.current.clientWidth - 32; // Account for padding
    
    switch (previewMode) {
      case 'mobile':
        return Math.min(1, canvasWidth / 375);
      case 'tablet':
        return Math.min(1, canvasWidth / 768);
      case 'desktop':
      default:
        return 1;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      // Force re-render to recalculate scale
      if (canvasRef.current) {
        canvasRef.current.style.transform = `scale(${getPreviewScale()})`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [previewMode]);

  return (
    <div ref={canvasRef} className={`flex-1 overflow-auto bg-gray-50 ${className}`}>
      <div className="p-4 min-h-full">
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div
            className="mx-auto bg-white shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: getPreviewWidth(),
              maxWidth: '100%',
              transform: `scale(${getPreviewScale()})`,
              transformOrigin: 'top center',
              borderRadius: '8px'
            }}
            onClick={handleCanvasClick}
          >
            {sections.length === 0 ? (
              /* Empty State */
              <div className="min-h-screen flex items-center justify-center p-12 text-center">
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <GripVertical className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Page
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Drag sections from the sidebar to start creating your page layout.
                  </p>
                  <button
                    onClick={() => onSectionAdd('hero')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Hero Section
                  </button>
                </div>
              </div>
            ) : (
              <SortableContext
                items={sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    previewMode={previewMode}
                    products={products}
                    testimonials={testimonials}
                    onSelect={onSectionSelect}
                    onUpdate={onSectionUpdate}
                    onDelete={onSectionDelete}
                    onDuplicate={handleSectionDuplicate}
                    onToggleVisibility={handleSectionToggleVisibility}
                    onAddToCart={onAddToCart}
                    onQuickView={onQuickView}
                    onAddToWishlist={onAddToWishlist}
                    onNewsletterSignup={onNewsletterSignup}
                    onContactSubmit={onContactSubmit}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>

        {/* Add Section Buttons */}
        {sections.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <button
                onClick={() => onSectionAdd('hero')}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Hero
              </button>
              <button
                onClick={() => onSectionAdd('product-grid')}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Products
              </button>
              <button
                onClick={() => onSectionAdd('testimonials')}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Testimonials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCanvas;