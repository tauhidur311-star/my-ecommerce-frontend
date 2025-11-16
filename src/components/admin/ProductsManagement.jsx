import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Package, DollarSign,
  Eye, Star, TrendingUp, AlertTriangle, RefreshCw, Download,
  Grid, List, Image, CheckCircle, XCircle, ShoppingBag
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';
import AdminProductForm from '../AdminProductForm';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    sold: 0,
    rating: '',
    showSoldNumbers: false,
    inStock: true,
    isNew: false,
    images: []
  });

  // API functions
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        const productsData = data.data || [];
        setProducts(productsData);
        calculateStats(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (productsData) => {
    const stats = {
      total: productsData.length,
      inStock: productsData.filter(p => p.inStock && p.stock > 0).length,
      outOfStock: productsData.filter(p => !p.inStock || p.stock === 0).length,
      lowStock: productsData.filter(p => p.stock > 0 && p.stock <= 10).length,
      totalValue: productsData.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };
    setStats(stats);
  };

  const createProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
      if (data.success) {
        fetchProducts(); // Refresh list
        resetForm();
        setShowAddForm(false);
        return true;
      }
    } catch (error) {
      console.error('Error creating product:', error);
      return false;
    }
  };

  const updateProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json();
      if (data.success) {
        fetchProducts(); // Refresh list
        resetForm();
        setEditingProduct(null);
        return true;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      stock: '',
      sold: 0,
      rating: '',
      showSoldNumbers: false,
      inStock: true,
      isNew: false,
      images: []
    });
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      category: product.category || '',
      stock: product.stock || '',
      sold: product.sold || 0,
      rating: product.rating || '',
      showSoldNumbers: product.showSoldNumbers || false,
      inStock: product.inStock || false,
      isNew: product.isNew || false,
      images: product.images || []
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleFormSubmit = async () => {
    if (editingProduct) {
      await updateProduct(editingProduct._id);
    } else {
      await createProduct();
    }
  };

  const handleFormCancel = () => {
    resetForm();
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      if (stockFilter === 'inStock') {
        filtered = filtered.filter(product => product.inStock && product.stock > 0);
      } else if (stockFilter === 'outOfStock') {
        filtered = filtered.filter(product => !product.inStock || product.stock === 0);
      } else if (stockFilter === 'lowStock') {
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Image size={24} className="text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => deleteProduct(product._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">৳{product.price?.toLocaleString()}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            product.inStock && product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.inStock && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Stock: {product.stock}</span>
          <span>Sold: {product.sold || 0}</span>
        </div>

        {product.rating && (
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
      </div>
    </motion.div>
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <EnhancedButton variant="outline" onClick={handleFormCancel}>
            Back to Products
          </EnhancedButton>
        </div>

        <GlassCard>
          <AdminProductForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            editingProduct={editingProduct}
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-gray-600">Manage your product inventory and catalog</p>
        </div>
        <div className="flex gap-3">
          <EnhancedButton variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>
          <EnhancedButton variant="primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            Add Product
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="In Stock"
          value={stats.inStock}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Inventory Value"
          value={`৳${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          subtitle="Total stock value"
        />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stock Status</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
            <option value="lowStock">Low Stock</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Products Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? "You haven't added any products yet." 
                  : "No products match your current filters."
                }
              </p>
              {products.length === 0 && (
                <EnhancedButton variant="primary" onClick={() => setShowAddForm(true)}>
                  <Plus size={16} />
                  Add Your First Product
                </EnhancedButton>
              )}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsManagement;