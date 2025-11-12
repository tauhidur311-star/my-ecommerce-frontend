import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

const ShortcutsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Save draft' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Publish template' },
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)' },
        { keys: ['Escape'], description: 'Deselect all / Close modals' },
        { keys: ['?'], description: 'Show this help' }
      ]
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['1'], description: 'Switch to Sections tab' },
        { keys: ['2'], description: 'Switch to Layers tab' },
        { keys: ['3'], description: 'Switch to Assets tab' },
        { keys: ['Tab'], description: 'Navigate between sections' },
        { keys: ['Shift', 'Tab'], description: 'Navigate backwards' }
      ]
    },
    {
      category: 'Sections',
      items: [
        { keys: ['Ctrl', 'A'], description: 'Select all sections' },
        { keys: ['Delete'], description: 'Delete selected section(s)' },
        { keys: ['Ctrl', 'C'], description: 'Copy section' },
        { keys: ['Ctrl', 'V'], description: 'Paste section' },
        { keys: ['Ctrl', 'D'], description: 'Duplicate section' },
        { keys: ['↑', '↓'], description: 'Move section up/down' }
      ]
    },
    {
      category: 'Quick Add',
      items: [
        { keys: ['H'], description: 'Add Hero section' },
        { keys: ['P'], description: 'Add Product Grid section' },
        { keys: ['I'], description: 'Add Image Text section' },
        { keys: ['T'], description: 'Add Testimonials section' },
        { keys: ['F'], description: 'Add Footer section' },
        { keys: ['C'], description: 'Add Custom HTML section' }
      ]
    },
    {
      category: 'Preview',
      items: [
        { keys: ['D'], description: 'Desktop preview' },
        { keys: ['M'], description: 'Mobile preview' },
        { keys: ['Ctrl', 'P'], description: 'Toggle preview mode' },
        { keys: ['Space'], description: 'Quick preview' }
      ]
    }
  ];

  const getKeyDisplay = (key) => {
    const keyMap = {
      'Ctrl': '⌘', // Show Cmd symbol on Mac, Ctrl on others
      'Shift': '⇧',
      'Alt': '⌥',
      'Delete': '⌫',
      'Escape': 'Esc',
      'Space': '␣',
      '↑': '↑',
      '↓': '↓'
    };

    return keyMap[key] || key;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.description}</span>
                      <div className="flex items-center space-x-1">
                        {item.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                              {getKeyDisplay(key)}
                            </kbd>
                            {keyIndex < item.keys.length - 1 && (
                              <span className="text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Most shortcuts work only when not typing in input fields. 
              Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">?</kbd> anytime to show this help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsPanel;