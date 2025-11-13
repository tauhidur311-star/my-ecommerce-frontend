import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { playClick, playHover } from '../../utils/soundManager';

/**
 * Enhanced Button Component with animations, sounds, and loading states
 * 
 * Features:
 * - Smooth hover/focus animations
 * - Sound effects for interactions
 * - Loading state with spinner
 * - Multiple variants and sizes
 * - Accessibility compliant
 * 
 * Usage:
 * <EnhancedButton
 *   variant="primary"
 *   size="md"
 *   loading={isSubmitting}
 *   onClick={handleSubmit}
 *   soundEnabled={true}
 * >
 *   Submit Form
 * </EnhancedButton>
 */

const EnhancedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  soundEnabled = true,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Variant styles
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Handle click with sound effect
  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Play click sound
    if (soundEnabled) {
      playClick();
    }
    
    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  // Handle hover sound effect
  const handleMouseEnter = () => {
    if (!disabled && !loading && soundEnabled) {
      playHover();
    }
  };

  // Animation variants
  const buttonVariants = {
    idle: { 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    hover: { 
      scale: 1.02, 
      y: -1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    tap: { 
      scale: 0.98, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    disabled: { 
      scale: 1, 
      y: 0,
      opacity: 0.6,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    }
  };

  // Loading spinner variants
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  // Text animation variants
  const textVariants = {
    initial: { opacity: 1, x: 0 },
    loading: { 
      opacity: 0, 
      x: 10,
      transition: { 
        duration: 0.2 
      }
    },
    loaded: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.2, 
        delay: 0.1 
      }
    }
  };

  return (
    <motion.button
      type={type}
      className={`
        relative overflow-hidden rounded-lg font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:cursor-not-allowed
        transform-gpu
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'pointer-events-none' : ''}
        ${className}
      `}
      variants={buttonVariants}
      initial="idle"
      animate={disabled || loading ? "disabled" : "idle"}
      whileHover={!disabled && !loading ? "hover" : "disabled"}
      whileTap={!disabled && !loading ? "tap" : "disabled"}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0"
        animate={{ opacity: isPressed ? 0.3 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Content container */}
      <div className="relative flex items-center justify-center gap-2">
        {/* Loading spinner */}
        {loading && (
          <motion.div
            variants={spinnerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Loader2 
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} 
              className="animate-spin" 
            />
          </motion.div>
        )}
        
        {/* Button text */}
        <motion.span
          variants={textVariants}
          animate={loading ? "loading" : "loaded"}
          className="flex items-center gap-2"
        >
          {children}
        </motion.span>
      </div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-white/30 rounded-lg opacity-0"
        animate={{ 
          scale: isPressed ? [1, 1.2, 1] : 1,
          opacity: isPressed ? [0, 0.3, 0] : 0
        }}
        transition={{ duration: 0.3 }}
        onTapStart={() => setIsPressed(true)}
        onTapEnd={() => setIsPressed(false)}
      />

      {/* Hover gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
        whileHover={{ 
          opacity: 0.2,
          x: ['-100%', '100%'],
          transition: { 
            x: { duration: 0.6, ease: "easeInOut" },
            opacity: { duration: 0.2 }
          }
        }}
      />
    </motion.button>
  );
};

export default EnhancedButton;

// Preset button variants for common use cases
export const SubmitButton = (props) => (
  <EnhancedButton variant="primary" type="submit" {...props} />
);

export const CancelButton = (props) => (
  <EnhancedButton variant="secondary" {...props} />
);

export const DeleteButton = (props) => (
  <EnhancedButton variant="danger" {...props} />
);

export const SaveButton = (props) => (
  <EnhancedButton variant="success" {...props} />
);

// Example usage with different states
export const ButtonShowcase = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap gap-4">
      <EnhancedButton variant="primary">Primary</EnhancedButton>
      <EnhancedButton variant="secondary">Secondary</EnhancedButton>
      <EnhancedButton variant="success">Success</EnhancedButton>
      <EnhancedButton variant="danger">Danger</EnhancedButton>
      <EnhancedButton variant="warning">Warning</EnhancedButton>
      <EnhancedButton variant="ghost">Ghost</EnhancedButton>
      <EnhancedButton variant="outline">Outline</EnhancedButton>
    </div>
    
    <div className="flex flex-wrap gap-4">
      <EnhancedButton size="sm">Small</EnhancedButton>
      <EnhancedButton size="md">Medium</EnhancedButton>
      <EnhancedButton size="lg">Large</EnhancedButton>
      <EnhancedButton size="xl">Extra Large</EnhancedButton>
    </div>
    
    <div className="flex flex-wrap gap-4">
      <EnhancedButton loading>Loading</EnhancedButton>
      <EnhancedButton disabled>Disabled</EnhancedButton>
    </div>
  </div>
);