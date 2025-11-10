import React from 'react';
import { ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';

export default function SoldNumbersToggle({ 
  productId, 
  currentValue, 
  soldCount,
  onToggle 
}) {
  const handleToggle = () => {
    onToggle(productId, !currentValue);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Show Sold Numbers ({soldCount || 0})
        </span>
      </div>
      
      <button
        onClick={handleToggle}
        className={`p-1 rounded-full transition-colors ${
          currentValue 
            ? 'text-green-600 hover:text-green-700' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {currentValue ? (
          <ToggleRight size={24} />
        ) : (
          <ToggleLeft size={24} />
        )}
      </button>
      
      <span className={`text-xs font-medium ${
        currentValue ? 'text-green-600' : 'text-gray-500'
      }`}>
        {currentValue ? 'Visible' : 'Hidden'}
      </span>
    </div>
  );
}