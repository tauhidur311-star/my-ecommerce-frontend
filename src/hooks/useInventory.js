import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Fetch inventory data
  const {
    data: inventory,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/admin/inventory').then(res => res.data),
    cacheTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  // Low stock alerts
  const {
    data: lowStockAlerts,
    isLoading: alertsLoading
  } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: () => api.get('/admin/inventory/alerts').then(res => res.data),
    refetchInterval: 60000, // Check every minute
  });

  // Suppliers data
  const {
    data: suppliers,
    isLoading: suppliersLoading
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/admin/suppliers').then(res => res.data),
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates) => api.put('/admin/inventory/bulk-update', updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Bulk update completed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update inventory: ' + error.message);
    }
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ productId, quantity, operation = 'set' }) => 
      api.put(`/admin/inventory/${productId}/stock`, { quantity, operation }),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Stock updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update stock: ' + error.message);
    }
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: (supplierData) => api.post('/admin/suppliers', supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Supplier created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create supplier: ' + error.message);
    }
  });

  // Helper functions
  const updateStock = useCallback((productId, quantity, operation = 'set') => {
    updateStockMutation.mutate({ productId, quantity, operation });
  }, [updateStockMutation]);

  const bulkUpdate = useCallback((updates) => {
    bulkUpdateMutation.mutate(updates);
  }, [bulkUpdateMutation]);

  const createSupplier = useCallback((supplierData) => {
    createSupplierMutation.mutate(supplierData);
  }, [createSupplierMutation]);

  // Calculate inventory metrics
  const metrics = {
    totalProducts: inventory?.products?.length || 0,
    lowStockCount: lowStockAlerts?.length || 0,
    totalValue: inventory?.products?.reduce((sum, product) => 
      sum + (product.price * product.stock), 0) || 0,
    outOfStockCount: inventory?.products?.filter(p => p.stock === 0)?.length || 0
  };

  return {
    // Data
    inventory: inventory?.products || [],
    lowStockAlerts: lowStockAlerts || [],
    suppliers: suppliers || [],
    metrics,
    
    // Loading states
    isLoading,
    alertsLoading,
    suppliersLoading,
    isBulkUpdating: bulkUpdateMutation.isLoading,
    isUpdatingStock: updateStockMutation.isLoading,
    
    // Errors
    error,
    
    // Actions
    updateStock,
    bulkUpdate,
    createSupplier,
    refetch
  };
};

// Hook for inventory alerts and notifications
export const useInventoryAlerts = () => {
  const [alertSettings, setAlertSettings] = useState({
    lowStockThreshold: 10,
    outOfStockNotifications: true,
    emailAlerts: true,
    smsAlerts: false
  });

  const updateAlertSettings = useCallback((newSettings) => {
    setAlertSettings(prev => ({ ...prev, ...newSettings }));
    // Save to API
    api.put('/admin/inventory/alert-settings', newSettings)
      .then(() => toast.success('Alert settings updated'))
      .catch(error => toast.error('Failed to update alert settings'));
  }, []);

  const sendLowStockAlert = useCallback(async (productIds) => {
    try {
      await api.post('/admin/inventory/send-alert', { productIds });
      toast.success('Low stock alerts sent successfully!');
    } catch (error) {
      toast.error('Failed to send alerts');
    }
  }, []);

  return {
    alertSettings,
    updateAlertSettings,
    sendLowStockAlert
  };
};