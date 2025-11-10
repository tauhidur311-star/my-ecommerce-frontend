import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const useKeyboardShortcuts = ({ 
  onNewProduct = () => {}, 
  onSaveProduct = () => {}, 
  onSearch = () => {}, 
  onToggleTab = () => {},
  onExportData = () => {},
  onRefresh = () => {},
  isFormOpen = false,
  currentTab = 'products'
}) => {
  const showShortcutsHelp = useCallback(() => {
    const shortcuts = [
      { keys: 'Ctrl + N', action: 'Add New Product' },
      { keys: 'Ctrl + S', action: 'Save Product (when form is open)' },
      { keys: 'Ctrl + K', action: 'Focus Search' },
      { keys: 'Ctrl + 1', action: 'Switch to Products Tab' },
      { keys: 'Ctrl + 2', action: 'Switch to Orders Tab' },
      { keys: 'Ctrl + 3', action: 'Switch to Analytics Tab' },
      { keys: 'Ctrl + 4', action: 'Switch to Settings Tab' },
      { keys: 'Ctrl + E', action: 'Export Data' },
      { keys: 'Ctrl + R', action: 'Refresh Data' },
      { keys: 'Escape', action: 'Close Modal/Form' },
      { keys: 'Ctrl + ?', action: 'Show This Help' }
    ];

    const helpContent = shortcuts
      .map(shortcut => `${shortcut.keys}: ${shortcut.action}`)
      .join('\n');

    // Create a custom toast with longer duration for shortcuts help
    toast(
      (t) => (
        <div className="max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Keyboard Shortcuts</h4>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-xs space-y-1 font-mono">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-blue-600 font-semibold">{shortcut.keys}</span>
                <span className="text-gray-600">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: 'top-center',
        style: {
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }
      }
    );
  }, []);

  const handleKeyDown = useCallback((event) => {
    const { ctrlKey, metaKey, key, target } = event;
    const isModifierPressed = ctrlKey || metaKey;

    // Don't trigger shortcuts when typing in input fields (except for specific shortcuts)
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true';

    // Global shortcuts that work even in input fields
    if (isModifierPressed) {
      switch (key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          onSearch();
          toast.success('Search focused', { duration: 1500, icon: '🔍' });
          break;
        
        case 's':
          if (isFormOpen) {
            event.preventDefault();
            onSaveProduct();
            toast.success('Product saved', { duration: 1500, icon: '💾' });
          }
          break;
        
        case 'n':
          if (!isInputField) {
            event.preventDefault();
            onNewProduct();
            toast.success('New product form opened', { duration: 1500, icon: '➕' });
          }
          break;
        
        case 'e':
          if (!isInputField) {
            event.preventDefault();
            onExportData();
            toast.success('Export initiated', { duration: 1500, icon: '📥' });
          }
          break;
        
        case 'r':
          if (!isInputField) {
            event.preventDefault();
            onRefresh();
            toast.success('Data refreshed', { duration: 1500, icon: '🔄' });
          }
          break;
        
        case '1':
          if (!isInputField) {
            event.preventDefault();
            onToggleTab('products');
            toast.success('Switched to Products', { duration: 1000, icon: '📦' });
          }
          break;
        
        case '2':
          if (!isInputField) {
            event.preventDefault();
            onToggleTab('orders');
            toast.success('Switched to Orders', { duration: 1000, icon: '📋' });
          }
          break;
        
        case '3':
          if (!isInputField) {
            event.preventDefault();
            onToggleTab('analytics');
            toast.success('Switched to Analytics', { duration: 1000, icon: '📊' });
          }
          break;
        
        case '4':
          if (!isInputField) {
            event.preventDefault();
            onToggleTab('settings');
            toast.success('Switched to Settings', { duration: 1000, icon: '⚙️' });
          }
          break;
        
        case '/':
        case '?':
          if (!isInputField) {
            event.preventDefault();
            showShortcutsHelp();
          }
          break;
      }
    }

    // Escape key to close modals/forms
    if (key === 'Escape' && !isInputField) {
      if (isFormOpen) {
        event.preventDefault();
        onNewProduct(); // This should close the form
        toast.success('Form closed', { duration: 1000, icon: '❌' });
      }
    }

    // Arrow key navigation for better UX
    if (!isInputField && !isModifierPressed) {
      switch (key) {
        case 'ArrowLeft':
          // Navigate to previous tab
          const tabs = ['products', 'orders', 'analytics', 'settings'];
          const currentIndex = tabs.indexOf(currentTab);
          if (currentIndex > 0) {
            onToggleTab(tabs[currentIndex - 1]);
          }
          break;
        
        case 'ArrowRight':
          // Navigate to next tab
          const tabsRight = ['products', 'orders', 'analytics', 'settings'];
          const currentIndexRight = tabsRight.indexOf(currentTab);
          if (currentIndexRight < tabsRight.length - 1) {
            onToggleTab(tabsRight[currentIndexRight + 1]);
          }
          break;
      }
    }
  }, [
    onNewProduct, 
    onSaveProduct, 
    onSearch, 
    onToggleTab, 
    onExportData, 
    onRefresh, 
    isFormOpen, 
    currentTab, 
    showShortcutsHelp
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Show shortcuts help on component mount (optional)
  useEffect(() => {
    const hasSeenShortcuts = localStorage.getItem('hasSeenKeyboardShortcuts');
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        toast(
          'Press Ctrl + ? to see keyboard shortcuts',
          { 
            duration: 4000, 
            icon: '⌨️',
            style: {
              background: '#dbeafe',
              color: '#1e40af'
            }
          }
        );
        localStorage.setItem('hasSeenKeyboardShortcuts', 'true');
      }, 2000);
    }
  }, []);

  return {
    showShortcutsHelp
  };
};

export default useKeyboardShortcuts;