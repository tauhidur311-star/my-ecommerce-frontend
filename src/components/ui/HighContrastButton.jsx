import React from 'react';
import { motion } from 'framer-motion';

const HighContrastButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-2 border-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-700 focus:ring-yellow-500',
    outline: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900 border-2 border-transparent hover:border-gray-300 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-opacity-50';

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default HighContrastButton;