import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell = ({ className = '' }) => {
  const { unreadCount } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`relative p-2 rounded-lg transition-colors hover:bg-gray-100 ${className}`}
          title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell size={20} className="text-gray-600 hover:text-gray-900" />
          
          {unreadCount > 0 && (
            <>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              
              {/* Pulsing animation for new notifications */}
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] animate-ping opacity-75"></span>
            </>
          )}
        </button>
      </div>

      <NotificationPanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)} 
      />
    </>
  );
};

export default NotificationBell;