/**
 * Analytics Data Hook - Fetch real analytics data from API
 * Replaces mock data with actual API calls
 */

import { useState, useEffect, useCallback } from 'react';

export const useAnalyticsData = (timeRange = '7d') => {
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch real analytics data from API
      const [
        chartResponse, 
        categoryResponse, 
        trafficResponse, 
        submissionsResponse,
        summaryResponse,
        realTimeResponse
      ] = await Promise.all([
        fetch(`/api/analytics/chart-data?range=${timeRange}`, { headers }),
        fetch('/api/analytics/category-data', { headers }),
        fetch('/api/analytics/traffic-sources', { headers }),
        fetch('/api/admin/contacts/recent', { headers }),
        fetch(`/api/analytics/summary?range=${timeRange}`, { headers }),
        fetch('/api/analytics/real-time', { headers })
      ]);

      // Check if all requests were successful
      const responses = [chartResponse, categoryResponse, trafficResponse, submissionsResponse, summaryResponse, realTimeResponse];
      const failedRequests = responses.filter(response => !response.ok);
      
      if (failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} API requests failed`);
      }

      // Parse responses
      const [
        chartDataResult,
        categoryDataResult, 
        trafficDataResult,
        submissionsResult,
        summaryResult,
        realTimeResult
      ] = await Promise.all(responses.map(response => response.json()));

      // Update state with real data
      setChartData(chartDataResult.data || []);
      setCategoryData(categoryDataResult.data || []);
      setTrafficData(trafficDataResult.data || []);
      setRecentSubmissions(submissionsResult.submissions || []);
      setSummary(summaryResult.data || {});
      setRealTimeMetrics(realTimeResult.data || {});

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
      
      // Set empty arrays as fallback
      setChartData([]);
      setCategoryData([]);
      setTrafficData([]);
      setRecentSubmissions([]);
      setSummary({});
      setRealTimeMetrics({});
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const refreshAll = () => {
    fetchAnalyticsData();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    chartData,
    categoryData,
    trafficData,
    recentSubmissions,
    summary,
    realTimeMetrics,
    loading: loading,
    isLoading: loading,
    error,
    refreshAll
  };
};