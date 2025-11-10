import React, { useState, useEffect } from 'react';
import { 
  Bell, AlertCircle, CheckCircle, Info, 
  X, Trash2, MarkAsRead, Send, Users,
  Package, TrendingUp, Settings, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    
    // Generate sample notifications
    const sampleNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'Order #1015 has been placed by Customer 5',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        action: 'view_order',
        actionData: { orderId: '1015' }
      },
      {
        id: 2,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Premium Cotton Shirt is running low (only 3 left)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        action: 'update_inventory',
        actionData: { productId: 'prod-123' }
      },
      {
        id: 3,
        type: 'customer',
        title: 'New Customer Registration',
        message: 'Welcome new customer: john.doe@example.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        action: 'view_customer',
        actionData: { customerId: 'cust-456' }
      },
      {
        id: 4,
        type: 'system',
        title: 'Daily Sales Report',
        message: 'Yesterday\'s sales: ৳15,450 (12 orders)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium',
        action: 'view_analytics',
        actionData: {}
      },
      {
        id: 5,
        type: 'security',
        title: 'Login Alert',
        message: 'New admin login detected from Dhaka, Bangladesh',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        action: 'view_security',
        actionData: {}
      },
      {
        id: 6,
        type: 'order',
        title: 'Payment Confirmed',
        message: 'Payment for order #1014 has been confirmed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium',
        action: 'view_order',
        actionData: { orderId: '1014' }
      }
    ];

    setNotifications(sampleNotifications);
    setLoading(false);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(notif => !notif.read);
    }
    if (filter === 'all') {
      return notifications;
    }
    return notifications.filter(notif => notif.type === filter);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={20} className="text-blue-600" />;
      case 'inventory': return <AlertCircle size={20} className="text-orange-600" />;
      case 'customer': return <Users size={20} className="text-green-600" />;
      case 'system': return <TrendingUp size={20} className="text-purple-600" />;
      case 'security': return <Settings size={20} className="text-red-600" />;
      default: return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;
  const filteredNotifications = getFilteredNotifications();

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
          <h2 className="text-3xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600 mt-1">Stay updated with your store activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={18} />
            Mark All Read
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
            Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <Bell className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Unread</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{unreadCount}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">High Priority</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="text-orange-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {notifications.filter(n => {
                  const today = new Date().toDateString();
                  return new Date(n.timestamp).toDateString() === today;
                }).length}
              </p>
            </div>
            <Clock className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
            { id: 'inventory', label: 'Inventory', count: notifications.filter(n => n.type === 'inventory').length },
            { id: 'customer', label: 'Customers', count: notifications.filter(n => n.type === 'customer').length },
            { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 transition-all hover:shadow-md ${
                !notification.read ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-gray-300'
              } ${getPriorityColor(notification.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {getTimeAgo(notification.timestamp)}
                      </span>
                      <span className="capitalize">{notification.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <CreateNotificationModal 
          onClose={() => setShowCreateModal(false)}
          onSend={(notification) => {
            setNotifications(prev => [{
              id: Date.now(),
              ...notification,
              timestamp: new Date().toISOString(),
              read: false
            }, ...prev]);
            toast.success('Notification sent successfully!');
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// Create Notification Modal Component
function CreateNotificationModal({ onClose, onSend }) {
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    message: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.message) {
      onSend(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Send Notification</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="system">System</option>
              <option value="order">Order</option>
              <option value="inventory">Inventory</option>
              <option value="customer">Customer</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}