import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import socketService from '../../services/socketService';

const NotificationToast = ({ position = 'top-right' }) => {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('notificationSounds') !== 'false';
  });

  useEffect(() => {
    // Connect to socket and listen for notifications
    const connectSocket = async () => {
      try {
        await socketService.connect();
        
        // Listen for real-time notifications
        const unsubscribeNotification = socketService.addListener('notification', (data) => {
          addNotification(data);
          
          // Play sound if enabled
          if (soundEnabled) {
            playNotificationSound(data.type);
          }
        });

        // Listen for admin announcements
        const unsubscribeAnnouncement = socketService.addListener('adminAnnouncement', (data) => {
          addNotification({
            ...data,
            title: `Announcement from ${data.from}`,
            priority: 'high'
          });
          
          if (soundEnabled) {
            playNotificationSound('announcement');
          }
        });

        // Listen for dashboard updates
        const unsubscribeDashboard = socketService.addListener('dashboardUpdate', (data) => {
          if (data.type === 'alert') {
            addNotification({
              title: 'Dashboard Alert',
              message: data.message,
              type: 'warning',
              priority: 'normal'
            });
          }
        });

        return () => {
          unsubscribeNotification();
          unsubscribeAnnouncement();
          unsubscribeDashboard();
        };
      } catch (error) {
        console.error('Failed to connect socket for notifications:', error);
      }
    };

    connectSocket();
  }, [soundEnabled]);

  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || Date.now() + Math.random(),
      title: notification.title || 'Notification',
      message: notification.message,
      type: notification.type || 'info',
      priority: notification.priority || 'normal',
      actionUrl: notification.actionUrl,
      timestamp: notification.createdAt || new Date().toISOString(),
      duration: getNotificationDuration(notification.priority, notification.type)
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, newNotification.duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationDuration = (priority, type) => {
    if (type === 'error' || priority === 'high') return 8000; // 8 seconds
    if (type === 'warning') return 6000; // 6 seconds
    return 4000; // 4 seconds for info/success
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type, priority) => {
    let baseStyles = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg";
    
    switch (type) {
      case 'success':
        baseStyles += " border-l-4 border-l-green-500";
        break;
      case 'error':
        baseStyles += " border-l-4 border-l-red-500";
        break;
      case 'warning':
        baseStyles += " border-l-4 border-l-yellow-500";
        break;
      case 'info':
      default:
        baseStyles += " border-l-4 border-l-blue-500";
        break;
    }

    if (priority === 'high') {
      baseStyles += " ring-2 ring-red-500 ring-opacity-50";
    }

    return baseStyles;
  };

  const playNotificationSound = (type) => {
    try {
      let soundFile;
      switch (type) {
        case 'error':
          soundFile = '/sounds/error.mp3';
          break;
        case 'success':
          soundFile = '/sounds/success.mp3';
          break;
        case 'warning':
          soundFile = '/sounds/warning.mp3';
          break;
        case 'announcement':
          soundFile = '/sounds/announcement.mp3';
          break;
        default:
          soundFile = '/sounds/notification.mp3';
      }

      const audio = new Audio(soundFile);
      audio.volume = 0.3; // Set volume to 30%
      audio.play().catch(() => {
        // Ignore play errors (user hasn't interacted with page yet)
      });
    } catch (error) {
      // Ignore sound errors
    }
  };

  const toggleSounds = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notificationSounds', newSoundEnabled.toString());
    
    // Test sound when enabling
    if (newSoundEnabled) {
      playNotificationSound('info');
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
    removeNotification(notification.id);
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      {/* Sound toggle button */}
      <button
        onClick={toggleSounds}
        className={`fixed bottom-4 left-4 z-40 p-2 rounded-full shadow-lg transition-colors ${
          soundEnabled 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
        title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
      >
        <Bell className="w-4 h-4" />
      </button>

      {/* Notification container */}
      <div className={`fixed ${positionClasses[position]} z-50 space-y-3 max-w-sm w-full pointer-events-none`}>
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`pointer-events-auto cursor-pointer ${getNotificationStyles(notification.type, notification.priority)} rounded-lg p-4 max-w-sm`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.priority === 'high' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-2">
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: notification.duration / 1000, ease: "linear" }}
                    className={`h-1 rounded-full ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotificationToast;