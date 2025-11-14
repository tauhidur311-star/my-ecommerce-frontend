/**
 * Presence Indicator Component
 * Shows online collaborators and connection status
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff, ChevronDown, Crown, Eye } from 'lucide-react';
import { usePresenceIndicator } from '../../hooks/useCollaboration';

interface PresenceIndicatorProps {
  designId?: string;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ designId }) => {
  const { isConnected, collaboratorCount, collaborators } = usePresenceIndicator(designId);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    return collaboratorCount > 0 ? 'text-green-500' : 'text-yellow-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (collaboratorCount === 0) return 'Working alone';
    return `${collaboratorCount} collaborator${collaboratorCount > 1 ? 's' : ''} online`;
  };

  return (
    <div className="relative">
      {/* Main presence button */}
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
          ${isConnected 
            ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm' 
            : 'bg-red-50 border-red-200'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Connection status icon */}
        <div className="relative">
          {isConnected ? (
            <Wifi className={`w-4 h-4 ${getStatusColor()}`} />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          
          {/* Pulse animation for connected state */}
          {isConnected && (
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400 opacity-75"
              animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Collaborator avatars */}
        {collaborators.length > 0 && (
          <div className="flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator, index) => (
              <motion.div
                key={collaborator.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: collaborator.color }}
                  title={collaborator.name}
                >
                  {collaborator.avatar ? (
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    collaborator.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </motion.div>
            ))}
            
            {/* Show count if more than 3 */}
            {collaborators.length > 3 && (
              <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  +{collaborators.length - 3}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Users icon for empty state */}
        {collaborators.length === 0 && isConnected && (
          <Users className="w-4 h-4 text-gray-400" />
        )}

        {/* Status text */}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>

        {/* Dropdown arrow */}
        <motion.div
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Detailed collaborator list */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Collaboration Status
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Real-time collaboration is {isConnected ? 'active' : 'inactive'}
              </p>
            </div>

            {/* Connection status */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Connection</span>
                <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                  {isConnected ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span className="text-xs font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span className="text-xs font-medium">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Collaborator list */}
            <div className="max-h-64 overflow-y-auto">
              {collaborators.length > 0 ? (
                <div className="py-2">
                  {collaborators.map((collaborator, index) => (
                    <motion.div
                      key={collaborator.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center px-4 py-3 hover:bg-gray-50"
                    >
                      {/* Avatar */}
                      <div className="relative mr-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.avatar ? (
                            <img
                              src={collaborator.avatar}
                              alt={collaborator.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            collaborator.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        {/* Online indicator */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {collaborator.name}
                          </p>
                          
                          {/* Role indicators */}
                          <div className="ml-2 flex space-x-1">
                            <Crown className="w-3 h-3 text-yellow-500" title="Owner" />
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-1">
                          {collaborator.isEditing ? (
                            <span className="text-xs text-blue-600 flex items-center">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-blue-500 rounded-full mr-1"
                              />
                              Editing section
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              Viewing
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Last seen */}
                      <div className="text-xs text-gray-400">
                        Now
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No other collaborators</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Share this design to collaborate in real-time
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Invite Collaborators
                </button>
                
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  View History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PresenceIndicator;