import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * GlassDropdown Component - Advanced dropdown with glass effects and search
 * 
 * Features:
 * - Glass morphism design with multiple themes
 * - Search functionality for large lists
 * - Multi-select support
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Gesture support for mobile
 * - Custom option rendering
 * - Grouping and categorization
 * - Loading states and async data
 * 
 * Usage:
 * <GlassDropdown
 *   options={dropdownOptions}
 *   value={selectedValue}
 *   onChange={handleChange}
 *   theme="analytics"
 *   searchable={true}
 *   multiSelect={false}
 * />
 */

const GlassDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  theme = 'default',
  size = 'medium',
  searchable = false,
  multiSelect = false,
  clearable = true,
  disabled = false,
  loading = false,
  error = null,
  maxHeight = 'max-h-64',
  position = 'bottom',
  className = '',
  dropdownClassName = '',
  optionClassName = '',
  renderOption,
  renderValue,
  filterOption,
  groupBy,
  noOptionsMessage = "No options available",
  searchPlaceholder = "Search options...",
  loadingMessage = "Loading...",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState(position);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionRefs = useRef([]);

  // Glass theme configurations
  const themes = {
    default: {
      background: 'bg-white/90',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-white/30',
      shadow: 'shadow-lg',
      dropdown: 'bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl'
    },
    analytics: {
      background: 'bg-gradient-to-r from-blue-500/10 to-purple-600/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-blue-300/40',
      shadow: 'shadow-lg shadow-blue-500/20',
      dropdown: 'bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-blue-300/40 shadow-xl shadow-blue-500/20'
    },
    dashboard: {
      background: 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-indigo-300/40',
      shadow: 'shadow-lg shadow-indigo-500/20',
      dropdown: 'bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 backdrop-blur-xl border border-indigo-300/40 shadow-xl shadow-indigo-500/20'
    },
    success: {
      background: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-green-300/40',
      shadow: 'shadow-lg shadow-green-500/20',
      dropdown: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-300/40 shadow-xl shadow-green-500/20'
    },
    danger: {
      background: 'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-red-300/40',
      shadow: 'shadow-lg shadow-red-500/20',
      dropdown: 'bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-300/40 shadow-xl shadow-red-500/20'
    }
  };

  // Size configurations
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-3 text-lg'
  };

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery ? options.filter(option => {
    if (filterOption) {
      return filterOption(option, searchQuery);
    }
    const searchStr = searchQuery.toLowerCase();
    return (
      option.label?.toLowerCase().includes(searchStr) ||
      option.value?.toLowerCase().includes(searchStr) ||
      option.searchableText?.toLowerCase().includes(searchStr)
    );
  }) : options;

  // Group options if groupBy is provided
  const groupedOptions = groupBy ? 
    filteredOptions.reduce((groups, option) => {
      const group = option[groupBy] || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
      return groups;
    }, {}) : 
    { 'All': filteredOptions };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(v => v.value === option.value);
      const newValues = isSelected 
        ? currentValues.filter(v => v.value !== option.value)
        : [...currentValues, option];
      onChange?.(newValues);
    } else {
      onChange?.(option);
      setIsOpen(false);
      setSearchQuery('');
    }
    setHighlightedIndex(-1);
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiSelect ? [] : null);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const allOptions = Object.values(groupedOptions).flat();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < allOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : allOptions.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionSelect(allOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (position === 'auto') {
        setDropdownPosition(spaceBelow < 200 && spaceAbove > spaceBelow ? 'top' : 'bottom');
      }
    }
  }, [isOpen, position]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // Gesture handling for mobile
  const gestureHandlers = useGesture({
    onTap: () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    }
  });

  // Animation variants
  const dropdownVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95, 
      y: dropdownPosition === 'top' ? 10 : -10 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: dropdownPosition === 'top' ? 10 : -10,
      transition: { duration: 0.15 }
    }
  };

  const optionVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  const currentTheme = themes[theme] || themes.default;

  // Render selected value(s)
  const renderSelectedValue = () => {
    if (loading) {
      return <span className="text-gray-500">{loadingMessage}</span>;
    }

    if (multiSelect) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) {
        return <span className="text-gray-500">{placeholder}</span>;
      }
      if (selectedValues.length === 1) {
        return renderValue ? renderValue(selectedValues[0]) : selectedValues[0].label;
      }
      return `${selectedValues.length} items selected`;
    }

    if (!value) {
      return <span className="text-gray-500">{placeholder}</span>;
    }

    return renderValue ? renderValue(value) : value.label;
  };

  // Check if option is selected
  const isOptionSelected = (option) => {
    if (multiSelect) {
      const selectedValues = Array.isArray(value) ? value : [];
      return selectedValues.some(v => v.value === option.value);
    }
    return value?.value === option.value;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      {...props}
    >
      {/* Trigger */}
      <motion.button
        type="button"
        className={`
          w-full flex items-center justify-between
          ${sizes[size]}
          ${currentTheme.background}
          ${currentTheme.backdrop}
          ${currentTheme.border}
          ${currentTheme.shadow}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/20'}
          ${error ? 'border-red-400' : ''}
          rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={error ? `${props.id || 'dropdown'}-error` : undefined}
        {...gestureHandlers()}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="flex-1 text-left flex items-center gap-2">
          {renderSelectedValue()}
        </div>
        
        <div className="flex items-center gap-2">
          {clearable && (value || (multiSelect && Array.isArray(value) && value.length > 0)) && (
            <motion.button
              onClick={handleClear}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Clear selection"
            >
              <X size={14} className="text-gray-500" />
            </motion.button>
          )}
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-500" />
          </motion.div>
        </div>
      </motion.button>

      {/* Error message */}
      {error && (
        <p 
          id={`${props.id || 'dropdown'}-error`}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              absolute z-50 w-full mt-1
              ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
              ${currentTheme.dropdown}
              rounded-lg overflow-hidden
              ${maxHeight} overflow-y-auto
              ${dropdownClassName}
            `}
            role="listbox"
            aria-multiselectable={multiSelect}
          >
            {/* Search input */}
            {searchable && (
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="py-1">
              {loading ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  {loadingMessage}
                </div>
              ) : Object.keys(groupedOptions).length === 0 || Object.values(groupedOptions).flat().length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  {noOptionsMessage}
                </div>
              ) : (
                Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    {groupBy && Object.keys(groupedOptions).length > 1 && (
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white/5">
                        {groupName}
                      </div>
                    )}
                    
                    {groupOptions.map((option, optionIndex) => {
                      const globalIndex = Object.values(groupedOptions).flat().indexOf(option);
                      const isSelected = isOptionSelected(option);
                      const isHighlighted = globalIndex === highlightedIndex;

                      return (
                        <motion.button
                          key={`${groupName}-${option.value}`}
                          ref={el => optionRefs.current[globalIndex] = el}
                          variants={optionVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: optionIndex * 0.02 }}
                          className={`
                            w-full flex items-center justify-between px-4 py-2 text-left transition-colors
                            ${isHighlighted ? 'bg-blue-500/20' : 'hover:bg-white/10'}
                            ${isSelected ? 'bg-blue-500/10 text-blue-600' : 'text-gray-700 dark:text-gray-300'}
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${optionClassName}
                          `}
                          onClick={() => !option.disabled && handleOptionSelect(option)}
                          disabled={option.disabled}
                          role="option"
                          aria-selected={isSelected}
                          whileHover={!option.disabled ? { x: 2 } : {}}
                          whileTap={!option.disabled ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {option.icon && (
                              <span className="flex-shrink-0">
                                {typeof option.icon === 'string' ? (
                                  <img src={option.icon} alt="" className="w-4 h-4" />
                                ) : (
                                  option.icon
                                )}
                              </span>
                            )}
                            
                            <div className="flex-1">
                              {renderOption ? renderOption(option) : (
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  {option.description && (
                                    <div className="text-sm text-gray-500">{option.description}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <Check size={16} className="text-blue-600 flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Example usage component
export const GlassDropdownShowcase = () => {
  const [basicValue, setBasicValue] = useState(null);
  const [multiValue, setMultiValue] = useState([]);
  const [searchValue, setSearchValue] = useState(null);

  const basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 'option4', label: 'Option 4' }
  ];

  const searchOptions = [
    { value: 'analytics', label: 'Analytics', description: 'View detailed analytics', category: 'Dashboard' },
    { value: 'users', label: 'User Management', description: 'Manage user accounts', category: 'Admin' },
    { value: 'settings', label: 'Settings', description: 'Configure application', category: 'Admin' },
    { value: 'reports', label: 'Reports', description: 'Generate reports', category: 'Dashboard' },
    { value: 'billing', label: 'Billing', description: 'Manage billing and payments', category: 'Finance' }
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glass Dropdown Showcase</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Dropdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Dropdown</h3>
          <GlassDropdown
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Choose an option"
            theme="analytics"
          />
        </div>

        {/* Multi-select Dropdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-select</h3>
          <GlassDropdown
            options={basicOptions.filter(opt => !opt.disabled)}
            value={multiValue}
            onChange={setMultiValue}
            placeholder="Select multiple"
            theme="dashboard"
            multiSelect={true}
          />
        </div>

        {/* Searchable Dropdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Searchable with Groups</h3>
          <GlassDropdown
            options={searchOptions}
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search options"
            theme="success"
            searchable={true}
            groupBy="category"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Different themes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Different Themes</h3>
          <div className="space-y-3">
            {['default', 'analytics', 'dashboard', 'success', 'danger'].map((theme) => (
              <GlassDropdown
                key={theme}
                options={[{ value: theme, label: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme` }]}
                value={{ value: theme, label: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme` }}
                theme={theme}
                size="small"
                clearable={false}
              />
            ))}
          </div>
        </div>

        {/* States */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Different States</h3>
          <div className="space-y-3">
            <GlassDropdown
              options={basicOptions}
              placeholder="Loading state"
              loading={true}
              theme="analytics"
            />
            <GlassDropdown
              options={basicOptions}
              placeholder="Disabled state"
              disabled={true}
              theme="dashboard"
            />
            <GlassDropdown
              options={basicOptions}
              placeholder="Error state"
              error="Please select an option"
              theme="danger"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features Demonstrated</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• Glass morphism effects with backdrop blur</li>
          <li>• Searchable options with real-time filtering</li>
          <li>• Multi-select functionality with badges</li>
          <li>• Keyboard navigation (Arrow keys, Enter, Escape)</li>
          <li>• Option grouping and categorization</li>
          <li>• Loading states and error handling</li>
          <li>• Gesture support for mobile devices</li>
          <li>• Customizable themes and styling</li>
        </ul>
      </div>
    </div>
  );
};

export default GlassDropdown;