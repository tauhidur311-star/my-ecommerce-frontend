import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useAnalyticsData = (timeRange = '7d') => {
  const queryClient = useQueryClient();

  // Analytics Summary
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/admin/analytics/summary').then(res => res.data),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchInterval: 60000, // Refetch every minute
  });

  // Sales Analytics
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError
  } = useQuery({
    queryKey: ['analytics-sales', timeRange],
    queryFn: () => api.get(`/admin/analytics/sales?range=${timeRange}`).then(res => res.data),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  // Customer Analytics
  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError
  } = useQuery({
    queryKey: ['analytics-customers', timeRange],
    queryFn: () => api.get(`/admin/analytics/customers?range=${timeRange}`).then(res => res.data),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  // Product Performance
  const {
    data: productData,
    isLoading: productLoading,
    error: productError
  } = useQuery({
    queryKey: ['analytics-products', timeRange],
    queryFn: () => api.get(`/admin/analytics/products?range=${timeRange}`).then(res => res.data),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  // Geographic Data
  const {
    data: geoData,
    isLoading: geoLoading,
    error: geoError
  } = useQuery({
    queryKey: ['analytics-geo', timeRange],
    queryFn: () => api.get(`/admin/analytics/geographic?range=${timeRange}`).then(res => res.data),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  // Real-time Metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeSessions: 0,
    revenueToday: 0,
    ordersToday: 0,
    conversionRate: 0
  });

  // Manual refresh function
  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries(['analytics-summary']);
    queryClient.invalidateQueries(['analytics-sales', timeRange]);
    queryClient.invalidateQueries(['analytics-customers', timeRange]);
    queryClient.invalidateQueries(['analytics-products', timeRange]);
    queryClient.invalidateQueries(['analytics-geo', timeRange]);
  }, [queryClient, timeRange]);

  // Update real-time metrics from SSE or polling
  const updateRealTimeMetrics = useCallback((newMetrics) => {
    setRealTimeMetrics(prev => ({
      ...prev,
      ...newMetrics
    }));
  }, []);

  return {
    // Data
    summary: summary?.data,
    salesData: salesData?.data,
    customerData: customerData?.data,
    productData: productData?.data,
    geoData: geoData?.data,
    realTimeMetrics,
    
    // Loading states
    isLoading: summaryLoading || salesLoading || customerLoading || productLoading || geoLoading,
    summaryLoading,
    salesLoading,
    customerLoading,
    productLoading,
    geoLoading,
    
    // Errors
    error: summaryError || salesError || customerError || productError || geoError,
    summaryError,
    salesError,
    customerError,
    productError,
    geoError,
    
    // Actions
    refetchSummary,
    refreshAll,
    updateRealTimeMetrics
  };
};

// Hook for exporting analytics data
export const useAnalyticsExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = useCallback(async (data, type = 'summary') => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(`Analytics Report - ${type.charAt(0).toUpperCase() + type.slice(1)}`, 20, 30);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      let yPosition = 60;
      
      // Add data based on type
      if (type === 'summary' && data) {
        doc.text(`Total Revenue: ৳${data.totalRevenue?.toLocaleString() || 0}`, 20, yPosition);
        yPosition += 15;
        doc.text(`Total Orders: ${data.totalOrders?.toLocaleString() || 0}`, 20, yPosition);
        yPosition += 15;
        doc.text(`Total Customers: ${data.totalCustomers?.toLocaleString() || 0}`, 20, yPosition);
        yPosition += 15;
        doc.text(`Conversion Rate: ${data.conversionRate || 0}%`, 20, yPosition);
      }
      
      // Save the PDF
      doc.save(`analytics-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToExcel = useCallback(async (data, type = 'summary') => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      
      let worksheetData = [];
      
      // Prepare data based on type
      if (type === 'summary' && data) {
        worksheetData = [
          ['Metric', 'Value'],
          ['Total Revenue', `৳${data.totalRevenue?.toLocaleString() || 0}`],
          ['Total Orders', data.totalOrders?.toLocaleString() || 0],
          ['Total Customers', data.totalCustomers?.toLocaleString() || 0],
          ['Conversion Rate', `${data.conversionRate || 0}%`],
          ['Generated On', new Date().toLocaleDateString()]
        ];
      }
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));
      
      // Save the Excel file
      XLSX.writeFile(workbook, `analytics-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportToPDF,
    exportToExcel
  };
};