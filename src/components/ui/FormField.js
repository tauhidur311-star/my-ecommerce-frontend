import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Base Input Component
export const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className = '',
  error,
  success,
  helpText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = error;
  const hasSuccess = success && !hasError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : hasSuccess 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
        
        {hasSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      
      {(hasError || helpText) && (
        <div className="text-sm">
          {hasError && (
            <p className="text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {helpText && !hasError && (
            <p className="text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  error,
  success,
  helpText,
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props
}) => {
  const hasError = error;
  const hasSuccess = success && !hasError;
  const charCount = value ? value.length : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 resize-vertical
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : hasSuccess 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
      </div>
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {hasError && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {helpText && !hasError && (
            <p className="text-gray-500 text-sm flex items-center">
              <Info className="w-4 h-4 mr-1 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>
        
        {showCharCount && maxLength && (
          <p className={`text-sm ml-2 ${
            charCount > maxLength * 0.9 
              ? charCount >= maxLength 
                ? 'text-red-500' 
                : 'text-yellow-500'
              : 'text-gray-500'
          }`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  error,
  success,
  helpText,
  ...props
}) => {
  const hasError = error;
  const hasSuccess = success && !hasError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 appearance-none bg-white
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : hasSuccess 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={typeof option === 'object' ? option.value : option} 
              value={typeof option === 'object' ? option.value : option}
            >
              {typeof option === 'object' ? option.label : option}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(hasError || helpText) && (
        <div className="text-sm">
          {hasError && (
            <p className="text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {helpText && !hasError && (
            <p className="text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  required = false,
  className = '',
  error,
  helpText,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            name={name}
            checked={checked || false}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}
      </div>
      
      {(error || helpText) && (
        <div className="ml-7 text-sm">
          {error && (
            <p className="text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {helpText && !error && (
            <p className="text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  Input,
  Textarea,
  Select,
  Checkbox
};