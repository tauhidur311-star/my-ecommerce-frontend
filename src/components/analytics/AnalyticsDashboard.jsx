import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Users,
  Eye,
  MessageSquare,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw
} from 'lucide-react';

import SummaryCard from './SummaryCard';
import ChartWrapper from './ChartWrapper';
import RecentSubmissionsList from './RecentSubmissionsList';
import useSSE from '../../hooks/useSSE';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState({ views: [], submissions: [] });
  const [topPages, setTopPages] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartRange, setChartRange] = useState('7d');

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [
        summaryRes,
        viewsRes,
        submissionsRes,
        pagesRes,
        referrersRes,
        devicesRes,
        geoRes,
        recentRes
      ] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/summary`, { headers }),
        fetch(`${API_BASE}/admin/analytics/charts?range=${chartRange}&type=views`, { headers }),
        fetch(`${API_BASE}/admin/analytics/charts?range=${chartRange}&type=submissions`, { headers }),
        fetch(`${API_BASE}/admin/analytics/top-pages?limit=10`, { headers }),
        fetch(`${API_BASE}/admin/analytics/referrers?limit=10`, { headers }),
        fetch(`${API_BASE}/admin/analytics/devices`, { headers }),
        fetch(`${API_BASE}/admin/analytics/geo?top=10`, { headers }),
        fetch(`${API_BASE}/admin/analytics/recent-submissions?limit=20`, { headers })
      ]);

      const [
        summaryData,
        viewsData,
        submissionsData,
        pagesData,
        referrersData,
        devicesData,
        geoDataRes,
        recentData
      ] = await Promise.all([
        summaryRes.json(),
        viewsRes.json(),
        submissionsRes.json(),
        pagesRes.json(),
        referrersRes.json(),
        devicesRes.json(),
        geoRes.json(),
        recentRes.json()
      ]);

      setSummary(summaryData.data);
      setChartsData({
        views: viewsData.data || [],
        submissions: submissionsData.data || []
      });
      setTopPages(pagesData.data || []);
      setReferrers(referrersData.data || []);
      setDevices(devicesData.data || []);
      setGeoData(geoDataRes.data || []);
      setRecentSubmissions(recentData.data || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [chartRange]);

  // Handle SSE messages
  const handleSSEMessage = useCallback((type, data) => {
    console.log('SSE message received:', type, data);
    
    switch (type) {
      case 'visitor-event':
        // Update real-time metrics
        setSummary(prev => prev ? {
          ...prev,
          activeSessions: prev.activeSessions + (Math.random() > 0.5 ? 1 : 0),
          todayViews: prev.todayViews + 1
        } : null);
        break;
        
      case 'new-submission':
        // Add new submission to the list
        setRecentSubmissions(prev => [data, ...prev.slice(0, 19)]);
        setSummary(prev => prev ? {
          ...prev,
          todaySubmissions: prev.todaySubmissions + 1
        } : null);
        break;
        
      case 'metric-update':
        // Update summary metrics
        setSummary(prev => prev ? {
          ...prev,
          activeSessions: data.activeSessions,
          viewsPerMinute: data.viewsPerMinute,
          submissionsPerMinute: data.submissionsPerMinute
        } : null);
        break;
        
      default:
        break;
    }
    
    setLastUpdate(new Date());
  }, []);

  // Initialize SSE connection
  useSSE(`${API_BASE}/admin/analytics/stream`, handleSSEMessage, true);

  // Load initial data
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Device chart colors
  const deviceColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const formatChartData = (data) => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Real-time Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Live visitor stats and performance metrics
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Active Sessions"
            value={summary.activeSessions?.toLocaleString() || '0'}
            icon={Users}
            color="blue"
          />
          <SummaryCard
            title="Today's Views"
            value={summary.todayViews?.toLocaleString() || '0'}
            icon={Eye}
            color="green"
          />
          <SummaryCard
            title="Today's Submissions"
            value={summary.todaySubmissions?.toLocaleString() || '0'}
            icon={MessageSquare}
            color="purple"
          />
          <SummaryCard
            title="Views/Minute"
            value={summary.viewsPerMinute?.toLocaleString() || '0'}
            icon={Activity}
            color="orange"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <ChartWrapper title="Page Views Trend" loading={loading} error={error}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatChartData(chartsData.views)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Submissions Chart */}
        <ChartWrapper title="Contact Submissions" loading={loading} error={error}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatChartData(chartsData.submissions)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Top Pages */}
        <ChartWrapper title="Top Pages" loading={loading} error={error}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="page" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Device Breakdown */}
        <ChartWrapper title="Device Breakdown" loading={loading} error={error}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={devices}
                dataKey="count"
                nameKey="deviceType"
                cx="50%"
                cy="50%"
                outerRadius={80}
                animationDuration={1000}
              >
                {devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Data */}
        <ChartWrapper title="Top Countries" loading={loading} error={error}>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {geoData.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {country.country}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {country.views} views
                </span>
              </div>
            ))}
          </div>
        </ChartWrapper>

        {/* Recent Submissions */}
        <RecentSubmissionsList items={recentSubmissions} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;