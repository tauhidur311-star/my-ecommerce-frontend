import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, Search, 
  Filter, Download, RefreshCw, Plus, Edit2, BarChart3, Eye, 
  ShoppingCart, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationContext';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const { sendInventoryNotification } = useNotifications();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, stockFilter, categoryFilter, sortBy]);

  useEffect(() => {
    checkLowStockAlerts();
  }, [products, lowStockThreshold]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = localStorage.getItem('admin-products');
      if (productsData) {
        const parsedProducts = JSON.parse(productsData);
        setProducts(parsedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      localStorage.setItem('admin-products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      toast.success('Inventory updated successfully!');
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error('Failed to update inventory');
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.id?.toString().includes(searchLower)
      );
    }

    // Stock filter
    switch (stockFilter) {
      case 'in_stock':
        filtered = filtered.filter(p => p.inStock && p.stock > 0);
        break;
      case 'low_stock':
        filtered = filtered.filter(p => p.inStock && p.stock <= lowStockThreshold && p.stock > 0);
        break;
      case 'out_of_stock':
        filtered = filtered.filter(p => !p.inStock || p.stock === 0);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'stock_asc':
        filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock_desc':
        filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }

    setFilteredProducts(filtered);
  };

  const checkLowStockAlerts = () => {
    const lowStockProducts = products.filter(p => 
      p.inStock && p.stock > 0 && p.stock <= lowStockThreshold
    );

    // Send notifications for critically low stock (only once per session)
    lowStockProducts.forEach(product => {
      const notificationKey = `low_stock_${product.id}`;
      const lastNotification = sessionStorage.getItem(notificationKey);
      
      if (!lastNotification) {
        sendInventoryNotification('lowStock', product.name, product.stock);
        sessionStorage.setItem(notificationKey, Date.now().toString());
      }
    });
  };

  const updateProductStock = async (productId, newStock, operation = 'set') => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        let finalStock = newStock;
        
        if (operation === 'add') {
          finalStock = (product.stock || 0) + newStock;
        } else if (operation === 'subtract') {
          finalStock = Math.max(0, (product.stock || 0) - newStock);
        }
        
        return {
          ...product,
          stock: finalStock,
          inStock: finalStock > 0,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });

    await saveProducts(updatedProducts);
  };

  const bulkUpdateStock = async (operation, value) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to update');
      return;
    }

    const updatedProducts = products.map(product => {
      if (selectedProducts.includes(product.id)) {
        let newStock = product.stock || 0;
        
        switch (operation) {
          case 'add':
            newStock += parseInt(value);
            break;
          case 'subtract':
            newStock = Math.max(0, newStock - parseInt(value));
            break;
          case 'set':
            newStock = parseInt(value);
            break;
          default:
            return product;
        }
        
        return {
          ...product,
          stock: newStock,
          inStock: newStock > 0,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });

    await saveProducts(updatedProducts);
    setSelectedProducts([]);
    setShowBulkActions(false);
    toast.success(`Bulk ${operation} completed for ${selectedProducts.length} products`);
  };

  const exportInventoryReport = () => {
    const csvHeader = 'Product ID,Name,Category,Stock,Price,Status,Last Updated\n';
    const csvData = filteredProducts.map(product => 
      [
        product.id,
        `"${product.name || ''}"`,
        product.category || '',
        product.stock || 0,
        product.price || 0,
        product.inStock ? 'In Stock' : 'Out of Stock',
        product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : ''
      ].join(',')
    ).join('\n');

    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Inventory report exported successfully!');
  };

  const getStockStatus = (product) => {
    if (!product.inStock || product.stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: XCircle };
    } else if (product.stock <= lowStockThreshold) {
      return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    }
  };

  const getStockTrend = (product) => {
    // Calculate trend based on sales vs current stock (simplified)
    const salesRate = product.sold || 0;
    const currentStock = product.stock || 0;
    
    if (salesRate > currentStock / 10) {
      return { icon: TrendingDown, color: 'text-red-500', label: 'Fast Moving' };
    } else if (salesRate < currentStock / 50) {
      return { icon: TrendingUp, color: 'text-blue-500', label: 'Slow Moving' };
    } else {
      return { icon: BarChart3, color: 'text-gray-500', label: 'Normal' };
    }
  };

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const inventoryStats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.inStock && p.stock > 0).length,
    lowStock: products.filter(p => p.inStock && p.stock > 0 && p.stock <= lowStockThreshold).length,
    outOfStock: products.filter(p => !p.inStock || p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600">Monitor stock levels and manage inventory</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          
          <button
            onClick={exportInventoryReport}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
          
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Package size={16} />
              Bulk Actions ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{inventoryStats.inStock}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
            </div>
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">৳{inventoryStats.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Low Stock:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
              className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>

          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-2">Show:</label>
            <span className="text-sm font-medium text-gray-900">
              {filteredProducts.length} of {products.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedProducts.length > 0 && (
        <BulkActionsPanel
          selectedCount={selectedProducts.length}
          onBulkUpdate={bulkUpdateStock}
          onClose={() => setShowBulkActions(false)}
        />
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your filters or add some products to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const stockTrend = getStockTrend(product);
                  const StatusIcon = stockStatus.icon;
                  const TrendIcon = stockTrend.icon;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => [...prev, product.id]);
                            } else {
                              setSelectedProducts(prev => prev.filter(id => id !== product.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/40'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <span className="capitalize">{product.category || 'Uncategorized'}</span>
                      </td>
                      
                      <td className="px-4 py-4">
                        <StockUpdateInput
                          productId={product.id}
                          currentStock={product.stock || 0}
                          onUpdate={updateProductStock}
                        />
                      </td>
                      
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        ৳{(product.price || 0).toLocaleString()}
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          <StatusIcon size={12} className="mr-1" />
                          {stockStatus.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <TrendIcon size={16} className={`mr-1 ${stockTrend.color}`} />
                          <span className={`text-xs ${stockTrend.color}`}>{stockTrend.label}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Open product details or edit modal
                              toast.info('Product details feature coming soon');
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stock Update Input Component
const StockUpdateInput = ({ productId, currentStock, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(currentStock);
  const [operation, setOperation] = useState('set');

  const handleUpdate = () => {
    if (newStock >= 0) {
      onUpdate(productId, parseInt(newStock), operation);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewStock(currentStock);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="set">Set</option>
          <option value="add">Add</option>
          <option value="subtract">Remove</option>
        </select>
        <input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
          min="0"
        />
        <button onClick={handleUpdate} className="text-green-600 hover:text-green-800">
          <CheckCircle size={14} />
        </button>
        <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
          <XCircle size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
    >
      <span>{currentStock}</span>
      <Edit2 size={12} />
    </button>
  );
};

// Bulk Actions Panel Component
const BulkActionsPanel = ({ selectedCount, onBulkUpdate, onClose }) => {
  const [operation, setOperation] = useState('add');
  const [value, setValue] = useState('');

  const handleBulkAction = () => {
    if (!value || parseInt(value) < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    onBulkUpdate(operation, value);
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">
          Bulk Actions ({selectedCount} items selected)
        </h3>
        <button onClick={onClose} className="text-purple-600 hover:text-purple-800">
          <XCircle size={20} />
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="add">Add Stock</option>
          <option value="subtract">Remove Stock</option>
          <option value="set">Set Stock To</option>
        </select>
        
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter quantity"
          className="border border-gray-300 rounded-lg px-3 py-2"
          min="0"
        />
        
        <button
          onClick={handleBulkAction}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default InventoryManagement;