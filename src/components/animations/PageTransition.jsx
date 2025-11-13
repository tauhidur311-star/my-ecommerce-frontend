import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Page Transition Component for smooth route changes
 * 
 * Features:
 * - Multiple transition types (fade, slide, scale, flip)
 * - Customizable duration and easing
 * - Loading state support
 * - Mobile-optimized animations
 * 
 * Usage:
 * <PageTransition type="slide" direction="right">
 *   <YourPageComponent />
 * </PageTransition>
 */

const PageTransition = ({ 
  children, 
  type = 'fade', 
  direction = 'right',
  duration = 0.3,
  className = '',
  loading = false
}) => {
  const location = useLocation();

  // Animation variants for different transition types
  const transitionVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'right' ? 100 : direction === 'left' ? -100 : 0,
        y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0
      },
      animate: { 
        opacity: 1, 
        x: 0, 
        y: 0 
      },
      exit: {
        opacity: 0,
        x: direction === 'right' ? -100 : direction === 'left' ? 100 : 0,
        y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0
      }
    },
    
    scale: {
      initial: { 
        opacity: 0, 
        scale: 0.9,
        transformOrigin: 'center center'
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        transformOrigin: 'center center'
      },
      exit: { 
        opacity: 0, 
        scale: 1.1,
        transformOrigin: 'center center'
      }
    },
    
    flip: {
      initial: { 
        opacity: 0, 
        rotateY: 90,
        transformOrigin: 'center center'
      },
      animate: { 
        opacity: 1, 
        rotateY: 0,
        transformOrigin: 'center center'
      },
      exit: { 
        opacity: 0, 
        rotateY: -90,
        transformOrigin: 'center center'
      }
    },
    
    slideUp: {
      initial: { 
        opacity: 0, 
        y: 50,
        scale: 0.95
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1
      },
      exit: { 
        opacity: 0, 
        y: -50,
        scale: 0.95
      }
    }
  };

  const transition = {
    type: "tween",
    duration: duration,
    ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
  };

  // Mobile-specific adjustments
  const mobileVariants = {
    ...transitionVariants[type],
    initial: {
      ...transitionVariants[type].initial,
      // Reduce motion on mobile for performance
      ...(window.innerWidth < 768 && {
        x: transitionVariants[type].initial?.x ? transitionVariants[type].initial.x * 0.5 : 0,
        y: transitionVariants[type].initial?.y ? transitionVariants[type].initial.y * 0.5 : 0
      })
    }
  };

  return (
    <AnimatePresence 
      mode="wait"
      initial={false}
      onExitComplete={() => {
        // Scroll to top after page transition
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <motion.div
        key={location.pathname}
        variants={mobileVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className={`w-full ${className}`}
        style={{
          // Hardware acceleration for smooth animations
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Specialized components for common use cases
export const FadeTransition = ({ children, ...props }) => (
  <PageTransition type="fade" {...props}>
    {children}
  </PageTransition>
);

export const SlideTransition = ({ children, direction = 'right', ...props }) => (
  <PageTransition type="slide" direction={direction} {...props}>
    {children}
  </PageTransition>
);

export const ScaleTransition = ({ children, ...props }) => (
  <PageTransition type="scale" {...props}>
    {children}
  </PageTransition>
);

export const SlideUpTransition = ({ children, ...props }) => (
  <PageTransition type="slideUp" {...props}>
    {children}
  </PageTransition>
);

// HOC for wrapping route components with transitions
export const withPageTransition = (Component, transitionProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <PageTransition {...transitionProps}>
        <Component {...props} />
      </PageTransition>
    );
  };
};

// Route transition wrapper for React Router
export const AnimatedRoutes = ({ children, transitionType = 'fade' }) => {
  return (
    <PageTransition type={transitionType}>
      {children}
    </PageTransition>
  );
};

// Staggered children animation for lists/grids
export const StaggerContainer = ({ children, className = '', delay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: delay
          }
        }
      }}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PageTransition;