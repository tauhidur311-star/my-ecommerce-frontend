import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, Download,
  PieChart, BarChart3, RefreshCw, Filter, CreditCard,
  Target, AlertCircle, Users, Package, ShoppingCart
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';

const FinancialReports = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);

  // Fetch financial data
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock financial data - replace with real API calls
      const mockData = generateFinancialData(dateRange);
      setFinancialData(mockData);
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock financial data
  const generateFinancialData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    
    const revenueData = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 15000) + 5000,
      profit: Math.floor(Math.random() * 8000) + 2000,
      expenses: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 20
    }));

    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const totalProfit = revenueData.reduce((sum, day) => sum + day.profit, 0);
    const totalExpenses = revenueData.reduce((sum, day) => sum + day.expenses, 0);
    const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);

    return {
      summary: {
        totalRevenue,
        totalProfit,
        totalExpenses,
        totalOrders,
        profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(1),
        avgOrderValue: (totalRevenue / totalOrders).toFixed(0),
        revenueGrowth: Math.random() * 20 + 5,
        profitGrowth: Math.random() * 15 + 3
      },
      revenueData,
      expenseBreakdown: [
        { name: 'Product Costs', value: 45, amount: totalExpenses * 0.45, color: '#3B82F6' },
        { name: 'Marketing', value: 20, amount: totalExpenses * 0.20, color: '#10B981' },
        { name: 'Operations', value: 15, amount: totalExpenses * 0.15, color: '#F59E0B' },
        { name: 'Shipping', value: 12, amount: totalExpenses * 0.12, color: '#EF4444' },
        { name: 'Other', value: 8, amount: totalExpenses * 0.08, color: '#8B5CF6' }
      ],
      paymentMethods: [
        { method: 'Credit Card', revenue: totalRevenue * 0.45, percentage: 45 },
        { method: 'Mobile Payment', revenue: totalRevenue * 0.30, percentage: 30 },
        { method: 'Bank Transfer', revenue: totalRevenue * 0.15, percentage: 15 },
        { method: 'Cash on Delivery', revenue: totalRevenue * 0.10, percentage: 10 }
      ],
      topProducts: [
        { name: 'iPhone 15 Pro', revenue: 450000, profit: 180000, units: 500 },
        { name: 'MacBook Pro', revenue: 380000, profit: 152000, units: 200 },
        { name: 'AirPods Pro', revenue: 120000, profit: 60000, units: 800 },
        { name: 'iPad Air', revenue: 95000, profit: 38000, units: 190 },
        { name: 'Apple Watch', revenue: 85000, profit: 34000, units: 340 }
      ]
    };
  };

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const exportReport = async (format) => {
    try {
      setLoading(true);
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (format === 'pdf') {
        // Mock PDF export
        alert('PDF report would be downloaded here');
      } else if (format === 'excel') {
        // Mock Excel export
        alert('Excel report would be downloaded here');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!financialData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading financial reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-600">Revenue, profit analysis and financial insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <EnhancedButton variant="outline" onClick={() => exportReport('excel')} disabled={loading}>
            <Download size={16} />
            Export Excel
          </EnhancedButton>
          <EnhancedButton variant="outline" onClick={() => exportReport('pdf')} disabled={loading}>
            <Download size={16} />
            Export PDF
          </EnhancedButton>
          <EnhancedButton variant="primary" onClick={fetchFinancialData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`৳${financialData.summary.totalRevenue.toLocaleString()}`}
          change={financialData.summary.revenueGrowth}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Net Profit"
          value={`৳${financialData.summary.totalProfit.toLocaleString()}`}
          change={financialData.summary.profitGrowth}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Profit Margin"
          value={`${financialData.summary.profitMargin}%`}
          icon={Target}
          color="purple"
          subtitle={`৳${financialData.summary.avgOrderValue} avg order`}
        />
        <MetricCard
          title="Total Orders"
          value={financialData.summary.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="orange"
          subtitle={`৳${financialData.summary.avgOrderValue} per order`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend */}
        <GlassCard title="Revenue & Profit Trend">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={financialData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                formatter={(value, name) => [`৳${value.toLocaleString()}`, name]}
                labelStyle={{color: '#374151'}}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Expense Breakdown */}
        <GlassCard title="Expense Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={financialData.expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {financialData.expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </RechartsPie>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Payment Methods & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Revenue */}
        <GlassCard title="Revenue by Payment Method">
          <div className="space-y-4">
            {financialData.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">৳{method.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{method.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Products by Revenue */}
        <GlassCard title="Top Products by Revenue">
          <div className="space-y-4">
            {financialData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.units} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">৳{product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">৳{product.profit.toLocaleString()} profit</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Financial Summary Table */}
      <GlassCard title="Financial Summary">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Metric</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Gross Revenue</td>
                <td className="px-6 py-4 text-sm text-right font-medium">৳{financialData.summary.totalRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-right">100%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Total Expenses</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-red-600">-৳{financialData.summary.totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-right">{((financialData.summary.totalExpenses/financialData.summary.totalRevenue)*100).toFixed(1)}%</td>
              </tr>
              <tr className="bg-green-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Net Profit</td>
                <td className="px-6 py-4 text-sm text-right font-bold text-green-600">৳{financialData.summary.totalProfit.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-right font-bold">{financialData.summary.profitMargin}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default FinancialReports;