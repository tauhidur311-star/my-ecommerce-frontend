import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/admin/notifications').then(res => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      const unread = data?.notifications?.filter(n => !n.read)?.length || 0;
      setUnreadCount(unread);
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => api.put(`/admin/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.put('/admin/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      setUnreadCount(0);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => api.delete(`/admin/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification deleted');
    }
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: (notificationData) => api.post('/admin/notifications', notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification created');
    }
  });

  const markAsRead = useCallback((notificationId) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const createNotification = useCallback((notificationData) => {
    createNotificationMutation.mutate(notificationData);
  }, [createNotificationMutation]);

  return {
    notifications: notifications?.notifications || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch
  };
};

// Hook for real-time notification system
export const useRealTimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/notifications`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to notification stream');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);
        
        // Show toast notification
        toast(notification.message, {
          icon: getNotificationIcon(notification.type),
          duration: 4000,
        });
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from notification stream');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  return {
    isConnected,
    recentNotifications
  };
};

// Hook for notification settings
export const useNotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    lowStock: true,
    newOrders: true,
    customerMessages: true,
    systemAlerts: true
  });

  const updateSettings = useMutation({
    mutationFn: (newSettings) => api.put('/admin/notification-settings', newSettings),
    onSuccess: (data) => {
      setSettings(data);
      toast.success('Notification settings updated');
    },
    onError: () => {
      toast.error('Failed to update notification settings');
    }
  });

  // Load settings on mount
  useEffect(() => {
    api.get('/admin/notification-settings')
      .then(res => setSettings(res.data))
      .catch(error => console.error('Error loading notification settings:', error));
  }, []);

  return {
    settings,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isLoading
  };
};