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

      // Fetch real analytics data from API endpoints
      const [
        chartResponse, 
        categoryResponse, 
        trafficResponse, 
        summaryResponse,
        realTimeResponse
      ] = await Promise.all([
        fetch(`/api/analytics/chart-data?range=${timeRange}`, { headers }),
        fetch('/api/analytics/category-data', { headers }),
        fetch('/api/analytics/traffic-sources', { headers }),
        fetch(`/api/analytics/summary?range=${timeRange}`, { headers }),
        fetch('/api/analytics/real-time', { headers })
      ]);

      // Check if all requests were successful
      const responses = [chartResponse, categoryResponse, trafficResponse, summaryResponse, realTimeResponse];
      const failedRequests = responses.filter(response => !response.ok);
      
      if (failedRequests.length > 0) {
        console.warn(`⚠️ ${failedRequests.length} analytics API requests failed`);
        // Fall back to local mock data if API fails
        throw new Error(`${failedRequests.length} API requests failed`);
      }

      // Parse JSON responses with proper error handling
      const parseResponses = await Promise.all(
        responses.map(async response => {
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await response.json();
            } else {
              console.error('Non-JSON response received from analytics API');
              return { success: false, data: null };
            }
          } catch (parseError) {
            console.error('Failed to parse analytics response:', parseError);
            return { success: false, data: null };
          }
        })
      );

      const [
        chartDataResult,
        categoryDataResult, 
        trafficDataResult,
        summaryResult,
        realTimeResult
      ] = parseResponses;

      // Update state with real data from API
      setChartData(chartDataResult?.data || []);
      setCategoryData(categoryDataResult?.data || []);
      setTrafficData(trafficDataResult?.data || []);
      setRecentSubmissions([]); // Will be populated when contacts API is ready
      setSummary(summaryResult?.data || {});
      setRealTimeMetrics(realTimeResult?.data || {});

      console.log('✅ Analytics data loaded from backend API');

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

  const refreshAll = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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