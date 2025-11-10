import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Users, Package, 
  Calendar, Eye, ShoppingCart, ArrowUp, ArrowDown,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAnalyticsData();
  }, [dateRange]);

  const generateAnalyticsData = () => {
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      const data = {
        overview: {
          totalRevenue: 125450,
          totalOrders: 245,
          totalCustomers: 156,
          totalProducts: 89,
          revenueGrowth: 12.5,
          ordersGrowth: -3.2,
          customersGrowth: 8.7,
          productsGrowth: 5.1
        },
        chartData: {
          dailySales: generateDailySalesData(),
          topProducts: generateTopProductsData(),
          customerSegments: generateCustomerSegmentsData(),
          orderStatuses: generateOrderStatusData()
        },
        performance: {
          conversionRate: 2.4,
          averageOrderValue: 512,
          customerLifetimeValue: 1250,
          returnCustomerRate: 35.8,
          cartAbandonmentRate: 68.5,
          topTrafficSource: 'Organic Search'
        }
      };
      
      setAnalytics(data);
      setLoading(false);
    }, 1000);
  };

  const generateDailySalesData = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 8000 + 2000),
        orders: Math.floor(Math.random() * 20 + 5)
      });
    }
    
    return data;
  };

  const generateTopProductsData = () => [
    { name: 'Premium Cotton Shirt', sales: 145, revenue: 72500 },
    { name: 'Designer Jeans', sales: 98, revenue: 58800 },
    { name: 'Casual Sneakers', sales: 87, revenue: 43500 },
    { name: 'Summer Dress', sales: 76, revenue: 38000 },
    { name: 'Leather Jacket', sales: 65, revenue: 65000 }
  ];

  const generateCustomerSegmentsData = () => [
    { segment: 'New Customers', count: 45, percentage: 28.8, color: 'bg-blue-500' },
    { segment: 'Returning Customers', count: 56, percentage: 35.9, color: 'bg-green-500' },
    { segment: 'VIP Customers', count: 32, percentage: 20.5, color: 'bg-purple-500' },
    { segment: 'Inactive Customers', count: 23, percentage: 14.8, color: 'bg-gray-400' }
  ];

  const generateOrderStatusData = () => [
    { status: 'Delivered', count: 128, color: 'bg-green-500' },
    { status: 'Shipped', count: 45, color: 'bg-blue-500' },
    { status: 'Processing', count: 32, color: 'bg-yellow-500' },
    { status: 'Pending', count: 18, color: 'bg-orange-500' },
    { status: 'Cancelled', count: 7, color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your business performance and insights</p>
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
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">৳{analytics.overview.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                {analytics.overview.revenueGrowth > 0 ? (
                  <ArrowUp size={16} className="text-green-500" />
                ) : (
                  <ArrowDown size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${analytics.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(analytics.overview.revenueGrowth)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.overview.totalOrders}</p>
              <div className="flex items-center gap-1 mt-2">
                {analytics.overview.ordersGrowth > 0 ? (
                  <ArrowUp size={16} className="text-green-500" />
                ) : (
                  <ArrowDown size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${analytics.overview.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(analytics.overview.ordersGrowth)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.overview.totalCustomers}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  {analytics.overview.customersGrowth}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.overview.totalProducts}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  {analytics.overview.productsGrowth}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} />
              Daily Sales
            </h3>
            <div className="text-sm text-gray-500">Revenue & Orders</div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.chartData.dailySales.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs text-gray-600 mb-1">৳{(day.revenue / 1000).toFixed(0)}k</div>
                <div 
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm w-full transition-all hover:from-blue-700 hover:to-blue-500"
                  style={{ height: `${(day.revenue / 8000) * 200}px` }}
                  title={`${day.date}: ৳${day.revenue.toLocaleString()} (${day.orders} orders)`}
                ></div>
                <div className="text-xs text-gray-500 transform rotate-45 origin-left">{day.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target size={20} />
              Top Products
            </h3>
            <div className="text-sm text-gray-500">By Revenue</div>
          </div>
          <div className="space-y-4">
            {analytics.chartData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">৳{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={18} />
            Key Metrics
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-gray-900">{analytics.performance.conversionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Order Value</span>
              <span className="font-semibold text-gray-900">৳{analytics.performance.averageOrderValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer LTV</span>
              <span className="font-semibold text-gray-900">৳{analytics.performance.customerLifetimeValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Return Rate</span>
              <span className="font-semibold text-gray-900">{analytics.performance.returnCustomerRate}%</span>
            </div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} />
            Customer Segments
          </h4>
          <div className="space-y-3">
            {analytics.chartData.customerSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                  <span className="text-sm text-gray-700">{segment.segment}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{segment.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({segment.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} />
            Order Status
          </h4>
          <div className="space-y-3">
            {analytics.chartData.orderStatuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-gray-700">{status.status}</span>
                </div>
                <span className="font-medium text-gray-900">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Business Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Top Traffic Source</h5>
            <p className="text-lg font-semibold text-blue-600">{analytics.performance.topTrafficSource}</p>
            <p className="text-sm text-gray-600">Driving most conversions</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Cart Abandonment</h5>
            <p className="text-lg font-semibold text-orange-600">{analytics.performance.cartAbandonmentRate}%</p>
            <p className="text-sm text-gray-600">Recovery opportunity available</p>
          </div>
        </div>
      </div>
    </div>
  );
}