import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const AdminThemeToggle = () => {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'auto', name: 'Auto', icon: Monitor }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            theme === id
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title={`Switch to ${name} theme`}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{name}</span>
        </button>
      ))}
    </div>
  );
};

export default AdminThemeToggle;