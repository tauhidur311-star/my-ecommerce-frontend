import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, ShoppingCart, Package,
  DollarSign, Eye, Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData.js';
import ChartWrapper from './ChartWrapper';
import SummaryCard from './SummaryCard';
import RecentSubmissionsList from './RecentSubmissionsList';

const EnhancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(false);
  
  const { summary, realTimeMetrics, isLoading, refreshAll } = useAnalyticsData(timeRange);

  // Real data from API hooks
  const { 
    chartData, 
    categoryData, 
    trafficData, 
    recentSubmissions,
    refreshChartData 
  } = useAnalyticsData(timeRange);

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const handleRefresh = () => {
    setLoading(true);
    refreshAll();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const summaryStats = [
    {
      title: 'Total Revenue',
      value: realTimeMetrics?.totalRevenue ? `৳${realTimeMetrics.totalRevenue.toLocaleString()}` : '৳0',
      delta: summary?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: realTimeMetrics?.totalOrders || 0,
      delta: summary?.ordersGrowth || 0,
      icon: ShoppingCart,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: realTimeMetrics?.activeUsers || '5,678',
      delta: summary?.usersGrowth || -2.1,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Page Views',
      value: realTimeMetrics?.pageViews || '23,456',
      delta: summary?.pageViewsGrowth || 15.3,
      icon: Eye,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md rounded-lg p-4 border border-gray-200/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={loading || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading || isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SummaryCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartWrapper
          title="Revenue Trend"
          loading={isLoading}
          error={null}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`৳${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Orders vs Visitors */}
        <ChartWrapper
          title="Orders vs Visitors"
          loading={isLoading}
          error={null}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10B981"
                strokeWidth={3}
                name="Orders"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Visitors"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category */}
        <ChartWrapper
          title="Sales by Category"
          loading={isLoading}
          error={null}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData || []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {(categoryData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Traffic Sources */}
        <div className="bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Traffic Sources
          </h3>
          <div className="space-y-4">
            {(trafficData || []).map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] || '#6B7280' }}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {source.visitors.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({source.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentSubmissionsList items={recentSubmissions || []} />
      </div>

      {/* Performance Metrics Table */}
      <div className="bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/20">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Metric
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Current
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Previous
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200/10">
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">Conversion Rate</td>
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">3.2%</td>
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">2.8%</td>
                <td className="py-3 px-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp size={14} />
                    +0.4%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200/10">
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">Average Order Value</td>
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">৳2,450</td>
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">৳2,320</td>
                <td className="py-3 px-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp size={14} />
                    +৳130
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200/10">
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">Bounce Rate</td>
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">42%</td>
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">45%</td>
                <td className="py-3 px-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingDown size={14} />
                    -3%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">Customer Lifetime Value</td>
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">৳12,500</td>
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">৳11,800</td>
                <td className="py-3 px-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp size={14} />
                    +৳700
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;