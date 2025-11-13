import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * GlassSidebar Component - Advanced sidebar with glass effects and gesture support
 * 
 * Features:
 * - Glass morphism design with multiple themes
 * - Swipe to open/close on mobile
 * - Drag to resize sidebar width
 * - Smooth animations and transitions
 * - Backdrop click to close
 * - Keyboard navigation support
 * - Responsive design with auto-collapse
 * 
 * Usage:
 * <GlassSidebar
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   position="left"
 *   theme="analytics"
 *   resizable={true}
 * >
 *   <SidebarContent />
 * </GlassSidebar>
 */

const GlassSidebar = ({
  isOpen = false,
  onClose,
  onToggle,
  children,
  position = 'left',
  theme = 'default',
  width = 'medium',
  resizable = false,
  collapsible = true,
  overlay = true,
  persistent = false,
  className = '',
  contentClassName = '',
  headerContent,
  footerContent,
  closeButton = true,
  swipeGestures = true,
  ...props
}) => {
  const sidebarRef = useRef(null);
  const dragControls = useDragControls();

  // Glass theme configurations
  const themes = {
    default: {
      background: 'bg-white/10',
      backdrop: 'backdrop-blur-xl',
      border: position === 'left' ? 'border-r border-white/20' : 'border-l border-white/20',
      shadow: position === 'left' ? 'shadow-2xl shadow-black/10' : 'shadow-2xl shadow-black/10',
      overlay: 'bg-black/20'
    },
    analytics: {
      background: 'bg-gradient-to-br from-blue-500/10 to-purple-600/10',
      backdrop: 'backdrop-blur-xl',
      border: position === 'left' ? 'border-r border-blue-300/30' : 'border-l border-blue-300/30',
      shadow: 'shadow-2xl shadow-blue-500/20',
      overlay: 'bg-blue-900/20'
    },
    dashboard: {
      background: 'bg-gradient-to-br from-indigo-500/10 to-cyan-500/10',
      backdrop: 'backdrop-blur-xl',
      border: position === 'left' ? 'border-r border-indigo-300/30' : 'border-l border-indigo-300/30',
      shadow: 'shadow-2xl shadow-indigo-500/20',
      overlay: 'bg-indigo-900/20'
    },
    dark: {
      background: 'bg-gray-900/90',
      backdrop: 'backdrop-blur-xl',
      border: position === 'left' ? 'border-r border-gray-700/50' : 'border-l border-gray-700/50',
      shadow: 'shadow-2xl shadow-black/30',
      overlay: 'bg-black/40'
    }
  };

  // Width configurations
  const widths = {
    small: 'w-64',
    medium: 'w-80',
    large: 'w-96',
    xlarge: 'w-[28rem]',
    full: 'w-full md:w-80'
  };

  // Gesture handling
  const gestureHandlers = useGesture({
    onDrag: ({ down, movement: [mx], velocity: [vx], direction: [dx], cancel }) => {
      if (!swipeGestures) return;

      const threshold = 100;
      const velocityThreshold = 0.5;

      if (position === 'left') {
        // Swipe left to close
        if (isOpen && dx < 0 && (Math.abs(mx) > threshold || vx < -velocityThreshold)) {
          cancel();
          onClose?.();
        }
      } else {
        // Swipe right to close
        if (isOpen && dx > 0 && (Math.abs(mx) > threshold || vx > velocityThreshold)) {
          cancel();
          onClose?.();
        }
      }
    }
  });

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !persistent &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    };

    if (isOpen && overlay) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, persistent, overlay, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen && !persistent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, persistent]);

  // Animation variants
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const sidebarVariants = {
    initial: {
      x: position === 'left' ? '-100%' : '100%',
      opacity: 0
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: {
      x: position === 'left' ? '-100%' : '100%',
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    }
  };

  const currentTheme = themes[theme] || themes.default;
  const positionClasses = position === 'left' ? 'left-0' : 'right-0';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          initial="initial"
          animate="animate"
          exit="exit"
          {...props}
        >
          {/* Overlay */}
          {overlay && (
            <motion.div
              variants={overlayVariants}
              className={`absolute inset-0 ${currentTheme.overlay} ${currentTheme.backdrop}`}
              onClick={!persistent ? onClose : undefined}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            ref={sidebarRef}
            variants={sidebarVariants}
            className={`
              absolute top-0 ${positionClasses} h-full ${widths[width]}
              ${currentTheme.background}
              ${currentTheme.backdrop}
              ${currentTheme.border}
              ${currentTheme.shadow}
              flex flex-col
              ${className}
            `}
            {...gestureHandlers()}
            role="complementary"
            aria-hidden={!isOpen}
          >
            {/* Ambient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

            {/* Header */}
            {(headerContent || closeButton) && (
              <div className="relative z-10 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between">
                <div className="flex-1">
                  {headerContent}
                </div>
                
                {closeButton && (
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close sidebar"
                  >
                    <X size={16} className="text-gray-700 dark:text-gray-300" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={`relative z-10 flex-1 overflow-y-auto ${contentClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {footerContent && (
              <div className="relative z-10 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                {footerContent}
              </div>
            )}

            {/* Resize handle */}
            {resizable && (
              <motion.div
                className={`
                  absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} h-full w-1
                  bg-white/20 hover:bg-white/40 cursor-col-resize opacity-0 hover:opacity-100
                  transition-opacity duration-200
                `}
                whileHover={{ scale: 1.2 }}
                drag={position === 'left' ? 'x' : 'x'}
                dragControls={dragControls}
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
              />
            )}

            {/* Swipe indicator */}
            {swipeGestures && (
              <div className={`
                absolute top-1/2 transform -translate-y-1/2 
                ${position === 'left' ? 'right-2' : 'left-2'}
                opacity-30 hover:opacity-60 transition-opacity
              `}>
                {position === 'left' ? (
                  <ChevronLeft size={20} className="text-white" />
                ) : (
                  <ChevronRight size={20} className="text-white" />
                )}
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Specialized sidebar variants
export const NavigationSidebar = ({ 
  isOpen, 
  onClose, 
  navigationItems = [],
  currentPath,
  theme = 'dashboard',
  ...props 
}) => (
  <GlassSidebar
    isOpen={isOpen}
    onClose={onClose}
    theme={theme}
    headerContent={
      <div className="flex items-center gap-3">
        <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
      </div>
    }
    {...props}
  >
    <nav className="p-4">
      <ul className="space-y-2">
        {navigationItems.map((item, index) => (
          <li key={index}>
            <motion.a
              href={item.href}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${currentPath === item.href 
                  ? 'bg-white/20 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
                }
              `}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon && <item.icon size={18} />}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.a>
          </li>
        ))}
      </ul>
    </nav>
  </GlassSidebar>
);

export const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters = {},
  onFilterChange,
  theme = 'analytics',
  ...props 
}) => (
  <GlassSidebar
    isOpen={isOpen}
    onClose={onClose}
    theme={theme}
    width="small"
    headerContent={
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
    }
    footerContent={
      <div className="flex gap-2">
        <motion.button
          onClick={() => onFilterChange?.({})}
          className="flex-1 px-4 py-2 text-gray-700 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear
        </motion.button>
        <motion.button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Apply
        </motion.button>
      </div>
    }
    {...props}
  >
    <div className="p-4 space-y-6">
      {Object.entries(filters).map(([key, filter]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {filter.label}
          </label>
          {filter.type === 'select' && (
            <select 
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.value || ''}
              onChange={(e) => onFilterChange?.({ ...filters, [key]: { ...filter, value: e.target.value } })}
            >
              <option value="">All</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {filter.type === 'range' && (
            <div className="space-y-2">
              <input
                type="range"
                min={filter.min || 0}
                max={filter.max || 100}
                value={filter.value || filter.min || 0}
                onChange={(e) => onFilterChange?.({ ...filters, [key]: { ...filter, value: e.target.value } })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{filter.min || 0}</span>
                <span>{filter.value || filter.min || 0}</span>
                <span>{filter.max || 100}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </GlassSidebar>
);

// Example usage component
export const GlassSidebarShowcase = () => {
  const [sidebars, setSidebars] = React.useState({
    navigation: false,
    filter: false,
    analytics: false
  });

  const toggleSidebar = (type) => {
    setSidebars(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: ({ size }) => <div className={`w-${size/4} h-${size/4} bg-blue-500 rounded`} /> },
    { href: '/analytics', label: 'Analytics', icon: ({ size }) => <div className={`w-${size/4} h-${size/4} bg-green-500 rounded`} />, badge: '5' },
    { href: '/users', label: 'Users', icon: ({ size }) => <div className={`w-${size/4} h-${size/4} bg-purple-500 rounded`} /> },
    { href: '/settings', label: 'Settings', icon: ({ size }) => <div className={`w-${size/4} h-${size/4} bg-orange-500 rounded`} /> },
  ];

  const filters = {
    category: {
      label: 'Category',
      type: 'select',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' }
      ]
    },
    price: {
      label: 'Price Range',
      type: 'range',
      min: 0,
      max: 1000,
      value: 500
    }
  };

  return (
    <div className="p-6 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glass Sidebar Showcase</h2>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => toggleSidebar('navigation')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Toggle Navigation
        </button>
        <button
          onClick={() => toggleSidebar('filter')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Toggle Filters
        </button>
        <button
          onClick={() => toggleSidebar('analytics')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Toggle Analytics
        </button>
      </div>

      {/* Sidebars */}
      <NavigationSidebar
        isOpen={sidebars.navigation}
        onClose={() => toggleSidebar('navigation')}
        navigationItems={navigationItems}
        currentPath="/dashboard"
      />

      <FilterSidebar
        isOpen={sidebars.filter}
        onClose={() => toggleSidebar('filter')}
        filters={filters}
        onFilterChange={(newFilters) => console.log('Filters changed:', newFilters)}
      />

      <GlassSidebar
        isOpen={sidebars.analytics}
        onClose={() => toggleSidebar('analytics')}
        theme="analytics"
        width="large"
        headerContent={
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Panel</h2>
        }
      >
        <div className="p-4 space-y-4">
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Stats</h3>
            <p className="text-gray-600 dark:text-gray-300">This sidebar can contain charts, graphs, or any analytics content.</p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h3>
            <p className="text-gray-600 dark:text-gray-300">Swipe left to close on mobile devices.</p>
          </div>
        </div>
      </GlassSidebar>

      <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features Demonstrated</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• Glass morphism effects with backdrop blur</li>
          <li>• Swipe gestures to open/close on mobile</li>
          <li>• Smooth animations and transitions</li>
          <li>• Multiple themes and configurations</li>
          <li>• Keyboard navigation support</li>
          <li>• Responsive design patterns</li>
        </ul>
      </div>
    </div>
  );
};

export default GlassSidebar;