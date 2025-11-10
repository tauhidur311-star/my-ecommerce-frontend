import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, 
  ShoppingCart, Eye, Download, Calendar, Filter, BarChart3 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load from localStorage and generate analytics
      const products = JSON.parse(localStorage.getItem('admin-products') || '[]');
      const orders = JSON.parse(localStorage.getItem('admin-orders') || '[]');
      
      const analytics = generateAnalytics(products, orders, timeRange);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (products, orders, range) => {
    const startDate = getStartDate(range);
    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    // Revenue Analytics
    const totalRevenue = filteredOrders.reduce((sum, order) => 
      sum + (order.status !== 'cancelled' ? order.total : 0), 0
    );
    
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Product Analytics
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.inStock).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    
    // Customer Analytics
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customerId)).size;
    const returningCustomers = getReturningCustomers(orders);
    
    // Product Performance
    const topProducts = getTopProducts(filteredOrders, products);
    const lowStockProducts = products.filter(p => p.inStock && p.stock <= 5);
    
    // Sales by Division
    const salesByDivision = getSalesByDivision(filteredOrders);
    
    // Daily Sales Chart Data
    const dailySalesData = getDailySalesData(filteredOrders, range);
    
    // Growth Rates
    const previousPeriodOrders = getPreviousPeriodOrders(orders, range);
    const revenueGrowth = calculateGrowth(
      filteredOrders.reduce((sum, o) => sum + o.total, 0),
      previousPeriodOrders.reduce((sum, o) => sum + o.total, 0)
    );
    
    return {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        uniqueCustomers,
        revenueGrowth
      },
      products: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        topProducts,
        lowStockProducts
      },
      customers: {
        uniqueCustomers,
        returningCustomers,
        newCustomers: uniqueCustomers - returningCustomers
      },
      salesByDivision,
      dailySalesData,
      conversionRate: calculateConversionRate(products, filteredOrders)
    };
  };

  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case '24hours':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const getReturningCustomers = (allOrders) => {
    const customerOrderCounts = {};
    allOrders.forEach(order => {
      customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
    });
    return Object.values(customerOrderCounts).filter(count => count > 1).length;
  };

  const getTopProducts = (orders, products) => {
    const productSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0, name: item.name };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getSalesByDivision = (orders) => {
    const divisionSales = {};
    
    orders.forEach(order => {
      const division = order.shippingAddress?.division || 'Unknown';
      if (!divisionSales[division]) {
        divisionSales[division] = { orders: 0, revenue: 0 };
      }
      divisionSales[division].orders += 1;
      divisionSales[division].revenue += order.total;
    });

    return Object.entries(divisionSales)
      .map(([division, data]) => ({ division, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const getDailySalesData = (orders, range) => {
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 7;
    const dailyData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => 
        order.createdAt.split('T')[0] === dateStr
      );
      
      dailyData.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
      });
    }
    
    return dailyData;
  };

  const getPreviousPeriodOrders = (allOrders, range) => {
    const daysBack = range === '7days' ? 14 : range === '30days' ? 60 : 14;
    const rangeLength = range === '7days' ? 7 : range === '30days' ? 30 : 7;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - rangeLength);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    return allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate < endDate;
    });
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100);
  };

  const calculateConversionRate = (products, orders) => {
    // Simple conversion rate calculation
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalPurchases = orders.length;
    return totalViews > 0 ? (totalPurchases / totalViews * 100) : 0;
  };

  const exportData = async (format) => {
    try {
      if (format === 'csv') {
        const csvData = generateCSVData(analyticsData);
        downloadFile(csvData, 'analytics-report.csv', 'text/csv');
      } else if (format === 'json') {
        const jsonData = JSON.stringify(analyticsData, null, 2);
        downloadFile(jsonData, 'analytics-report.json', 'application/json');
      }
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const generateCSVData = (data) => {
    const csv = [];
    csv.push('Analytics Report');
    csv.push('');
    csv.push('Summary');
    csv.push('Metric,Value');
    csv.push(`Total Revenue,৳${data.summary.totalRevenue.toLocaleString()}`);
    csv.push(`Total Orders,${data.summary.totalOrders}`);
    csv.push(`Average Order Value,৳${data.summary.averageOrderValue.toFixed(2)}`);
    csv.push(`Unique Customers,${data.summary.uniqueCustomers}`);
    csv.push(`Revenue Growth,${data.summary.revenueGrowth.toFixed(1)}%`);
    
    csv.push('');
    csv.push('Top Products');
    csv.push('Product,Quantity Sold,Revenue');
    data.products.topProducts.forEach(product => {
      csv.push(`${product.name},${product.quantity},৳${product.revenue}`);
    });
    
    return csv.join('\n');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => `৳${amount.toLocaleString()}`;
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Advanced Analytics
          </h2>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          
          {/* Export Buttons */}
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => exportData('json')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={16} />
            JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.summary.totalRevenue)}
              </p>
              <p className={`text-sm flex items-center ${
                analyticsData.summary.revenueGrowth >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {analyticsData.summary.revenueGrowth >= 0 
                  ? <TrendingUp size={14} className="mr-1" />
                  : <TrendingDown size={14} className="mr-1" />
                }
                {formatPercentage(analyticsData.summary.revenueGrowth)}
              </p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.summary.totalOrders}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(analyticsData.summary.totalOrders / 7)} avg/day
              </p>
            </div>
            <ShoppingCart className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.summary.averageOrderValue)}
              </p>
              <p className="text-sm text-gray-500">per order</p>
            </div>
            <Package className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.customers.uniqueCustomers}
              </p>
              <p className="text-sm text-gray-500">
                {analyticsData.customers.newCustomers} new
              </p>
            </div>
            <Users className="text-indigo-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analyticsData.conversionRate)}
              </p>
              <p className="text-sm text-gray-500">view to purchase</p>
            </div>
            <Eye className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.dailySalesData.map((day, index) => {
              const maxRevenue = Math.max(...analyticsData.dailySalesData.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-full min-h-[4px] flex items-end justify-center"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} orders)`}
                  >
                    {height > 20 && (
                      <span className="text-white text-xs font-medium pb-1">
                        {day.orders}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analyticsData.products.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Division */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Sales by Division</h3>
          <div className="space-y-3">
            {analyticsData.salesByDivision.map((division, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{division.division}</p>
                  <p className="text-sm text-gray-600">{division.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(division.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
          {analyticsData.products.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-600">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData.products.lowStockProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-700">{product.stock} left</p>
                    <p className="text-xs text-yellow-600">Low stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;