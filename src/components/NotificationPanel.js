import React from 'react';
import { 
  Bell, Package, ShoppingCart, AlertCircle, CheckCircle, Info, 
  X, Trash2, Check, Clock 
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();

  const getIcon = (type, icon) => {
    const iconMap = {
      package: Package,
      check: CheckCircle,
      alert: AlertCircle,
      info: Info,
      cart: ShoppingCart
    };

    const IconComponent = iconMap[icon] || Bell;
    
    const colorMap = {
      order: 'text-blue-600',
      inventory: 'text-yellow-600',
      product: 'text-green-600',
      wishlist: 'text-purple-600',
      system: 'text-gray-600'
    };

    return <IconComponent size={20} className={colorMap[type] || 'text-gray-600'} />;
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'normal':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <MarkAsRead size={14} />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bell size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                You're all caught up! Notifications will appear here when you have updates.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedNotifications).map(([date, notificationsForDate]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white">
                    {new Date(date).toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : new Date(date).toLocaleDateString('en-BD', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                    }
                  </h3>
                  
                  <div className="space-y-3">
                    {notificationsForDate.map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative rounded-lg border ${getPriorityStyles(notification.priority)} ${
                          notification.read ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getIcon(notification.type, notification.icon)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-medium ${
                                  notification.read ? 'text-gray-600' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                  <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              
                              <p className={`text-sm ${
                                notification.read ? 'text-gray-500' : 'text-gray-700'
                              } mb-2`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock size={12} />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Notifications are stored locally and will persist across sessions.
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;