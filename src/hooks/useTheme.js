import { useState, useEffect } from 'react';
import cookieManager from '../utils/cookieManager';

export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get theme from cookie on mount
    const savedTheme = cookieManager.getTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    // Apply to document
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : 'light-theme';
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b3b3b3');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#212529');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--border-color', '#dee2e6');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    cookieManager.setTheme(newTheme);
    applyTheme(newTheme);
  };

  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
    cookieManager.setTheme(newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

export default useTheme;