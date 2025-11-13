import React, { useState, createContext, useContext } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GlassDragDropProvider - Context provider for drag and drop functionality
 * 
 * Features:
 * - Centralized drag and drop state management
 * - Multiple layout strategies (grid, list, custom)
 * - Touch and keyboard accessibility
 * - Real-time visual feedback
 * - Glass morphism styled drag overlays
 * - Auto-scroll support for long lists
 * - Collision detection algorithms
 * 
 * Usage:
 * <GlassDragDropProvider>
 *   <GlassDashboard />
 * </GlassDragDropProvider>
 */

const GlassDragDropContext = createContext();

export const useGlassDragDrop = () => {
  const context = useContext(GlassDragDropContext);
  if (!context) {
    throw new Error('useGlassDragDrop must be used within GlassDragDropProvider');
  }
  return context;
};

const GlassDragDropProvider = ({ 
  children,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  collisionDetection = closestCenter,
  autoScroll = true,
  measuring = {
    droppable: {
      strategy: 'always',
    },
  }
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZones, setDropZones] = useState({});

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveItem(active);
    setDraggedItem(active);
    onDragStart?.(event);
  };

  const handleDragMove = (event) => {
    onDragMove?.(event);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveItem(null);
    setDraggedItem(null);
    
    if (over && active.id !== over.id) {
      onDragEnd?.(event);
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    setDraggedItem(null);
    onDragCancel?.();
  };

  const registerDropZone = (id, component) => {
    setDropZones(prev => ({ ...prev, [id]: component }));
  };

  const unregisterDropZone = (id) => {
    setDropZones(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const value = {
    activeItem,
    draggedItem,
    dropZones,
    registerDropZone,
    unregisterDropZone,
    isDropZone: (id) => dropZones.hasOwnProperty(id),
    isDragging: Boolean(activeItem)
  };

  return (
    <GlassDragDropContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        autoScroll={autoScroll}
        measuring={measuring}
      >
        {children}
        
        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <GlassDragOverlay item={activeItem} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </GlassDragDropContext.Provider>
  );
};

// Glass styled drag overlay component
const GlassDragOverlay = ({ item }) => {
  return (
    <motion.div
      initial={{ scale: 1, rotate: 0 }}
      animate={{ 
        scale: 1.05, 
        rotate: 2,
        transition: { duration: 0.2 }
      }}
      className="
        bg-white/20 backdrop-blur-xl border border-white/30 
        shadow-2xl rounded-xl p-4 cursor-grabbing
        transform-gpu
      "
      style={{
        transformOrigin: '50% 50%',
        pointerEvents: 'none'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">
            {item.data?.current?.title || 'Dashboard Item'}
          </h4>
          <p className="text-white/70 text-xs">
            {item.data?.current?.subtitle || 'Drag to reposition'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Specialized sortable container components
export const GlassSortableContainer = ({ 
  children, 
  items, 
  strategy = rectSortingStrategy,
  disabled = false,
  className = ''
}) => {
  return (
    <SortableContext 
      items={items} 
      strategy={strategy}
      disabled={disabled}
    >
      <div className={`${className}`}>
        {children}
      </div>
    </SortableContext>
  );
};

// Grid layout sortable container
export const GlassGridContainer = ({ children, items, columns = 3, className = '' }) => (
  <GlassSortableContainer
    items={items}
    strategy={rectSortingStrategy}
    className={`
      grid gap-6
      ${columns === 1 ? 'grid-cols-1' : ''}
      ${columns === 2 ? 'grid-cols-1 lg:grid-cols-2' : ''}
      ${columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
      ${columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
      ${className}
    `}
  >
    {children}
  </GlassSortableContainer>
);

// Horizontal list sortable container
export const GlassHorizontalContainer = ({ children, items, className = '' }) => (
  <GlassSortableContainer
    items={items}
    strategy={horizontalListSortingStrategy}
    className={`flex gap-4 overflow-x-auto pb-4 ${className}`}
  >
    {children}
  </GlassSortableContainer>
);

// Vertical list sortable container
export const GlassVerticalContainer = ({ children, items, className = '' }) => (
  <GlassSortableContainer
    items={items}
    strategy={verticalListSortingStrategy}
    className={`space-y-4 ${className}`}
  >
    {children}
  </GlassSortableContainer>
);

// Drop zone component
export const GlassDropZone = ({ 
  id, 
  children, 
  className = '',
  activeClassName = '',
  accept = [],
  onDrop,
  disabled = false 
}) => {
  const { activeItem, isDragging, registerDropZone, unregisterDropZone } = useGlassDragDrop();
  
  React.useEffect(() => {
    if (!disabled) {
      registerDropZone(id, { accept, onDrop });
    }
    return () => unregisterDropZone(id);
  }, [id, accept, onDrop, disabled, registerDropZone, unregisterDropZone]);

  const isValidDrop = activeItem && (
    accept.length === 0 || 
    accept.includes(activeItem.data?.current?.type)
  );

  const isActive = isDragging && isValidDrop;

  return (
    <motion.div
      className={`
        relative transition-all duration-200
        ${isActive ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-transparent' : ''}
        ${className}
        ${isActive ? activeClassName : ''}
      `}
      animate={{
        scale: isActive ? 1.02 : 1,
        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
      
      {/* Drop indicator overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              absolute inset-0 pointer-events-none
              bg-blue-500/10 border-2 border-dashed border-blue-500/50 
              rounded-xl flex items-center justify-center
            "
          >
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-blue-700 font-medium text-sm">
                Drop here to add
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Hook for managing sortable items
export const useSortableItems = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);

  const moveItem = (activeId, overId) => {
    setItems(prev => {
      const oldIndex = prev.findIndex(item => item.id === activeId);
      const newIndex = prev.findIndex(item => item.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newItems = [...prev];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      return newItems;
    });
  };

  const addItem = (item) => {
    setItems(prev => [...prev, { ...item, id: item.id || Date.now().toString() }]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return {
    items,
    setItems,
    moveItem,
    addItem,
    removeItem,
    updateItem
  };
};

// Glass dashboard layout example
export const GlassDashboardExample = () => {
  const { items, moveItem, addItem, removeItem } = useSortableItems([
    { id: '1', title: 'Sales Chart', type: 'chart', component: 'LineChart' },
    { id: '2', title: 'User Analytics', type: 'chart', component: 'AreaChart' },
    { id: '3', title: 'Revenue Metrics', type: 'metric', component: 'MetricCard' },
    { id: '4', title: 'Performance', type: 'chart', component: 'BarChart' },
    { id: '5', title: 'Traffic Sources', type: 'chart', component: 'PieChart' },
    { id: '6', title: 'Conversion Rate', type: 'metric', component: 'MetricCard' }
  ]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      moveItem(active.id, over.id);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Glass Dashboard</h2>
        <button
          onClick={() => addItem({
            title: 'New Widget',
            type: 'chart',
            component: 'LineChart'
          })}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Widget
        </button>
      </div>

      <GlassDragDropProvider onDragEnd={handleDragEnd}>
        <GlassGridContainer items={items.map(item => item.id)} columns={3}>
          {items.map((item) => (
            <GlassDashboardItem
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              component={item.component}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </GlassGridContainer>

        {/* Drop zones for different sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <GlassDropZone
            id="charts-section"
            accept={['chart']}
            className="min-h-32 bg-blue-500/5 border border-blue-300/20 rounded-xl p-4"
            activeClassName="bg-blue-500/10"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Charts Section</h3>
            <p className="text-gray-600">Drop chart widgets here</p>
          </GlassDropZone>

          <GlassDropZone
            id="metrics-section"
            accept={['metric']}
            className="min-h-32 bg-green-500/5 border border-green-300/20 rounded-xl p-4"
            activeClassName="bg-green-500/10"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Metrics Section</h3>
            <p className="text-gray-600">Drop metric widgets here</p>
          </GlassDropZone>
        </div>
      </GlassDragDropProvider>
    </div>
  );
};

// Individual dashboard item component
const GlassDashboardItem = ({ id, title, type, component, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="
        bg-white/10 backdrop-blur-md border border-white/20 
        shadow-xl rounded-xl p-6 cursor-grab active:cursor-grabbing
        hover:bg-white/15 transition-all duration-200
      "
      whileHover={{ scale: 1.02, y: -2 }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-500/20 rounded transition-colors"
        >
          <span className="text-red-500">×</span>
        </button>
      </div>
      
      <div className="h-24 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center">
        <span className="text-gray-600">{component}</span>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Type: {type}
      </div>
    </motion.div>
  );
};

export default GlassDragDropProvider;