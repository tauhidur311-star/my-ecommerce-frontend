import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Filter, Target, TrendingUp, MapPin, Calendar,
  ShoppingBag, DollarSign, Star, Award, Plus, Search,
  Download, Mail, MessageCircle, Trash2, Edit3
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { api } from '../../services/api';
import EnhancedButton from '../ui/EnhancedButton';
import GlassModal from '../ui/glass/GlassModal';
import CustomerProfile from './CustomerProfile';
import toast from 'react-hot-toast';

const SEGMENT_COLORS = {
  VIP: '#8b5cf6',
  Premium: '#3b82f6', 
  Loyal: '#10b981',
  Regular: '#6b7280',
  'At Risk': '#f59e0b',
  Inactive: '#ef4444'
};

const SegmentationPanel = () => {
  const [segments, setSegments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customSegments, setCustomSegments] = useState([]);
  
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: {
      orderCount: { min: 0, max: null },
      totalSpent: { min: 0, max: null },
      lastOrderDays: { min: 0, max: null },
      location: '',
      category: ''
    }
  });

  useEffect(() => {
    fetchSegmentationData();
  }, []);

  const fetchSegmentationData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real customer data from multiple endpoints
      let customersData = [];
      let segmentsData = [];
      
      try {
        // Try different API endpoints for customer data
        const endpoints = ['/api/admin/customers', '/api/users', '/api/customers'];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              customersData = data.customers || data.users || data.data || data || [];
              if (customersData.length > 0) break;
            }
          } catch (endpointError) {
            console.warn(`Customer endpoint ${endpoint} failed:`, endpointError.message);
          }
        }
      } catch (apiError) {
        console.warn('Customer API calls failed, using fallback data');
      }
      
      // Generate customer data from existing user/order data if API fails
      if (customersData.length === 0) {
        const adminOrders = JSON.parse(localStorage.getItem('admin-orders') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Create customers from order data and current user
        const customerEmails = new Set();
        customersData = [];
        
        // Add current user as customer if role is customer
        if (currentUser.email && !customerEmails.has(currentUser.email)) {
          customerEmails.add(currentUser.email);
          customersData.push({
            _id: currentUser._id || Date.now().toString(),
            name: currentUser.name || 'Current User',
            email: currentUser.email,
            phone: '+880123456789',
            location: 'Dhaka',
            segment: 'Regular',
            orderCount: adminOrders.filter(o => o.customer?.email === currentUser.email).length,
            totalSpent: adminOrders
              .filter(o => o.customer?.email === currentUser.email)
              .reduce((sum, o) => sum + (o.total || 0), 0),
            lastOrderDate: adminOrders
              .filter(o => o.customer?.email === currentUser.email)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt || new Date().toISOString(),
            joinedDate: currentUser.createdAt || new Date().toISOString(),
            isActive: true
          });
        }
        
        // Extract customers from orders
        adminOrders.forEach(order => {
          if (order.customer?.email && !customerEmails.has(order.customer.email)) {
            customerEmails.add(order.customer.email);
            const customerOrders = adminOrders.filter(o => o.customer?.email === order.customer.email);
            const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            
            customersData.push({
              _id: order.customer.email.replace('@', '_').replace('.', '_'),
              name: order.customer.name || 'Customer',
              email: order.customer.email,
              phone: order.customer.phone || '+880123456789',
              location: order.shippingAddress?.city || 'Dhaka',
              segment: totalSpent > 20000 ? 'VIP' : totalSpent > 10000 ? 'Premium' : 'Regular',
              orderCount: customerOrders.length,
              totalSpent: totalSpent,
              lastOrderDate: customerOrders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt || new Date().toISOString(),
              joinedDate: customerOrders
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt || new Date().toISOString(),
              isActive: new Date() - new Date(customerOrders[customerOrders.length - 1]?.createdAt) < 30 * 24 * 60 * 60 * 1000
            });
          }
        });
        
        // If no real data found, show empty state
        console.log('No customer data available - showing empty state');
      }
      
      // Calculate segments based on customer data
      const segmentCounts = {};
      customersData.forEach(customer => {
        const segment = customer.segment || 'Regular';
        segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
      });
      
      segmentsData = Object.entries(segmentCounts).map(([name, count]) => ({
        name,
        count,
        color: SEGMENT_COLORS[name] || '#6b7280',
        percentage: Math.round((count / customersData.length) * 100)
      }));
      
      setSegments(segmentsData);
      setCustomers(customersData);
      setCustomSegments([]);
      
      console.log('Customer segmentation data loaded:', { segments: segmentsData.length, customers: customersData.length });
      
    } catch (error) {
      console.error('Error fetching segmentation data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSegment = async () => {
    if (!newSegment.name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    try {
      await api.post('/admin/customers/segments', newSegment);
      fetchSegmentationData();
      setShowCreateModal(false);
      setNewSegment({
        name: '',
        description: '',
        criteria: {
          orderCount: { min: 0, max: null },
          totalSpent: { min: 0, max: null },
          lastOrderDays: { min: 0, max: null },
          location: '',
          category: ''
        }
      });
      toast.success('Segment created successfully');
    } catch (error) {
      toast.error('Failed to create segment');
    }
  };

  const handleExportSegment = async (segmentName) => {
    try {
      const response = await api.get(`/admin/customers/segments/${segmentName}/export`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${segmentName}-customers.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Customer data exported successfully');
    } catch (error) {
      toast.error('Failed to export customer data');
    }
  };

  const handleSendCampaign = async (segmentName) => {
    try {
      // This would open a campaign creation modal or redirect to campaign page
      toast.info('Campaign feature coming soon');
    } catch (error) {
      toast.error('Failed to initiate campaign');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const getSegmentIcon = (segment) => {
    switch (segment) {
      case 'VIP': return <Award className="w-4 h-4" />;
      case 'Premium': return <Star className="w-4 h-4" />;
      case 'Loyal': return <Users className="w-4 h-4" />;
      case 'At Risk': return <TrendingUp className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const SegmentCard = ({ segment, count, percentage, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 cursor-pointer transition-all hover:shadow-lg ${
        selectedSegment === segment.toLowerCase() ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedSegment(segment.toLowerCase())}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${SEGMENT_COLORS[segment]}20` }}
          >
            <div style={{ color: SEGMENT_COLORS[segment] }}>
              {getSegmentIcon(segment)}
            </div>
          </div>
          <span className="font-medium text-gray-900">{segment}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExportSegment(segment);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSendCampaign(segment);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Mail size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{count}</span>
          <span className="text-sm text-gray-500">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: SEGMENT_COLORS[segment] }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  const totalCustomers = segments.reduce((sum, seg) => sum + seg.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation</h2>
          <p className="text-gray-600">Analyze and manage customer segments for targeted marketing</p>
        </div>
        
        <EnhancedButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Create Segment
        </EnhancedButton>
      </div>

      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 cursor-pointer transition-all hover:shadow-lg ${
            selectedSegment === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedSegment('all')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">All Customers</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
          <div className="text-sm text-gray-500">100%</div>
        </motion.div>

        {segments.map((segment, index) => (
          <SegmentCard
            key={segment.name}
            segment={segment.name}
            count={segment.count}
            percentage={Math.round((segment.count / totalCustomers) * 100)}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>

      {/* Segment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segments}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {segments.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SEGMENT_COLORS[entry.name] || '#6b7280'} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalValue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSegment === 'all' ? 'All Customers' : `${selectedSegment} Customers`}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredCustomers.length} customers)
              </span>
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomerId(customer._id);
                    setShowCustomerProfile(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${SEGMENT_COLORS[customer.segment]}20`,
                        color: SEGMENT_COLORS[customer.segment]
                      }}
                    >
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.orderCount || 0}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ৳{customer.totalSpent?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {customer.lastOrderDate 
                      ? new Date(customer.lastOrderDate).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open email modal
                        }}
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open chat
                        }}
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Segment Modal */}
      <GlassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Custom Segment"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name</label>
              <input
                type="text"
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                placeholder="e.g., High Value Customers"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                placeholder="Brief description of this segment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Segmentation Criteria</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Count</label>
                <input
                  type="number"
                  value={newSegment.criteria.orderCount.min}
                  onChange={(e) => setNewSegment({
                    ...newSegment,
                    criteria: {
                      ...newSegment.criteria,
                      orderCount: { ...newSegment.criteria.orderCount, min: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Total Spent (৳)</label>
                <input
                  type="number"
                  value={newSegment.criteria.totalSpent.min}
                  onChange={(e) => setNewSegment({
                    ...newSegment,
                    criteria: {
                      ...newSegment.criteria,
                      totalSpent: { ...newSegment.criteria.totalSpent, min: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <EnhancedButton
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              variant="primary"
              onClick={handleCreateSegment}
              disabled={!newSegment.name.trim()}
            >
              Create Segment
            </EnhancedButton>
          </div>
        </div>
      </GlassModal>

      {/* Customer Profile Modal */}
      <CustomerProfile
        customerId={selectedCustomerId}
        isOpen={showCustomerProfile}
        onClose={() => {
          setShowCustomerProfile(false);
          setSelectedCustomerId(null);
        }}
      />
    </div>
  );
};

export default SegmentationPanel;