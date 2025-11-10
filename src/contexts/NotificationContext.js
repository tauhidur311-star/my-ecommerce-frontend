import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, Package, ShoppingCart, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast.custom((t) => (
      <NotificationToast 
        notification={newNotification} 
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 5000,
      position: 'top-right'
    });

    return newNotification.id;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Predefined notification types with templates
  const notificationTemplates = {
    orderPlaced: (orderNumber) => ({
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order ${orderNumber} has been placed successfully.`,
      priority: 'normal',
      icon: 'package'
    }),
    
    orderConfirmed: (orderNumber) => ({
      type: 'order',
      title: 'Order Confirmed',
      message: `Your order ${orderNumber} has been confirmed and is being processed.`,
      priority: 'normal',
      icon: 'check'
    }),
    
    orderShipped: (orderNumber, trackingId) => ({
      type: 'order',
      title: 'Order Shipped',
      message: `Your order ${orderNumber} has been shipped. Tracking ID: ${trackingId}`,
      priority: 'high',
      icon: 'package'
    }),
    
    orderDelivered: (orderNumber) => ({
      type: 'order',
      title: 'Order Delivered',
      message: `Your order ${orderNumber} has been delivered successfully!`,
      priority: 'high',
      icon: 'check'
    }),
    
    lowStock: (productName, stock) => ({
      type: 'inventory',
      title: 'Low Stock Alert',
      message: `${productName} is running low (${stock} remaining).`,
      priority: 'high',
      icon: 'alert'
    }),
    
    newProduct: (productName) => ({
      type: 'product',
      title: 'New Product Added',
      message: `${productName} has been added to the store.`,
      priority: 'low',
      icon: 'info'
    }),
    
    wishlistUpdate: (productName, action) => ({
      type: 'wishlist',
      title: 'Wishlist Updated',
      message: `${productName} has been ${action} your wishlist.`,
      priority: 'low',
      icon: 'info'
    })
  };

  const sendOrderNotification = (type, ...args) => {
    const template = notificationTemplates[type];
    if (template) {
      addNotification(template(...args));
    }
  };

  const sendInventoryNotification = (type, ...args) => {
    const template = notificationTemplates[type];
    if (template) {
      addNotification(template(...args));
    }
  };

  const sendGeneralNotification = (type, ...args) => {
    const template = notificationTemplates[type];
    if (template) {
      addNotification(template(...args));
    }
  };

  const value = {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    sendOrderNotification,
    sendInventoryNotification,
    sendGeneralNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Toast notification component
const NotificationToast = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.icon) {
      case 'package':
        return <Package size={20} className="text-blue-600" />;
      case 'check':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'alert':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
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

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${getPriorityStyles()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;