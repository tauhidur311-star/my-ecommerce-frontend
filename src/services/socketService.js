import { io } from 'socket.io-client';
import enhancedApiService from './enhancedApi';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  async connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // If no token provided, try to get from enhancedApiService
    if (!token) {
      token = enhancedApiService.accessToken;
    }

    // If still no token, try localStorage
    if (!token) {
      token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    }

    if (!token) {
      console.error('No authentication token available for socket connection');
      return null;
    }

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://my-ecommerce-backend-s0rt.onrender.com';

    this.socket = io(API_BASE_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.emit('user_online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    // Notification events
    this.socket.on('notification', (notification) => {
      this.triggerListener('notification', notification);
    });

    this.socket.on('unread_count_updated', (data) => {
      this.triggerListener('unreadCountUpdated', data);
    });

    // Order events
    this.socket.on('order_updated', (orderData) => {
      this.triggerListener('orderUpdated', orderData);
    });

    // User status events
    this.socket.on('user_status', (data) => {
      this.triggerListener('userStatus', data);
    });

    // Admin events
    this.socket.on('dashboard_update', (data) => {
      this.triggerListener('dashboardUpdate', data);
    });

    this.socket.on('admin_announcement', (data) => {
      this.triggerListener('adminAnnouncement', data);
    });

    // Inventory events
    this.socket.on('inventory_updated', (data) => {
      this.triggerListener('inventoryUpdated', data);
    });

    this.socket.on('stock_updated', (data) => {
      this.triggerListener('stockUpdated', data);
    });

    this.socket.on('inventory_stock_updated', (data) => {
      this.triggerListener('inventoryStockUpdated', data);
    });

    this.socket.on('low_stock_alert', (data) => {
      this.triggerListener('lowStockAlert', data);
    });

    this.socket.on('inventory_change', (data) => {
      this.triggerListener('inventoryChange', data);
    });

    this.socket.on('inventory_error', (data) => {
      this.triggerListener('inventoryError', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event emission methods
  emit(event, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  subscribeToOrderUpdates(orderId) {
    this.emit('subscribe_order_updates', orderId);
  }

  unsubscribeFromOrderUpdates(orderId) {
    this.emit('unsubscribe_order_updates', orderId);
  }

  subscribeToAdminUpdates() {
    this.emit('subscribe_admin_updates');
  }

  // Inventory-specific methods
  subscribeToInventoryUpdates() {
    this.emit('subscribe_inventory_updates');
  }

  unsubscribeFromInventoryUpdates() {
    this.emit('unsubscribe_inventory_updates');
  }

  updateProductStock(productId, newStock, operation = 'set', reason = '') {
    this.emit('update_product_stock', {
      productId,
      newStock,
      operation,
      reason
    });
  }

  sendLowStockAlert(productId, productName, currentStock, threshold) {
    this.emit('inventory_low_stock_alert', {
      productId,
      productName,
      currentStock,
      threshold
    });
  }

  markNotificationAsRead(notificationId) {
    this.emit('notification_read', notificationId);
  }

  startTyping(recipientId) {
    this.emit('typing_start', { recipientId });
  }

  stopTyping(recipientId) {
    this.emit('typing_stop', { recipientId });
  }

  adminBroadcast(message, type = 'info') {
    this.emit('admin_broadcast', { message, type });
  }

  // Listener management
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.removeListener(event, callback);
    };
  }

  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  triggerListener(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;