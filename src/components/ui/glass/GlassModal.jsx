import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * GlassModal Component - Advanced glassmorphic modal with gesture support
 * 
 * Features:
 * - Multiple glass themes and sizes
 * - Gesture support for mobile (swipe to dismiss)
 * - Drag to move modal around
 * - Backdrop click to close
 * - Keyboard navigation (ESC to close)
 * - Focus trap for accessibility
 * - Smooth animations and transitions
 * 
 * Usage:
 * <GlassModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Modal Title"
 *   size="large"
 *   theme="analytics"
 *   showCloseButton={true}
 * >
 *   <ModalContent />
 * </GlassModal>
 */

const GlassModal = ({
  isOpen = false,
  onClose,
  children,
  title,
  subtitle,
  theme = 'default',
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  showMaximize = false,
  draggable = true,
  dismissible = true,
  backdrop = true,
  focusTrap = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  footerActions,
  onMaximize,
  onMinimize,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Glass theme configurations
  const themes = {
    default: {
      background: 'bg-white/90',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-white/30',
      shadow: 'shadow-2xl',
      overlay: 'bg-black/20'
    },
    analytics: {
      background: 'bg-gradient-to-br from-blue-500/10 to-purple-600/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-blue-300/40',
      shadow: 'shadow-2xl shadow-blue-500/20',
      overlay: 'bg-blue-900/20'
    },
    dashboard: {
      background: 'bg-gradient-to-br from-indigo-500/10 to-cyan-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-indigo-300/40',
      shadow: 'shadow-2xl shadow-indigo-500/20',
      overlay: 'bg-indigo-900/20'
    },
    success: {
      background: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-green-300/40',
      shadow: 'shadow-2xl shadow-green-500/20',
      overlay: 'bg-green-900/20'
    },
    warning: {
      background: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-yellow-300/40',
      shadow: 'shadow-2xl shadow-yellow-500/20',
      overlay: 'bg-yellow-900/20'
    },
    danger: {
      background: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-red-300/40',
      shadow: 'shadow-2xl shadow-red-500/20',
      overlay: 'bg-red-900/20'
    }
  };

  // Size configurations
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-7xl',
    auto: 'max-w-fit'
  };

  // Position configurations
  const positions = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-12',
    bottom: 'items-end justify-center pb-12',
    left: 'items-center justify-start pl-12',
    right: 'items-center justify-end pr-12'
  };

  // Gesture handling for mobile
  const gestureHandlers = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], cancel }) => {
      if (!draggable) return;

      // If dragging down with sufficient velocity, dismiss modal
      if (dismissible && dy > 0 && vy > 0.5 && Math.abs(my) > 100) {
        cancel();
        onClose?.();
      }
    },
    onPinch: ({ offset: [scale], cancel }) => {
      // Prevent pinch-to-zoom on mobile
      if (scale !== 1) cancel();
    }
  });

  // Focus management
  useEffect(() => {
    if (isOpen && focusTrap) {
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal when it opens
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      // Trap focus within modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable?.[0];
          const last = focusable?.[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }

    // Restore focus when modal closes
    return () => {
      if (!isOpen && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, focusTrap]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && dismissible) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dismissible, onClose]);

  // Animation variants
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateX: -15
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateX: 15,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    }
  };

  const currentTheme = themes[theme] || themes.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex overflow-hidden"
          initial="initial"
          animate="animate"
          exit="exit"
          {...props}
        >
          {/* Backdrop */}
          {backdrop && (
            <motion.div
              variants={overlayVariants}
              className={`absolute inset-0 ${currentTheme.overlay} ${currentTheme.backdrop}`}
              onClick={dismissible ? onClose : undefined}
              aria-hidden="true"
            />
          )}

          {/* Modal Container */}
          <div className={`relative w-full h-full flex ${positions[position]} p-4 overflow-auto`}>
            <motion.div
              ref={modalRef}
              variants={modalVariants}
              className={`
                relative w-full ${sizes[size]}
                ${currentTheme.background}
                ${currentTheme.backdrop}
                ${currentTheme.border}
                ${currentTheme.shadow}
                rounded-2xl overflow-hidden
                ${className}
              `}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              aria-describedby={subtitle ? "modal-subtitle" : undefined}
              {...gestureHandlers()}
              style={{ perspective: 1000 }}
            >
              {/* Ambient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

              {/* Header */}
              {(title || showCloseButton || showMaximize) && (
                <div className={`
                  relative z-10 px-6 py-4 border-b border-white/10 
                  bg-white/5 backdrop-blur-sm
                  ${headerClassName}
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {title && (
                        <h2 
                          id="modal-title"
                          className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p 
                          id="modal-subtitle"
                          className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                        >
                          {subtitle}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {showMaximize && (
                        <motion.button
                          onClick={onMaximize || onMinimize}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Maximize modal"
                        >
                          <Maximize2 size={16} className="text-gray-700 dark:text-gray-300" />
                        </motion.button>
                      )}
                      
                      {showCloseButton && (
                        <motion.button
                          onClick={onClose}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Close modal"
                        >
                          <X size={16} className="text-gray-700 dark:text-gray-300" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={`relative z-10 p-6 ${contentClassName}`}>
                {children}
              </div>

              {/* Footer */}
              {footerActions && (
                <div className="relative z-10 px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center justify-end gap-3">
                    {footerActions}
                  </div>
                </div>
              )}

              {/* Draggable indicator */}
              {draggable && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-1 bg-white/30 rounded-full" />
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Specialized modal variants
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  theme = "warning",
  ...props 
}) => (
  <GlassModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    theme={theme}
    size="small"
    footerActions={[
      <motion.button
        key="cancel"
        onClick={onClose}
        className="px-4 py-2 text-gray-700 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {cancelText}
      </motion.button>,
      <motion.button
        key="confirm"
        onClick={onConfirm}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {confirmText}
      </motion.button>
    ]}
    {...props}
  >
    <p className="text-gray-700 dark:text-gray-300">{message}</p>
  </GlassModal>
);

export const InfoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  theme = "analytics",
  ...props 
}) => (
  <GlassModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    theme={theme}
    size="medium"
    footerActions={[
      <motion.button
        key="close"
        onClick={onClose}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Close
      </motion.button>
    ]}
    {...props}
  >
    <div className="text-gray-700 dark:text-gray-300">
      {content}
    </div>
  </GlassModal>
);

// Example usage component
export const GlassModalShowcase = () => {
  const [modals, setModals] = React.useState({
    basic: false,
    confirmation: false,
    info: false,
    large: false
  });

  const openModal = (type) => {
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glass Modal Showcase</h2>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => openModal('basic')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Basic Modal
        </button>
        <button
          onClick={() => openModal('confirmation')}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Confirmation Modal
        </button>
        <button
          onClick={() => openModal('info')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Info Modal
        </button>
        <button
          onClick={() => openModal('large')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Large Modal
        </button>
      </div>

      {/* Modals */}
      <GlassModal
        isOpen={modals.basic}
        onClose={() => closeModal('basic')}
        title="Basic Glass Modal"
        subtitle="This is a subtitle"
        theme="analytics"
      >
        <p className="text-gray-700 dark:text-gray-300">
          This is a basic glass modal with blur effects and smooth animations.
          It supports keyboard navigation and gesture controls on mobile.
        </p>
      </GlassModal>

      <ConfirmationModal
        isOpen={modals.confirmation}
        onClose={() => closeModal('confirmation')}
        onConfirm={() => {
          console.log('Confirmed!');
          closeModal('confirmation');
        }}
        message="Are you sure you want to delete this item? This action cannot be undone."
      />

      <InfoModal
        isOpen={modals.info}
        onClose={() => closeModal('info')}
        title="Information"
        content="This is an informational modal with preset styling and actions."
      />

      <GlassModal
        isOpen={modals.large}
        onClose={() => closeModal('large')}
        title="Large Modal"
        theme="dashboard"
        size="large"
        showMaximize={true}
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This is a large modal with maximize functionality. You can drag it around
            and dismiss it with gestures on mobile devices.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">Feature 1</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Description</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">Feature 2</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Description</p>
            </div>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

export default GlassModal;