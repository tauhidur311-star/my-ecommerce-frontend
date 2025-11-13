import { useState, useEffect, useCallback } from 'react';

export const useAnalyticsData = (timeRange = '7d') => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data generator
  const generateMockData = useCallback(() => {
    const mockSummary = {
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      customersGrowth: 15.2,
      conversionRate: 3.4,
      totalRevenue: 245000,
      totalOrders: 1250,
      totalCustomers: 890,
      avgOrderValue: 196
    };

    const mockSalesData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 10000) + 15000,
      orders: Math.floor(Math.random() * 30) + 40,
      visitors: Math.floor(Math.random() * 200) + 800
    }));

    const mockCustomerData = {
      newCustomers: 125,
      returningCustomers: 765,
      customerRetention: 68.5,
      avgLifetimeValue: 450
    };

    const mockProductData = [
      { name: 'iPhone 15 Pro', sales: 245, revenue: 220500 },
      { name: 'MacBook Pro', sales: 156, revenue: 234000 },
      { name: 'AirPods Pro', sales: 389, revenue: 97250 },
      { name: 'iPad Air', sales: 198, revenue: 118800 },
      { name: 'Apple Watch', sales: 267, revenue: 80100 }
    ];

    const mockGeoData = [
      { country: 'Bangladesh', revenue: 180000, orders: 850 },
      { country: 'India', revenue: 45000, orders: 200 },
      { country: 'Pakistan', revenue: 15000, orders: 80 },
      { country: 'Nepal', revenue: 8000, orders: 40 },
      { country: 'Others', revenue: 7000, orders: 30 }
    ];

    return {
      summary: mockSummary,
      salesData: mockSalesData,
      customerData: mockCustomerData,
      productData: mockProductData,
      geoData: mockGeoData
    };
  }, []);

  // Fetch analytics data (currently using mock data)
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with real API calls when analytics endpoints are ready
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/admin/analytics/summary', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      const mockData = generateMockData();
      
      setSummary(mockData.summary);
      setSalesData(mockData.salesData);
      setCustomerData(mockData.customerData);
      setProductData(mockData.productData);
      setGeoData(mockData.geoData);

    } catch (err) {
      console.error('Analytics data fetch error:', err);
      setError(err.message);
      
      // Even on error, provide mock data for demo purposes
      const mockData = generateMockData();
      setSummary(mockData.summary);
      setSalesData(mockData.salesData);
      setCustomerData(mockData.customerData);
      setProductData(mockData.productData);
      setGeoData(mockData.geoData);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  // Real-time Metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeSessions: Math.floor(Math.random() * 50) + 25,
    revenueToday: Math.floor(Math.random() * 5000) + 2000,
    ordersToday: Math.floor(Math.random() * 20) + 10,
    conversionRate: (Math.random() * 2 + 2).toFixed(1)
  });

  // Update real-time metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics({
        activeSessions: Math.floor(Math.random() * 50) + 25,
        revenueToday: Math.floor(Math.random() * 5000) + 2000,
        ordersToday: Math.floor(Math.random() * 20) + 10,
        conversionRate: (Math.random() * 2 + 2).toFixed(1)
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch data on component mount and timeRange change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  // Refresh all data
  const refreshAll = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Enhanced metrics calculation
  const enhancedMetrics = {
    totalRevenue: summary?.totalRevenue || 0,
    totalOrders: summary?.totalOrders || 0,
    totalCustomers: summary?.totalCustomers || 0,
    avgOrderValue: summary?.avgOrderValue || 0,
    conversionRate: summary?.conversionRate || 0,
    
    // Growth rates
    revenueGrowth: summary?.revenueGrowth || 0,
    ordersGrowth: summary?.ordersGrowth || 0,
    customersGrowth: summary?.customersGrowth || 0,
    
    // Time-based metrics
    revenueToday: realTimeMetrics.revenueToday,
    ordersToday: realTimeMetrics.ordersToday,
    activeSessions: realTimeMetrics.activeSessions,
  };

  return {
    // Data
    summary,
    salesData,
    customerData,
    productData,
    geoData,
    
    // States
    isLoading,
    error,
    
    // Enhanced data
    realTimeMetrics: enhancedMetrics,
    
    // Actions
    refreshAll,
    
    // Time range
    timeRange,
  };
};

