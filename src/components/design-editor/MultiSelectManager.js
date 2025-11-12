import React from 'react';
import { Trash2, Copy, Move, Eye, EyeOff } from 'lucide-react';

const MultiSelectManager = ({ 
  selectedSections, 
  onDeleteSelected, 
  onCopySelected,
  onToggleVisibility,
  onMoveSelected,
  onClearSelection 
}) => {
  if (selectedSections.length === 0) return null;

  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedSections.length} selected sections?`)) {
          onDeleteSelected(selectedSections);
        }
        break;
      case 'copy':
        onCopySelected(selectedSections);
        break;
      case 'hide':
        onToggleVisibility(selectedSections, true);
        break;
      case 'show':
        onToggleVisibility(selectedSections, false);
        break;
      default:
        break;
    }
  };

  const hasVisibleSections = selectedSections.some(section => !section.settings?.hidden);
  const hasHiddenSections = selectedSections.some(section => section.settings?.hidden);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white shadow-2xl rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Selection count */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{selectedSections.length}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('copy')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copy selected sections"
            >
              <Copy className="w-4 h-4" />
            </button>

            {hasVisibleSections && (
              <button
                onClick={() => handleBulkAction('hide')}
                className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Hide selected sections"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            )}

            {hasHiddenSections && (
              <button
                onClick={() => handleBulkAction('show')}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Show selected sections"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleBulkAction('delete')}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete selected sections"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Clear selection */}
            <button
              onClick={onClearSelection}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectManager;