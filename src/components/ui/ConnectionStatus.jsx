import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

const ConnectionStatus = ({ 
  isConnected, 
  connectionStats, 
  error, 
  onReconnect,
  className = '',
  showDetails = false 
}) => {
  const getStatusInfo = () => {
    if (error) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-200',
        text: 'Connection Error',
        description: 'Failed to connect to server'
      };
    }
    
    if (isConnected) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 border-green-200',
        text: 'Connected',
        description: 'Real-time updates active'
      };
    }
    
    return {
      icon: WifiOff,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 border-yellow-200',
      text: 'Reconnecting...',
      description: `Attempt ${connectionStats?.attempts || 0}`
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${status.bgColor} ${className}`}
      >
        <motion.div
          animate={!isConnected && !error ? { rotate: 360 } : { rotate: 0 }}
          transition={{ 
            duration: 2, 
            repeat: !isConnected && !error ? Infinity : 0,
            ease: "linear" 
          }}
        >
          <Icon size={16} className={status.color} />
        </motion.div>
        
        <div className="flex-1">
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
          {showDetails && (
            <div className="text-xs text-gray-500 mt-1">
              {status.description}
              {connectionStats?.lastConnected && (
                <span className="block">
                  Last connected: {new Date(connectionStats.lastConnected).toLocaleTimeString()}
                </span>
              )}
              {connectionStats?.totalMessages > 0 && (
                <span className="block">
                  Messages received: {connectionStats.totalMessages}
                </span>
              )}
            </div>
          )}
        </div>
        
        {error && onReconnect && (
          <button
            onClick={onReconnect}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Retry connection"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;