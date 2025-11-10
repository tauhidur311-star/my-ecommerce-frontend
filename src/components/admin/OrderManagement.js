import React, { useState, useEffect } from 'react';
import { 
  Package, Eye, CheckCircle, Clock, Truck, 
  Search, Download, RefreshCw, User, MapPin, X,
  Phone, Mail, Calendar, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X }
];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Check localStorage first, then generate sample data
      const savedOrders = localStorage.getItem('admin-orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        const sampleOrders = generateSampleOrders();
        setOrders(sampleOrders);
        localStorage.setItem('admin-orders', JSON.stringify(sampleOrders));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleOrders = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const customers = [
      { name: 'Ahmed Rahman', email: 'ahmed@example.com', phone: '+8801712345678' },
      { name: 'Fatima Khan', email: 'fatima@example.com', phone: '+8801812345678' },
      { name: 'Mohammad Ali', email: 'mohammad@example.com', phone: '+8801912345678' },
      { name: 'Ayesha Begum', email: 'ayesha@example.com', phone: '+8801612345678' },
      { name: 'Karim Hassan', email: 'karim@example.com', phone: '+8801512345678' }
    ];

    const sampleData = [];
    
    for (let i = 1; i <= 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      sampleData.push({
        id: `ORD-${1000 + i}`,
        orderNumber: `#${1000 + i}`,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total: (Math.random() * 8000 + 1000).toFixed(0),
        itemCount: Math.floor(Math.random() * 5 + 1),
        orderDate: orderDate.toISOString(),
        shippingAddress: {
          address: `House ${i + 10}, Road ${Math.floor(Math.random() * 20) + 1}, Dhanmondi, Dhaka-1205`,
          city: 'Dhaka',
          phone: customer.phone
        },
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
          id: index + 1,
          name: `Premium Product ${i}-${index + 1}`,
          price: (Math.random() * 3000 + 800).toFixed(0),
          quantity: Math.floor(Math.random() * 3 + 1),
          size: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)],
          image: 'https://via.placeholder.com/100x100'
        })),
        paymentMethod: Math.random() > 0.8 ? 'online' : 'cod',
        notes: i % 3 === 0 ? `Special instructions for order ${i}` : null
      });
    }
    
    return sampleData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      localStorage.setItem('admin-orders', JSON.stringify(updatedOrders));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const exportOrders = () => {
    const headers = ['Order #', 'Customer', 'Email', 'Phone', 'Status', 'Total', 'Items', 'Date'];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.status,
      `৳${order.total}`,
      order.itemCount,
      new Date(order.orderDate).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Orders exported successfully');
  };

  const getStatusInfo = (status) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    return { total, pending, processing, shipped, delivered, totalRevenue };
  };

  const stats = calculateOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-sm text-green-600 mt-1">Total Revenue: ৳{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <Package className="text-blue-600" size={40} />
          </div>
        </div>
        
        {ORDER_STATUSES.slice(0, 4).map((status, index) => {
          const count = stats[status.value] || 0;
          const StatusIcon = status.icon;
          
          return (
            <div key={status.value} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{status.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{((count / stats.total) * 100 || 0).toFixed(1)}%</p>
                </div>
                <StatusIcon className={`${
                  status.value === 'pending' ? 'text-yellow-600' :
                  status.value === 'processing' ? 'text-blue-600' :
                  status.value === 'shipped' ? 'text-purple-600' : 'text-green-600'
                }`} size={32} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers, emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
            <span className="font-medium">Showing {filteredOrders.length} of {orders.length} orders</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">{order.itemCount} items • {order.paymentMethod.toUpperCase()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-2 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusInfo.color} cursor-pointer`}
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">৳{parseInt(order.total).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
  const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);
  const StatusIcon = statusInfo?.icon || Package;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-600 mt-1">{order.orderNumber} • {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status and Quick Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${statusInfo.color.replace('text-', 'text-white ').replace('bg-', 'bg-')}`}>
                  <StatusIcon size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Current Status</h4>
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                    className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusInfo.color}`}
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">৳{parseInt(order.total).toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{order.paymentMethod.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-900">
                <User size={20} />
                Customer Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-medium">Name:</span> {order.customerName}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  <span className="font-medium">Email:</span> {order.customerEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" />
                  <span className="font-medium">Phone:</span> {order.customerPhone}
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-900">
                <MapPin size={20} />
                Shipping Address
              </h4>
              <div className="space-y-2 text-sm">
                <p>{order.shippingAddress.address}</p>
                <p className="font-medium">{order.shippingAddress.city}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Phone size={16} className="text-green-600" />
                  <span className="font-medium">Contact:</span> {order.shippingAddress.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Package size={20} />
              Order Items ({order.items.length} items)
            </h4>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-200 rounded text-sm">{item.size}</span>
                      </td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">৳{parseInt(item.price).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold">৳{(parseInt(item.price) * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right font-bold text-lg">Grand Total:</td>
                    <td className="px-6 py-4 font-bold text-xl text-blue-600">৳{parseInt(order.total).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="font-semibold mb-3 text-yellow-900">Order Notes</h4>
              <p className="text-yellow-800">{order.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Order Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Order Placed:</span>
                <span>{new Date(order.orderDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Current Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
}