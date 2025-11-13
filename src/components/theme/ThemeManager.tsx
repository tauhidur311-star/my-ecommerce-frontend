import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Snowflake, Flower, Leaf, Heart } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'auto';
type SeasonalTheme = 'default' | 'winter' | 'spring' | 'summer' | 'autumn' | 'valentine' | 'christmas';

interface ThemeConfig {
  mode: ThemeMode;
  seasonal: SeasonalTheme;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface ThemeContextType {
  theme: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setSeasonalTheme: (seasonal: SeasonalTheme) => void;
  toggleTheme: () => void;
  isThemeMenuOpen: boolean;
  setIsThemeMenuOpen: (open: boolean) => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  seasonal: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif'
  },
  borderRadius: '0.5rem',
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};

const seasonalThemes: Record<SeasonalTheme, Partial<ThemeConfig['colors']>> = {
  default: {},
  winter: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#e0e7ff',
    background: '#f8fafc',
    surface: '#ffffff'
  },
  spring: {
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#fbbf24',
    background: '#f0fdf4',
    surface: '#ffffff'
  },
  summer: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fb7185',
    background: '#fffbeb',
    surface: '#ffffff'
  },
  autumn: {
    primary: '#dc2626',
    secondary: '#ea580c',
    accent: '#d97706',
    background: '#fef2f2',
    surface: '#ffffff'
  },
  valentine: {
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#fbbf24',
    background: '#fdf2f8',
    surface: '#ffffff'
  },
  christmas: {
    primary: '#dc2626',
    secondary: '#16a34a',
    accent: '#fbbf24',
    background: '#fef2f2',
    surface: '#ffffff'
  }
};

const darkModeOverrides: Partial<ThemeConfig['colors']> = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  const [seasonalTheme, setSeasonalThemeState] = useState<SeasonalTheme>(() => {
    const saved = localStorage.getItem('seasonal-theme');
    return (saved as SeasonalTheme) || 'default';
  });

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-detect seasonal theme based on date
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();

    let autoSeasonal: SeasonalTheme = 'default';

    // Christmas season (December 1-31)
    if (month === 11) {
      autoSeasonal = 'christmas';
    }
    // Valentine's season (February 1-14)
    else if (month === 1 && date <= 14) {
      autoSeasonal = 'valentine';
    }
    // Spring (March-May)
    else if (month >= 2 && month <= 4) {
      autoSeasonal = 'spring';
    }
    // Summer (June-August)
    else if (month >= 5 && month <= 7) {
      autoSeasonal = 'summer';
    }
    // Autumn (September-November)
    else if (month >= 8 && month <= 10) {
      autoSeasonal = 'autumn';
    }
    // Winter (December-February)
    else {
      autoSeasonal = 'winter';
    }

    // Only auto-set if user hasn't manually selected a theme
    const savedSeasonal = localStorage.getItem('seasonal-theme');
    if (!savedSeasonal && seasonalTheme === 'default') {
      setSeasonalThemeState(autoSeasonal);
    }
  }, [seasonalTheme]);

  // Calculate effective theme mode
  const effectiveMode = themeMode === 'auto' ? systemTheme : themeMode;

  // Build complete theme configuration
  const theme: ThemeConfig = {
    ...defaultTheme,
    mode: themeMode,
    seasonal: seasonalTheme,
    colors: {
      ...defaultTheme.colors,
      ...seasonalThemes[seasonalTheme],
      ...(effectiveMode === 'dark' ? darkModeOverrides : {})
    }
  };

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);
    root.style.setProperty('--border-radius', theme.borderRadius);

    // Apply dark mode class
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply seasonal theme class
    document.documentElement.className = document.documentElement.className
      .replace(/seasonal-\w+/g, '');
    document.documentElement.classList.add(`seasonal-${seasonalTheme}`);

  }, [theme, effectiveMode, seasonalTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const setSeasonalTheme = (seasonal: SeasonalTheme) => {
    setSeasonalThemeState(seasonal);
    localStorage.setItem('seasonal-theme', seasonal);
  };

  const toggleTheme = () => {
    const newMode = effectiveMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const value: ThemeContextType = {
    theme,
    setThemeMode,
    setSeasonalTheme,
    toggleTheme,
    isThemeMenuOpen,
    setIsThemeMenuOpen
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors ${
        isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'
      } hover:bg-opacity-80 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

// Theme Menu Component
export const ThemeMenu: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { 
    theme, 
    setThemeMode, 
    setSeasonalTheme, 
    isThemeMenuOpen, 
    setIsThemeMenuOpen 
  } = useTheme();

  const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'auto', label: 'Auto', icon: <Palette size={16} /> }
  ];

  const seasonalOptions: { value: SeasonalTheme; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'default', label: 'Default', icon: <Palette size={16} />, color: '#3b82f6' },
    { value: 'winter', label: 'Winter', icon: <Snowflake size={16} />, color: '#0ea5e9' },
    { value: 'spring', label: 'Spring', icon: <Flower size={16} />, color: '#10b981' },
    { value: 'summer', label: 'Summer', icon: <Sun size={16} />, color: '#f59e0b' },
    { value: 'autumn', label: 'Autumn', icon: <Leaf size={16} />, color: '#dc2626' },
    { value: 'valentine', label: 'Valentine', icon: <Heart size={16} />, color: '#ec4899' },
    { value: 'christmas', label: 'Christmas', icon: <Snowflake size={16} />, color: '#dc2626' }
  ];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-opacity-80 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette size={20} />
      </motion.button>

      <AnimatePresence>
        {isThemeMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsThemeMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Theme Settings
              </h3>

              {/* Theme Mode */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appearance
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {themeModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setThemeMode(mode.value)}
                      className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-all ${
                        theme.mode === mode.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {mode.icon}
                      <span className="text-xs font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasonal Themes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seasonal Themes
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {seasonalOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSeasonalTheme(option.value)}
                      className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                        theme.seasonal === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      style={{
                        color: theme.seasonal === option.value ? option.color : undefined
                      }}
                    >
                      {option.icon}
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Preview
                </h4>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeProvider;