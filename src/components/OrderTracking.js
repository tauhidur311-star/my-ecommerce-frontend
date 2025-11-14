import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const OrderTracking = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getOrder(orderId);
      if (response.success) {
        setOrder(response.data);
        setTracking(response.data.tracking);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    try {
      setRefreshing(true);
      await loadOrderDetails();
      toast.success('Tracking information updated');
    } catch (error) {
      toast.error('Failed to refresh tracking information');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'out_for_delivery':
        return <MapPin className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-orange-600 bg-orange-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'out_for_delivery':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const orderStatuses = [
    { key: 'pending', label: 'Order Placed', description: 'Your order has been placed successfully' },
    { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed and payment verified' },
    { key: 'processing', label: 'Processing', description: 'Your order is being prepared for shipment' },
    { key: 'shipped', label: 'Shipped', description: 'Your order has been shipped and is on its way' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is out for delivery' },
    { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered successfully' }
  ];

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    return orderStatuses.findIndex(status => status.key === order.status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-4">Unable to find order details</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
              <p className="text-gray-600">Order #{order._id?.slice(-8)}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshTracking}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Order Status Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Current Status</h3>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-bold text-gray-900">৳{order.totalAmount}</p>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-blue-700">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Order Progress</h3>
            <div className="space-y-4">
              {orderStatuses.map((status, index) => {
                const currentIndex = getCurrentStatusIndex();
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isActive = isCompleted || isCurrent;

                return (
                  <div key={status.key} className="flex items-start space-x-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-500'}`} />
                        )}
                      </div>
                      {index < orderStatuses.length - 1 && (
                        <div className={`w-0.5 h-12 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {status.label}
                        </h4>
                        {tracking?.updates && tracking.updates.find(update => update.status === status.key) && (
                          <span className="text-sm text-gray-500">
                            {formatDate(tracking.updates.find(update => update.status === status.key).timestamp)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                        {status.description}
                      </p>
                      
                      {/* Additional tracking info */}
                      {tracking?.updates && tracking.updates.find(update => update.status === status.key) && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {tracking.updates.find(update => update.status === status.key).message}
                          </p>
                          {tracking.updates.find(update => update.status === status.key).location && (
                            <p className="text-xs text-gray-500">
                              📍 {tracking.updates.find(update => update.status === status.key).location}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({order.items?.length})</span>
                  <span className="font-medium">৳{order.totalAmount - (order.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">৳{order.shippingCost || 0}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>৳{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productId?.name || 'Product'}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ৳{item.price}
                    </p>
                    {item.size && (
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">৳{item.quantity * item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Number */}
          {tracking?.trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Tracking Number</h4>
              <p className="text-blue-700 font-mono text-lg">{tracking.trackingNumber}</p>
              <p className="text-sm text-blue-600 mt-1">
                You can use this number to track your package on the carrier's website
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;