import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Mail, 
  Users, 
  ShoppingCart, 
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Mock real-time notifications (replace with actual WebSocket/SSE implementation)
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'contact',
        title: 'New Contact Submission',
        message: 'John Doe submitted a support inquiry',
        timestamp: new Date(),
        priority: 'high',
        read: false,
        action: {
          label: 'View',
          href: '/admin/contact-submissions'
        }
      },
      {
        id: '2',
        type: 'order',
        title: 'New Order Received',
        message: 'Order #1234 placed by customer@example.com',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        priority: 'medium',
        read: false,
        action: {
          label: 'View Order',
          href: '/admin/orders'
        }
      }
    ];

    // Simulate receiving notifications
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getNotificationIcon = (type) => {
    const iconMap = {
      contact: Mail,
      order: ShoppingCart,
      user: Users,
      system: Info,
      alert: AlertCircle,
      success: CheckCircle,
      analytics: TrendingUp
    };
    
    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="w-5 h-5" />;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'from-red-500/20 to-pink-500/20 border-red-400/30';
    if (priority === 'medium') return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
    if (priority === 'low') return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
    
    const colorMap = {
      contact: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
      order: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30',
      user: 'from-purple-500/20 to-violet-500/20 border-purple-400/30',
      system: 'from-gray-500/20 to-slate-500/20 border-gray-400/30'
    };
    
    return colorMap[type] || 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]"
    >
      <GlassCard className="p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-white/90"
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-white/60">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <motion.button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-4 border-b border-white/10 last:border-b-0 cursor-pointer
                  transition-all duration-200 hover:bg-white/5
                  ${notification.read ? 'opacity-60' : ''}
                `}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg bg-gradient-to-br ${getNotificationColor(notification.type, notification.priority)}
                    border flex-shrink-0
                  `}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-sm truncate">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-white/50 ml-2 flex-shrink-0">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-xs leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {notification.action && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = notification.action.href;
                          }}
                          className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-400/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {notification.action.label}
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="text-xs text-white/50 hover:text-white/80 ml-auto"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}