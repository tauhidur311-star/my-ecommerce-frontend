import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Filter, Eye, Edit, Truck, DollarSign,
  Calendar, User, MapPin, Phone, Mail, Package, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Download,
  MoreHorizontal, CreditCard, FileText, ArrowUpDown
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // API functions
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        const ordersData = data.data || [];
        setOrders(ordersData);
        
        // Calculate stats from orders
        const orderStats = {
          total: ordersData.length,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0
        };

        // Calculate stats from orders data
        ordersData.forEach(order => {
          if (orderStats.hasOwnProperty(order.status)) {
            orderStats[order.status]++;
          }
          if (order.paymentStatus === 'completed' || order.paymentStatus === 'paid') {
            orderStats.totalRevenue += order.totalAmount || 0;
          }
        });

        setStats(orderStats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh orders list
        fetchOrders();
        return true;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const filterOrders = useCallback(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          console.warn('Unexpected dateFilter value:', dateFilter);
          break;
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, dateFilter]);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const OrderModal = ({ order, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span>{order.userId?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  <span>{order.userId?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span>{order.shippingAddress?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Shipping Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5" />
                  <span>{order.shippingAddress?.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-gray-500" />
                  <span>Standard Delivery</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-500" />
                    <span>Tracking: {order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">৳{item.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span>{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {(order.paymentStatus || 'pending').toUpperCase()}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="text-sm font-mono">{order.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>৳{(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>৳{(order.tax || 0).toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-৳{(order.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total:</span>
                  <span>৳{(order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 pt-4 border-t">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <FileText size={16} />
              Print
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${order.userId?.email || ''}?subject=Order Update: ${order.orderNumber}`)}
            >
              <Mail size={16} />
              Email Customer
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>
        
        <div className="flex items-center gap-3">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>

          <EnhancedButton
            variant="outline"
            size="sm"
          >
            <Download size={16} />
            Export
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={ShoppingBag}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="orange"
          delay={0.1}
        />
        <StatCard
          title="Processing"
          value={stats.processing}
          icon={Package}
          color="blue"
          delay={0.2}
        />
        <StatCard
          title="Shipped"
          value={stats.shipped}
          icon={Truck}
          color="purple"
          delay={0.3}
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          color="green"
          delay={0.4}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          color="red"
          delay={0.5}
        />
        <StatCard
          title="Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          delay={0.6}
        />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </GlassCard>

      {/* Orders Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-600">{order.paymentMethod}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.userId?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{order.userId?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">৳{(order.totalAmount || 0).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="More Actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Orders will appear here when customers make purchases.'
                }
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersManagement;