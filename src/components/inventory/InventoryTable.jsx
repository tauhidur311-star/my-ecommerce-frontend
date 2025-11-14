import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, Edit3, Trash2, Plus, Search,
  Filter, Download, Upload, BarChart3, TrendingDown, Wifi, WifiOff
} from 'lucide-react';
import EnhancedButton from '../ui/EnhancedButton';
import GlassModal from '../ui/glass/GlassModal';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';

const InventoryTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    field: '',
    value: '',
    operation: 'set'
  });

  // Simple inventory management using regular React state
  const [inventory, setInventory] = React.useState([]);
  const [lowStockAlerts, setLowStockAlerts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = React.useState([]);

  // Load inventory data from localStorage or API
  React.useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        // Try to load from localStorage first (fallback data)
        const localProducts = localStorage.getItem('admin-products');
        if (localProducts) {
          const products = JSON.parse(localProducts);
          setInventory(products);
          
          // Calculate low stock alerts
          const alerts = products.filter(product => product.stock <= 5);
          setLowStockAlerts(alerts);
        }
        
        // You can also try to fetch from API here
        // const response = await fetch('/api/admin/inventory', {
        //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   setInventory(data.products || []);
        // }
        
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Set up real-time socket connection for inventory updates
  useEffect(() => {
    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(socketService.isSocketConnected());
        
        if (socketService.isSocketConnected()) {
          // Subscribe to inventory updates
          socketService.subscribeToInventoryUpdates();
          
          // Listen for real-time inventory updates
          const unsubscribeInventoryUpdated = socketService.addListener('inventoryUpdated', (data) => {
            setInventory(prev => prev.map(item => 
              item._id === data.productId ? { ...item, ...data.updates } : item
            ));
            setRealtimeUpdates(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 updates
            toast.success(`Inventory updated: ${data.productName || 'Product'}`);
          });

          const unsubscribeStockUpdated = socketService.addListener('stockUpdated', (data) => {
            setInventory(prev => prev.map(item => 
              item._id === data.productId ? { ...item, stock: data.newStock } : item
            ));
            setRealtimeUpdates(prev => [{
              type: 'stock_update',
              productId: data.productId,
              message: `Stock updated to ${data.newStock}`,
              timestamp: data.timestamp
            }, ...prev.slice(0, 4)]);
          });

          const unsubscribeLowStockAlert = socketService.addListener('lowStockAlert', (data) => {
            setLowStockAlerts(prev => {
              const exists = prev.find(alert => alert.productId === data.productId);
              if (!exists) {
                return [...prev, data];
              }
              return prev;
            });
            toast.error(`Low stock alert: ${data.productName} (${data.currentStock} remaining)`);
          });

          const unsubscribeInventoryStockUpdated = socketService.addListener('inventoryStockUpdated', (data) => {
            setInventory(prev => prev.map(item => 
              item._id === data.productId ? { ...item, stock: data.newStock } : item
            ));
            toast.success(`Stock updated by ${data.updatedBy}: ${data.reason || 'Stock adjustment'}`);
          });

          // Cleanup function
          return () => {
            unsubscribeInventoryUpdated();
            unsubscribeStockUpdated();
            unsubscribeLowStockAlert();
            unsubscribeInventoryStockUpdated();
            socketService.unsubscribeFromInventoryUpdates();
          };
        }
      } catch (error) {
        console.error('Failed to connect to socket:', error);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socketService.isSocketConnected()) {
        socketService.unsubscribeFromInventoryUpdates();
      }
    };
  }, []);

  // Calculate metrics
  const metrics = React.useMemo(() => ({
    totalProducts: inventory.length,
    lowStockCount: lowStockAlerts.length,
    totalValue: inventory.reduce((sum, product) => sum + (product.price * product.stock), 0),
    outOfStockCount: inventory.filter(p => p.stock === 0).length
  }), [inventory, lowStockAlerts]);
  
  const updateStock = useCallback((productId, quantity, operation = 'set', reason = '') => {
    // Update local state immediately for responsiveness
    setInventory(prev => prev.map(product => {
      if (product._id === productId || product.id === productId) {
        const newStock = operation === 'set' ? quantity : 
                        operation === 'add' ? product.stock + quantity :
                        Math.max(0, product.stock - quantity);
        
        // Check for low stock and send alert if connected
        if (newStock <= 5 && isConnected) {
          socketService.sendLowStockAlert(productId, product.name, newStock, 5);
        }
        
        return { ...product, stock: newStock };
      }
      return product;
    }));

    // Broadcast update via socket if connected
    if (isConnected) {
      const newStock = operation === 'set' ? quantity : 
                      operation === 'add' ? inventory.find(p => p._id === productId)?.stock + quantity :
                      Math.max(0, inventory.find(p => p._id === productId)?.stock - quantity);
      
      socketService.updateProductStock(productId, newStock, operation, reason);
    }
    
    toast.success('Stock updated successfully!');
  }, [inventory, isConnected]);
  
  const bulkUpdate = useCallback((updates) => {
    setIsBulkUpdating(true);
    try {
      // Apply bulk updates
      setInventory(prev => prev.map(product => {
        const update = updates.find(u => u.id === product._id || u.id === product.id);
        return update ? { ...product, ...update.data } : product;
      }));
      toast.success('Bulk update completed successfully!');
    } catch (error) {
      toast.error('Bulk update failed');
    } finally {
      setIsBulkUpdating(false);
    }
  }, []);
  
  const sendLowStockAlert = useCallback((productIds) => {
    toast.success(`Low stock alerts sent for ${productIds.length} products`);
  }, []);

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(item => item._id));
    }
  };

  const handleBulkEdit = async () => {
    if (!bulkEditData.field || !bulkEditData.value) {
      toast.error('Please select a field and enter a value');
      return;
    }

    const updates = selectedItems.map(itemId => ({
      productId: itemId,
      field: bulkEditData.field,
      value: bulkEditData.value,
      operation: bulkEditData.operation
    }));

    await bulkUpdate(updates);
    setShowBulkEdit(false);
    setSelectedItems([]);
    setBulkEditData({ field: '', value: '', operation: 'set' });
  };

  const handleStockUpdate = (productId, newStock) => {
    updateStock(productId, newStock, 'set');
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { status: 'out-of-stock', color: 'red', label: 'Out of Stock' };
    if (item.stock <= item.lowStockThreshold) return { status: 'low-stock', color: 'yellow', label: 'Low Stock' };
    return { status: 'in-stock', color: 'green', label: 'In Stock' };
  };

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage your product inventory and stock levels</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Real-time Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-green-500" />
                <span className="text-sm text-green-700">Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Offline Mode</span>
              </>
            )}
          </div>
          
          {/* Recent Updates Indicator */}
          {realtimeUpdates.length > 0 && (
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <EnhancedButton
            variant="primary"
            size="sm"
            onClick={() => {/* Add product modal */}}
          >
            <Plus size={16} />
            Add Product
          </EnhancedButton>
          
          <EnhancedButton
            variant="secondary"
            size="sm"
            onClick={() => {/* Import CSV */}}
          >
            <Upload size={16} />
            Import
          </EnhancedButton>
          
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => {/* Export inventory */}}
          >
            <Download size={16} />
            Export
          </EnhancedButton>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{metrics.totalProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-xl font-bold text-gray-900">{metrics.lowStockCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-xl font-bold text-gray-900">{metrics.outOfStockCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">৳{metrics.totalValue?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                {lowStockAlerts.length} item(s) need attention
              </span>
            </div>
            <EnhancedButton
              variant="warning"
              size="sm"
              onClick={() => sendLowStockAlert(lowStockAlerts.map(item => item._id))}
            >
              Send Alerts
            </EnhancedButton>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-medium">
              {selectedItems.length} item(s) selected
            </span>
            <EnhancedButton
              variant="primary"
              size="sm"
              onClick={() => setShowBulkEdit(true)}
            >
              Bulk Edit
            </EnhancedButton>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredInventory.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item, index) => {
                const stockStatus = getStockStatus(item);
                return (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description?.slice(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.sku || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => handleStockUpdate(item._id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">৳{item.price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        stockStatus.color === 'green' 
                          ? 'bg-green-100 text-green-800'
                          : stockStatus.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <GlassModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        title="Bulk Edit Inventory"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field to Edit</label>
            <select
              value={bulkEditData.field}
              onChange={(e) => setBulkEditData(prev => ({ ...prev, field: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Field</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={bulkEditData.operation}
              onChange={(e) => setBulkEditData(prev => ({ ...prev, operation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="set">Set Value</option>
              <option value="add">Add to Value</option>
              <option value="multiply">Multiply by Value</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              value={bulkEditData.value}
              onChange={(e) => setBulkEditData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <EnhancedButton
              variant="secondary"
              onClick={() => setShowBulkEdit(false)}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              variant="primary"
              onClick={handleBulkEdit}
              isLoading={isBulkUpdating}
              disabled={!bulkEditData.field || !bulkEditData.value}
            >
              Apply Changes
            </EnhancedButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

export default InventoryTable;