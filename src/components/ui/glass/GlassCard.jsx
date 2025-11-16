import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { useGesture } from '@use-gesture/react';

/**
 * GlassCard Component - Versatile glassmorphic card with drag & drop support
 * 
 * Features:
 * - Multiple glass themes and variants
 * - Drag and drop functionality
 * - Gesture support for mobile
 * - Hover animations and effects
 * - Responsive design
 * - Accessibility compliant
 * 
 * Usage:
 * <GlassCard
 *   theme="analytics"
 *   variant="elevated"
 *   draggable={true}
 *   onTap={handleTap}
 *   className="custom-class"
 * >
 *   <CardContent />
 * </GlassCard>
 */

const GlassCard = forwardRef(({
  children,
  theme = 'default',
  variant = 'standard',
  size = 'medium',
  draggable = false,
  dragId = null,
  interactive = true,
  className = '',
  style = {},
  onClick,
  onTap,
  onHover,
  onGestureStart,
  onGestureEnd,
  disabled = false,
  loading = false,
  ...props
}, ref) => {

  // Glass theme configurations
  const themes = {
    default: {
      background: 'bg-white/10',
      backdrop: 'backdrop-blur-md',
      border: 'border border-white/20',
      shadow: 'shadow-lg',
      hover: 'hover:bg-white/15'
    },
    analytics: {
      background: 'bg-gradient-to-br from-blue-500/10 to-purple-600/10',
      backdrop: 'backdrop-blur-lg',
      border: 'border border-blue-300/30',
      shadow: 'shadow-xl shadow-blue-500/10',
      hover: 'hover:from-blue-500/15 hover:to-purple-600/15'
    },
    dashboard: {
      background: 'bg-gradient-to-br from-indigo-500/10 to-cyan-500/10',
      backdrop: 'backdrop-blur-md',
      border: 'border border-indigo-300/30',
      shadow: 'shadow-lg shadow-indigo-500/10',
      hover: 'hover:from-indigo-500/15 hover:to-cyan-500/15'
    },
    success: {
      background: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      backdrop: 'backdrop-blur-md',
      border: 'border border-green-300/30',
      shadow: 'shadow-lg shadow-green-500/10',
      hover: 'hover:from-green-500/15 hover:to-emerald-500/15'
    },
    warning: {
      background: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
      backdrop: 'backdrop-blur-md',
      border: 'border border-yellow-300/30',
      shadow: 'shadow-lg shadow-yellow-500/10',
      hover: 'hover:from-yellow-500/15 hover:to-orange-500/15'
    },
    danger: {
      background: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
      backdrop: 'backdrop-blur-md',
      border: 'border border-red-300/30',
      shadow: 'shadow-lg shadow-red-500/10',
      hover: 'hover:from-red-500/15 hover:to-pink-500/15'
    }
  };

  // Variant configurations
  const variants = {
    standard: 'rounded-xl',
    elevated: 'rounded-xl shadow-2xl',
    flat: 'rounded-lg shadow-sm',
    circular: 'rounded-full',
    minimal: 'rounded-md border-0 shadow-none bg-white/5'
  };

  // Size configurations
  const sizes = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
    xlarge: 'p-10'
  };

  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging
  } = useDraggable({
    id: dragId || 'glass-card',
    disabled: !draggable || disabled
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto'
  } : {};

  // Gesture handling
  const gestureHandlers = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity, direction: [dx, dy], cancel }) => {
      if (!interactive || disabled) return;
      
      // Custom drag logic for non-dnd gestures
      if (onGestureStart && down) onGestureStart({ mx, my, velocity });
      if (onGestureEnd && !down) onGestureEnd({ mx, my, velocity, direction: [dx, dy] });
    },
    onHover: ({ hovering }) => {
      if (onHover) onHover({ hovering });
    }
  });

  // Animation variants
  const cardVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      y: 20 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        duration: 0.1
      }
    },
    dragging: {
      scale: 1.05,
      rotate: 2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const currentTheme = themes[theme] || themes.default;

  // Combine all styling
  const cardClasses = `
    ${currentTheme.background}
    ${currentTheme.backdrop}
    ${currentTheme.border}
    ${currentTheme.shadow}
    ${variants[variant]}
    ${sizes[size]}
    ${interactive && !disabled ? currentTheme.hover : ''}
    ${interactive && !disabled ? 'cursor-pointer' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${draggable && !disabled ? 'touch-none select-none' : ''}
    relative overflow-hidden transition-all duration-200 ease-out
    ${className}
  `.trim();

  // Loading skeleton
  if (loading) {
    return (
      <div className={cardClasses} style={{ ...style, ...dragStyle }}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="h-8 bg-white/20 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref || setDragRef}
      className={cardClasses}
      style={{ ...style, ...dragStyle }}
      variants={cardVariants}
      initial="initial"
      animate={isDragging ? "dragging" : "animate"}
      whileHover={interactive && !disabled ? "hover" : "animate"}
      whileTap={interactive && !disabled ? "tap" : "animate"}
      onClick={onClick}
      onTap={onTap}
      {...attributes}
      {...(draggable && !disabled ? listeners : {})}
      {...gestureHandlers()}
      {...props}
      role={interactive ? "button" : "region"}
      tabIndex={interactive && !disabled ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
      aria-disabled={disabled}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        whileHover={{
          translateX: "200%",
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Interactive indicators */}
      {draggable && !disabled && (
        <div className="absolute top-3 right-3 opacity-30 hover:opacity-70 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7-13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
          </svg>
        </div>
      )}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';

// Specialized glass card variants for common use cases
export const AnalyticsGlassCard = ({ children, ...props }) => (
  <GlassCard theme="analytics" variant="elevated" {...props}>
    {children}
  </GlassCard>
);

export const DashboardGlassCard = ({ children, ...props }) => (
  <GlassCard theme="dashboard" variant="standard" {...props}>
    {children}
  </GlassCard>
);

export const MetricGlassCard = ({ title, value, delta, icon: Icon, ...props }) => (
  <GlassCard theme="analytics" size="medium" interactive={true} {...props}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {delta !== undefined && (
          <p className={`text-sm font-medium mt-1 ${
            delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {delta > 0 ? '+' : ''}{delta}%
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-3 rounded-full bg-white/10">
          <Icon size={24} className="text-gray-700 dark:text-gray-300" />
        </div>
      )}
    </div>
  </GlassCard>
);

// Example usage component
export const GlassCardShowcase = () => {
  const handleCardClick = (theme) => {
    console.log(`Clicked ${theme} card`);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glass Card Showcase</h2>
      
      {/* Theme variations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['default', 'analytics', 'dashboard', 'success', 'warning', 'danger'].map((theme) => (
          <GlassCard
            key={theme}
            theme={theme}
            onClick={() => handleCardClick(theme)}
            className="h-32"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Glass card with {theme} theme styling
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Variant examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['standard', 'elevated', 'flat', 'minimal'].map((variant) => (
          <GlassCard
            key={variant}
            variant={variant}
            theme="analytics"
            size="small"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {variant} variant
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Draggable cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard
          theme="dashboard"
          draggable={true}
          dragId="card-1"
          size="large"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Draggable Card
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            This card can be dragged around. Try dragging it!
          </p>
        </GlassCard>

        <MetricGlassCard
          title="Total Revenue"
          value="$24,562"
          delta={12.5}
          icon={({ size }) => <div className="w-6 h-6 bg-green-500 rounded-full" />}
        />

        <GlassCard theme="success" loading={true} />
      </div>
    </div>
  );
};

export default GlassCard;