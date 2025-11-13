import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Calendar, ShoppingBag, 
  DollarSign, Heart, Star, MessageCircle, Edit3, 
  MoreHorizontal, TrendingUp, Award, Clock, Tag
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';
import EnhancedButton from '../ui/EnhancedButton';
import GlassModal from '../ui/glass/GlassModal';
import toast from 'react-hot-toast';

const CustomerProfile = ({ customerId, isOpen, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (customerId && isOpen) {
      fetchCustomerData();
    }
  }, [customerId, isOpen]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, ordersRes, analyticsRes] = await Promise.all([
        api.get(`/admin/customers/${customerId}`),
        api.get(`/admin/customers/${customerId}/orders`),
        api.get(`/admin/customers/${customerId}/analytics`)
      ]);
      
      setCustomer(customerRes.data.customer);
      setOrders(ordersRes.data.orders);
      setAnalytics(analyticsRes.data.analytics);
      setEditData(customerRes.data.customer);
    } catch (error) {
      toast.error('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      await api.put(`/admin/customers/${customerId}`, editData);
      setCustomer({ ...customer, ...editData });
      setShowEditModal(false);
      toast.success('Customer updated successfully');
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const getCustomerSegment = (customer) => {
    if (!customer || !analytics) return 'Regular';
    
    const { totalSpent, orderCount } = analytics;
    
    if (totalSpent >= 50000) return 'VIP';
    if (totalSpent >= 20000 || orderCount >= 10) return 'Premium';
    if (orderCount >= 3) return 'Loyal';
    return 'Regular';
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Premium': return 'bg-blue-100 text-blue-800';
      case 'Loyal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', change, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp 
                size={12} 
                className={change > 0 ? 'text-green-500' : 'text-red-500'} 
              />
              <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  if (loading) {
    return (
      <GlassModal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </GlassModal>
    );
  }

  if (!customer) {
    return (
      <GlassModal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="xl">
        <div className="text-center py-8">
          <p className="text-gray-500">Customer not found</p>
        </div>
      </GlassModal>
    );
  }

  const segment = getCustomerSegment(customer);

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="xl">
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                {customer.avatar ? (
                  <img 
                    src={customer.avatar} 
                    alt={customer.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <p className="opacity-90">{customer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getSegmentColor(segment)}`}>
                    {segment}
                  </span>
                  {customer.isVerified && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Star size={12} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <EnhancedButton
              variant="secondary"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              <Edit3 size={16} />
              Edit
            </EnhancedButton>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Orders"
            value={analytics?.orderCount || 0}
            icon={ShoppingBag}
            color="blue"
            delay={0.1}
          />
          <MetricCard
            title="Total Spent"
            value={`৳${analytics?.totalSpent?.toLocaleString() || 0}`}
            icon={DollarSign}
            color="green"
            delay={0.2}
          />
          <MetricCard
            title="Avg Order Value"
            value={`৳${analytics?.avgOrderValue?.toLocaleString() || 0}`}
            icon={TrendingUp}
            color="purple"
            delay={0.3}
          />
          <MetricCard
            title="Customer Since"
            value={customer.createdAt ? new Date(customer.createdAt).getFullYear() : 'N/A'}
            icon={Calendar}
            color="orange"
            delay={0.4}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white/80 backdrop-blur-md rounded-xl p-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={User}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="orders"
            label="Orders"
            icon={ShoppingBag}
            isActive={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={TrendingUp}
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <TabButton
            id="communication"
            label="Communication"
            icon={MessageCircle}
            isActive={activeTab === 'communication'}
            onClick={() => setActiveTab('communication')}
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-900">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-900">{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-gray-900">{customer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-900">
                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Order</span>
                    <span className="font-medium">
                      {analytics?.lastOrderDate 
                        ? new Date(analytics.lastOrderDate).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Favorite Category</span>
                    <span className="font-medium">{analytics?.favoriteCategory || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Return Rate</span>
                    <span className="font-medium">{analytics?.returnRate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lifetime Value</span>
                    <span className="font-medium text-green-600">
                      ৳{analytics?.lifetimeValue?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{order.orderNumber || order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ৳{order.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && analytics?.chartData && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Pattern</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="spending" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Edit Customer Modal */}
        <GlassModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Customer"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={editData.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <EnhancedButton
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                onClick={handleUpdateCustomer}
              >
                Save Changes
              </EnhancedButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </GlassModal>
  );
};

export default CustomerProfile;