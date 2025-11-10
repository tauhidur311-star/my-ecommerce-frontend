import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderManagement = ({ isAdmin = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
    returned: Package
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Try to load from API first, fallback to localStorage
      const orders = await loadOrdersFromStorage();
      setOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromStorage = async () => {
    try {
      const ordersData = localStorage.getItem(isAdmin ? 'admin-orders' : 'user-orders');
      if (ordersData) {
        let orders = JSON.parse(ordersData);
        
        // Apply filters
        if (statusFilter !== 'all') {
          orders = orders.filter(order => order.status === statusFilter);
        }
        
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
              filterDate = null;
          }
          
          if (filterDate) {
            orders = orders.filter(order => new Date(order.createdAt) >= filterDate);
          }
        }
        
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      return [];
    }
  };

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...(order.statusHistory || []),
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: note || `Status updated to ${getStatusDisplay(newStatus)}`,
                updatedBy: 'admin'
              }
            ]
          };
          
          // Set delivery date if delivered
          if (newStatus === 'delivered') {
            updatedOrder.actualDelivery = new Date().toISOString();
          }
          
          return updatedOrder;
        }
        return order;
      });
      
      // Save to localStorage
      localStorage.setItem(isAdmin ? 'admin-orders' : 'user-orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrders.find(o => o.id === orderId));
      }
      
      toast.success('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return statusMap[status] || status;
  };

  const formatPrice = (price) => `৳${price.toLocaleString()}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Filter Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters to see more orders.'
              : 'Orders will appear here once customers start placing them.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">
              {isAdmin ? 'All Orders' : 'Your Orders'} ({orders.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Package;
              
              return (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        {getStatusDisplay(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.shippingAddress.division}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'confirmed', 'Order confirmed by admin');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'processing', 'Order is being processed');
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            Process
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'shipped', 'Order has been shipped');
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            Ship
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'delivered', 'Order has been delivered');
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Deliver
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          isAdmin={isAdmin}
          formatPrice={formatPrice}
          formatDate={formatDate}
          getStatusDisplay={getStatusDisplay}
          statusColors={statusColors}
        />
      )}
    </div>
  );
};

const OrderDetailsModal = ({ 
  order, 
  onClose, 
  onUpdateStatus, 
  isAdmin, 
  formatPrice, 
  formatDate, 
  getStatusDisplay, 
  statusColors 
}) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [statusNote, setStatusNote] = useState('');

  const handleStatusUpdate = () => {
    if (newStatus !== order.status) {
      onUpdateStatus(order.id, newStatus, statusNote);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Order Details - {order.orderNumber}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Order Status</h4>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                {getStatusDisplay(order.status)}
              </span>
            </div>
            
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Note</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Add a note about this status update"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {order.customerInfo?.name || order.shippingAddress.fullName}</p>
                <p><strong>Email:</strong> {order.customerInfo?.email || 'N/A'}</p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>{order.shippingAddress.fullName}</strong></p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.district}, {order.shippingAddress.division}</p>
                {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
                <p className="flex items-center mt-2">
                  <Phone className="h-4 w-4 mr-1" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items ({order.items.length})
            </h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/60'}
                      alt={item.name}
                      className="w-15 h-15 object-cover rounded"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.size && ` • Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-600">each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Order Timeline
              </h4>
              <div className="space-y-3">
                {order.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {getStatusDisplay(status.status)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(status.timestamp)}</p>
                      {status.note && (
                        <p className="text-sm text-gray-700 mt-1">{status.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && newStatus !== order.status && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;