import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Target, 
  Users, ShoppingCart, DollarSign, Eye,
  Download, RefreshCw, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';

export default function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    generateAdvancedAnalytics();
  }, [dateRange]);

  const generateAdvancedAnalytics = () => {
    setLoading(true);
    
    // Simulate advanced analytics data generation
    setTimeout(() => {
      const data = {
        overview: {
          totalRevenue: 285450,
          totalOrders: 1247,
          totalCustomers: 842,
          conversionRate: 3.2,
          revenueGrowth: 15.8,
          ordersGrowth: 8.3,
          customersGrowth: 12.1,
          conversionGrowth: 0.8
        },
        salesFunnel: {
          visitors: 15680,
          productViews: 8940,
          addToCarts: 3270,
          checkouts: 1580,
          purchases: 1247
        },
        customerSegments: [
          { segment: 'New Customers', count: 310, revenue: 45600, avgOrderValue: 147, color: 'bg-blue-500' },
          { segment: 'Returning Customers', count: 425, revenue: 128900, avgOrderValue: 303, color: 'bg-green-500' },
          { segment: 'VIP Customers', count: 87, revenue: 98400, avgOrderValue: 1131, color: 'bg-purple-500' },
          { segment: 'At-Risk Customers', count: 156, revenue: 23800, avgOrderValue: 153, color: 'bg-red-500' }
        ],
        productPerformance: [
          { name: 'Premium Cotton Shirt', revenue: 42800, units: 185, margin: 62, trend: 'up' },
          { name: 'Designer Jeans', revenue: 38600, units: 143, margin: 58, trend: 'up' },
          { name: 'Casual Sneakers', revenue: 31200, units: 124, margin: 45, trend: 'down' },
          { name: 'Summer Dress', revenue: 28900, units: 167, margin: 68, trend: 'up' },
          { name: 'Leather Jacket', revenue: 25600, units: 48, margin: 72, trend: 'stable' }
        ],
        geographicData: [
          { region: 'Dhaka', orders: 456, revenue: 128900, percentage: 45.2 },
          { region: 'Chittagong', orders: 234, revenue: 68400, percentage: 24.0 },
          { region: 'Sylhet', orders: 187, revenue: 45600, percentage: 16.0 },
          { region: 'Khulna', orders: 145, revenue: 32100, percentage: 11.2 },
          { region: 'Others', orders: 225, revenue: 38450, percentage: 13.5 }
        ],
        timeAnalysis: {
          hourlyPattern: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            orders: Math.floor(Math.random() * 50 + 10),
            revenue: Math.floor(Math.random() * 8000 + 2000)
          })),
          weeklyPattern: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            day,
            orders: Math.floor(Math.random() * 100 + 50),
            revenue: Math.floor(Math.random() * 15000 + 8000)
          }))
        },
        cohortAnalysis: [
          { month: 'Jan 2024', newCustomers: 145, retention1M: 78, retention3M: 45, retention6M: 28 },
          { month: 'Feb 2024', newCustomers: 167, retention1M: 82, retention3M: 48, retention6M: null },
          { month: 'Mar 2024', newCustomers: 189, retention1M: 85, retention3M: 52, retention6M: null },
          { month: 'Apr 2024', newCustomers: 203, retention1M: 79, retention3M: null, retention6M: null },
          { month: 'May 2024', newCustomers: 234, retention1M: 86, retention3M: null, retention6M: null }
        ]
      };
      
      setAnalyticsData(data);
      setLoading(false);
    }, 1500);
  };

  const calculateFunnelConversion = (current, total) => {
    return ((current / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600 mt-1">Deep insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={generateAdvancedAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `৳${analyticsData.overview.totalRevenue.toLocaleString()}`, growth: analyticsData.overview.revenueGrowth, icon: DollarSign, color: 'blue' },
          { label: 'Total Orders', value: analyticsData.overview.totalOrders.toLocaleString(), growth: analyticsData.overview.ordersGrowth, icon: ShoppingCart, color: 'green' },
          { label: 'Total Customers', value: analyticsData.overview.totalCustomers.toLocaleString(), growth: analyticsData.overview.customersGrowth, icon: Users, color: 'purple' },
          { label: 'Conversion Rate', value: `${analyticsData.overview.conversionRate}%`, growth: analyticsData.overview.conversionGrowth, icon: Target, color: 'orange' }
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.growth > 0 ? (
                      <ArrowUp size={16} className="text-green-500" />
                    ) : (
                      <ArrowDown size={16} className="text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${metric.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.growth)}%
                    </span>
                    <span className="text-sm text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  metric.color === 'blue' ? 'bg-blue-100' :
                  metric.color === 'green' ? 'bg-green-100' :
                  metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <IconComponent size={24} className={`${
                    metric.color === 'blue' ? 'text-blue-600' :
                    metric.color === 'green' ? 'text-green-600' :
                    metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'funnel', label: 'Sales Funnel', icon: TrendingUp },
              { id: 'segments', label: 'Customer Segments', icon: Users },
              { id: 'products', label: 'Product Performance', icon: Target },
              { id: 'cohort', label: 'Cohort Analysis', icon: Calendar }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Geographic Distribution */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {analyticsData.geographicData.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{region.region}</span>
                            <span className="text-sm text-gray-500">{region.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${region.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-semibold text-gray-900">{region.orders}</div>
                          <div className="text-sm text-gray-500">orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h5 className="font-semibold text-gray-900 mb-2">Geographic Insights</h5>
                    <p className="text-sm text-gray-600">
                      Dhaka is your top performing region with {analyticsData.geographicData[0].percentage}% of total orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Time-based Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours Analysis</h4>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-12 gap-2">
                    {analyticsData.timeAnalysis.hourlyPattern.map((hour, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="bg-blue-500 rounded-t w-full mx-auto mb-2 transition-all hover:bg-blue-600"
                          style={{ height: `${(hour.orders / 60) * 80}px` }}
                          title={`${hour.hour}:00 - ${hour.orders} orders`}
                        ></div>
                        <div className="text-xs text-gray-600">{hour.hour}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Hours (24-hour format)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Funnel Tab */}
          {activeTab === 'funnel' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Conversion Funnel Analysis</h4>
              
              <div className="space-y-4">
                {[
                  { stage: 'Visitors', count: analyticsData.salesFunnel.visitors, icon: '👥', color: 'bg-blue-500' },
                  { stage: 'Product Views', count: analyticsData.salesFunnel.productViews, icon: '👀', color: 'bg-green-500' },
                  { stage: 'Add to Cart', count: analyticsData.salesFunnel.addToCarts, icon: '🛒', color: 'bg-yellow-500' },
                  { stage: 'Checkout', count: analyticsData.salesFunnel.checkouts, icon: '💳', color: 'bg-orange-500' },
                  { stage: 'Purchase', count: analyticsData.salesFunnel.purchases, icon: '✅', color: 'bg-purple-500' }
                ].map((stage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{stage.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{stage.stage}</div>
                        <div className="text-sm text-gray-500">
                          {index > 0 && `${calculateFunnelConversion(stage.count, analyticsData.salesFunnel.visitors)}% conversion`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">{stage.count.toLocaleString()}</div>
                      {index > 0 && (
                        <div className="text-sm text-gray-500">
                          -{((1 - stage.count / Object.values(analyticsData.salesFunnel)[index - 1]) * 100).toFixed(1)}% drop
                        </div>
                      )}
                    </div>
                    <div className="w-64">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${stage.color}`}
                          style={{ width: `${(stage.count / analyticsData.salesFunnel.visitors) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Segments Tab */}
          {activeTab === 'segments' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Customer Segmentation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.customerSegments.map((segment, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-900">{segment.segment}</h5>
                      <div className={`w-4 h-4 rounded-full ${segment.color}`}></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customers</span>
                        <span className="font-semibold">{segment.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-semibold">৳{segment.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Order Value</span>
                        <span className="font-semibold">৳{segment.avgOrderValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Performance Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Product Performance Analysis</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.productPerformance.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-gray-600">৳{product.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{product.units}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            product.margin >= 60 ? 'bg-green-100 text-green-800' :
                            product.margin >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.margin}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 ${
                            product.trend === 'up' ? 'text-green-600' :
                            product.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {product.trend === 'up' ? '📈' : product.trend === 'down' ? '📉' : '➡️'}
                            {product.trend === 'up' ? 'Rising' : product.trend === 'down' ? 'Falling' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cohort Analysis Tab */}
          {activeTab === 'cohort' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Customer Cohort Analysis</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Customers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">1M Retention</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">3M Retention</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">6M Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.cohortAnalysis.map((cohort, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{cohort.month}</td>
                        <td className="px-6 py-4 text-gray-600">{cohort.newCustomers}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {cohort.retention1M}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {cohort.retention3M ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                              {cohort.retention3M}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {cohort.retention6M ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                              {cohort.retention6M}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h5 className="font-semibold text-blue-900 mb-2">Retention Insights</h5>
                <p className="text-blue-800 text-sm">
                  Your average 1-month retention rate is 82%, which is above industry standard. 
                  Focus on improving 3-month retention through targeted campaigns.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}