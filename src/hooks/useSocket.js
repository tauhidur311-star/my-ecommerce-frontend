import { useEffect, useRef } from 'react';
import socketService from '../services/socketService.js';

export const useSocket = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token) {
        socketService.connect(token);
        isInitialized.current = true;
      }
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isSocketConnected(),
    
    // Helper methods
    emit: (event, data) => socketService.emit(event, data),
    addListener: (event, callback) => socketService.addListener(event, callback),
    removeListener: (event, callback) => socketService.removeListener(event, callback),
    
    // Specific methods
    subscribeToOrderUpdates: (orderId) => socketService.subscribeToOrderUpdates(orderId),
    unsubscribeFromOrderUpdates: (orderId) => socketService.unsubscribeFromOrderUpdates(orderId),
    markNotificationAsRead: (notificationId) => socketService.markNotificationAsRead(notificationId),
  };
};

// Support default import pattern
export default useSocket;