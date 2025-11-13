import React from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

const SidebarToggle = ({ 
  isOpen, 
  onToggle, 
  position = 'left', // 'left' or 'right'
  label = 'Toggle Sidebar',
  className = ''
}) => {
  const getIcon = () => {
    if (position === 'left') {
      return isOpen ? ChevronLeft : ChevronRight;
    } else {
      return isOpen ? ChevronRight : ChevronLeft;
    }
  };

  const getPositionClasses = () => {
    if (position === 'left') {
      return isOpen 
        ? 'left-64 translate-x-0' 
        : 'left-0 translate-x-0';
    } else {
      return isOpen 
        ? 'right-80 translate-x-0' 
        : 'right-0 translate-x-0';
    }
  };

  const Icon = getIcon();

  return (
    <button
      onClick={onToggle}
      className={`fixed z-50 top-1/2 transform -translate-y-1/2 ${getPositionClasses()} 
        bg-white border border-gray-300 rounded-lg shadow-lg p-2 
        hover:bg-gray-50 transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        ${className}`}
      title={`${isOpen ? 'Close' : 'Open'} ${label}`}
      aria-label={`${isOpen ? 'Close' : 'Open'} ${label}`}
    >
      <Icon size={16} className="text-gray-600" />
    </button>
  );
};

export default SidebarToggle;