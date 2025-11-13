import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Mail, 
  Archive, 
  Eye, 
  MoreHorizontal,
  AlertTriangle,
  X
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import FloatingWidget from '../ui/FloatingWidget';

export default function BulkActionToolbar({ 
  selectedItems = [], 
  onSelectAll, 
  onDeselectAll, 
  onBulkAction, 
  totalItems = 0,
  isLoading = false 
}) {
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount > 0 && selectedCount === totalItems;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalItems;

  const handleSelectToggle = () => {
    if (isAllSelected || isPartiallySelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleBulkAction = async (action) => {
    if (confirmAction === action) {
      // Execute the action
      await onBulkAction(action, selectedItems);
      setConfirmAction(null);
      setShowActions(false);
    } else {
      // Request confirmation
      setConfirmAction(action);
    }
  };

  const bulkActions = [
    {
      id: 'markRead',
      label: 'Mark as Read',
      icon: <Eye className="w-4 h-4" />,
      variant: 'info',
      description: 'Mark selected submissions as read'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      variant: 'warning',
      description: 'Move selected submissions to archive'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      description: 'Permanently delete selected submissions',
      requiresConfirmation: true
    }
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Main Bulk Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <GlassCard className="px-6 py-4 flex items-center gap-4 min-w-max shadow-xl">
          {/* Select All Checkbox */}
          <motion.button
            onClick={handleSelectToggle}
            className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-400" />
              ) : isPartiallySelected ? (
                <div className="w-5 h-5 border-2 border-blue-400 rounded bg-blue-400/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>
              ) : (
                <Square className="w-5 h-5" />
              )}
            </div>
            <span className="font-medium">
              {selectedCount} of {totalItems} selected
            </span>
          </motion.button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {bulkActions.slice(0, 2).map((action) => (
              <motion.button
                key={action.id}
                onClick={() => handleBulkAction(action.id)}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
                  text-white/90 hover:text-white
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}

            {/* More Actions */}
            <motion.button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Close Button */}
          <motion.button
            onClick={onDeselectAll}
            className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </GlassCard>
      </motion.div>

      {/* Expanded Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-36 left-1/2 transform -translate-x-1/2 z-50"
          >
            <GlassCard className="p-4 min-w-max">
              <div className="space-y-2">
                {bulkActions.map((action) => {
                  const isConfirming = confirmAction === action.id;
                  
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleBulkAction(action.id)}
                      disabled={isLoading}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
                        ${isConfirming ? 'bg-red-500/20 border border-red-400/30' : ''}
                        text-white/90 hover:text-white
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`
                        p-2 rounded-lg
                        ${action.variant === 'danger' ? 'bg-red-500/20 text-red-400' : ''}
                        ${action.variant === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${action.variant === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                      `}>
                        {action.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">
                          {isConfirming ? (
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              Confirm {action.label}?
                            </span>
                          ) : (
                            action.label
                          )}
                        </div>
                        <div className="text-xs text-white/60">
                          {isConfirming ? 
                            'Click again to confirm this action' : 
                            action.description
                          }
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
              />
              <p className="text-white/90 font-medium">Processing {selectedCount} items...</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Checkbox component for individual rows
export function SelectionCheckbox({ 
  checked, 
  onChange, 
  disabled = false,
  className = "" 
}) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      disabled={disabled}
      className={`
        p-1 rounded transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
    >
      {checked ? (
        <CheckSquare className="w-5 h-5 text-blue-400" />
      ) : (
        <Square className="w-5 h-5 text-white/60 hover:text-white/80" />
      )}
    </motion.button>
  );
}