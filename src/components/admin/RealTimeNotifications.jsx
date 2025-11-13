import React, { useState, useEffect } from 'react';
import { Bell, Mail, ShoppingCart, Users, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import enhancedApiService from '../../services/enhancedApi';
import socketService from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    setupSocketListeners();
    
    return () => {
      // Cleanup socket listeners if needed
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load recent contact submissions
      const contactResponse = await enhancedApiService.get('/admin/analytics/recent-submissions?limit=10');
      
      // Load notifications from the notification API
      const notificationResponse = await enhancedApiService.get('/admin/notifications/analytics');
      
      const notifications = [];
      
      // Add contact submissions as notifications
      if (contactResponse.success && contactResponse.data) {
        contactResponse.data.forEach(submission => {
          notifications.push({
            id: `contact_${submission._id}`,
            type: 'contact',
            title: 'New Contact Submission',
            message: `${submission.name} sent a message: "${submission.subject}"`,
            timestamp: submission.createdAt,
            read: false,
            data: submission,
            icon: Mail,
            color: 'blue'
          });
        });
      }
      
      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Take only the most recent 20
      setNotifications(notifications.slice(0, 20));
      setUnreadCount(notifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = async () => {
    try {
      await socketService.connect();
      
      // Listen for new contact submissions
      socketService.addListener('new-submission', (data) => {
        const newNotification = {
          id: `contact_${data.id}`,
          type: 'contact',
          title: 'New Contact Submission',
          message: `${data.name} sent a message: "${data.subject}"`,
          timestamp: data.submittedAt,
          read: false,
          data: data,
          icon: Mail,
          color: 'blue'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Contact Submission', {
            body: `${data.name}: ${data.subject}`,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for new orders (if order system exists)
      socketService.addListener('new-order', (data) => {
        const newNotification = {
          id: `order_${data.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${data.orderNumber} from ${data.customerName}`,
          timestamp: new Date(),
          read: false,
          data: data,
          icon: ShoppingCart,
          color: 'green'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      });

      // Listen for general admin notifications
      socketService.addListener('adminAnnouncement', (data) => {
        const newNotification = {
          id: `announcement_${Date.now()}`,
          type: 'announcement',
          title: data.title || 'Admin Announcement',
          message: data.message,
          timestamp: new Date(),
          read: false,
          data: data,
          icon: AlertCircle,
          color: 'purple'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      });
      
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Handle different notification types
    switch (notification.type) {
      case 'contact':
        // Could navigate to contact submissions page
        console.log('Navigate to contact submissions');
        break;
      case 'order':
        // Could navigate to orders page
        console.log('Navigate to orders page');
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon || Bell;
    return <IconComponent className="w-5 h-5" />;
  };

  const getNotificationColor = (notification) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
    };
    return colors[notification.color] || 'bg-gray-500';
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notifications Panel */}
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
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full text-white ${getNotificationColor(notification)}`}>
                            {getNotificationIcon(notification)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              
                              <div className="flex space-x-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-green-600"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Remove"
                                >
                                  <X className="w-4 h-4" />
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
                    onClick={() => {
                      loadNotifications();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Refresh notifications
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

export default RealTimeNotifications;