import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode.js';

const DarkModeToggle = ({ className = '', showLabel = false }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      aria-label={`Toggle ${darkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          size={20} 
          className={`absolute transition-transform duration-300 ${
            darkMode ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
          }`} 
        />
        <Moon 
          size={20} 
          className={`absolute transition-transform duration-300 ${
            darkMode ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
          }`} 
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default DarkModeToggle;