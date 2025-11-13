import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, CheckCircle, AlertCircle, Mail, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import enhancedApiService from '../../services/enhancedApi';

const RealNotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRealNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadRealNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRealNotifications = async () => {
    try {
      setLoading(true);
      const notifications = [];

      // Load real contact submissions (unread)
      try {
        const contactResponse = await enhancedApiService.get('/admin/analytics/recent-submissions?limit=10');
        if (contactResponse.success && contactResponse.data) {
          contactResponse.data
            .filter(submission => !submission.isRead) // Only unread
            .forEach(submission => {
              notifications.push({
                id: `contact_${submission._id}`,
                type: 'contact',
                title: 'New Contact Submission',
                message: `${submission.name}: ${submission.subject}`,
                timestamp: submission.createdAt,
                unread: true,
                actionUrl: '/admin/contact-submissions',
                icon: Mail,
                data: submission
              });
            });
        }
      } catch (error) {
        console.log('No unread contact submissions');
      }

      // Load real orders (if orders API exists)
      try {
        const ordersResponse = await enhancedApiService.get('/admin/orders/recent?limit=5&unread=true');
        if (ordersResponse.success && ordersResponse.data) {
          ordersResponse.data.forEach(order => {
            notifications.push({
              id: `order_${order._id}`,
              type: 'order',
              title: 'New Order',
              message: `Order #${order.orderNumber} - ৳${order.total}`,
              timestamp: order.createdAt,
              unread: true,
              actionUrl: '/admin/orders',
              icon: ShoppingCart,
              data: order
            });
          });
        }
      } catch (error) {
        console.log('No new orders');
      }

      // Only show notifications if we have real data
      if (notifications.length > 0) {
        // Sort by timestamp (newest first)
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setNotifications(notifications.slice(0, 10)); // Limit to 10
        setUnreadCount(notifications.filter(n => n.unread).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading real notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId, actionUrl) => {
    // Update local state
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Navigate to action URL if provided
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && notification.unread ? Math.max(0, prev - 1) : prev;
    });
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon || Bell;
    const colorClass = notification.unread ? 'text-blue-500' : 'text-gray-400';
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  // Don't render if no real notifications
  if (notifications.length === 0 && !loading) {
    return (
      <div className="relative">
        <Bell className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>All caught up!</p>
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id, notification.actionUrl)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`text-sm font-medium ${
                                  notification.unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Dismiss"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                  <button
                    onClick={loadRealNotifications}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealNotificationSystem;