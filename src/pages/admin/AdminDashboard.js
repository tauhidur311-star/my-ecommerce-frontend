import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, Package, Grid, Tag, List, Store as StoreIcon, Expand, Loader2, Activity, Mail } from 'lucide-react';
import ImageCropper from '../../components/ImageCropper';
import OrderManagement from '../../components/OrderManagement';
import AdvancedAnalytics from '../../components/AdvancedAnalytics';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import DarkModeToggle from '../../components/DarkModeToggle';
import NotificationProvider from '../../contexts/NotificationContext';
import NotificationBell from '../../components/NotificationBell';
import InventoryManagement from '../../components/InventoryManagement';
import EmailNotificationSystem from '../../components/EmailNotificationSystem';
import ThemeEditor from '../../components/design-editor/ThemeEditor';
import DashboardLayout from '../../layouts/DashboardLayout';
import MotionWrapper, { MotionCard, MotionGrid } from '../../components/MotionWrapper';
import GlassCard, { StatsCard } from '../../components/ui/GlassCard';
import FloatingWidget, { QuickActionWidget } from '../../components/ui/FloatingWidget';
import ContactSubmissions from '../../components/admin/ContactSubmissions';
import ContactInfoSettings from '../../components/admin/ContactInfoSettings';
import EmailTemplateEditor from '../../components/admin/EmailTemplateEditor';
import NotificationBanner from '../../components/admin/NotificationBanner';
import '../../styles/contactUs.css';
// import '../../styles/mobile-responsive.css';

const IMGBB_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your ImageBB API key
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

const storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }
};

window.storage = storage;

const AVAILABLE_SIZES = [
  { value: 'S', label: 'Small (S)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'L', label: 'Large (L)' },
  { value: 'XL', label: 'Extra Large (XL)' },
  { value: 'XXL', label: 'Double XL (XXL)' },
];

const getCroppedImg = async (imageSrc, crop) => {
  const image = new Image();
  image.src = imageSrc;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Wait for image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  // Set canvas dimensions to match the crop size
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'casual',
    images: [], // Changed from image: '' to images: []
    inStock: true,
    stock: 0,
    sizes: [],
    colors: [],
    sold: 0,
    showSoldNumbers: true,
    rating: null
  });
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState({ url: '', index: -1, originalWidth: 0, originalHeight: 0 });
  const [resizeScale, setResizeScale] = useState(100);
  const [isResizing, setIsResizing] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    logoUrl: '',
    brandName: '',
    links: [],
    settingsMenu: {
      about: { text: '', href: '/about' },
      contact: { text: '', href: '/contact' }
    }
  });
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'settings', 'contact-submissions', 'contact-settings'
  // const [loading, setLoading] = useState(false);
  // const [formErrors, setFormErrors] = useState({});
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard shortcuts integration
  const { showShortcutsHelp } = useKeyboardShortcuts({
    onNewProduct: () => setShowForm(!showForm),
    onSaveProduct: () => {
      if (showForm) {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
    },
    onSearch: () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) searchInput.focus();
    },
    onToggleTab: (tab) => setActiveTab(tab),
    onExportData: () => {
      // Export current data as CSV
      const dataToExport = activeTab === 'products' ? products : [];
      const csvContent = generateCSV(dataToExport);
      downloadCSV(csvContent, `${activeTab}-export.csv`);
    },
    onRefresh: () => {
      window.location.reload();
    },
    isFormOpen: showForm,
    currentTab: activeTab
  });

  // Load products from backend API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to load from backend API first
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const products = data.products || data.data || data;
          setProducts(products);
          
          // Also save to localStorage as backup
          await window.storage.set('admin-products', JSON.stringify(products));
        } else {
          // Fallback to localStorage
          const result = await window.storage.get('admin-products');
          if (result) {
            setProducts(JSON.parse(result.value));
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to localStorage on error
        try {
          const result = await window.storage.get('admin-products');
          if (result) {
            setProducts(JSON.parse(result.value));
          }
        } catch (storageError) {
          console.error('Storage error:', storageError);
          setProducts([]);
        }
      }
    };
    const loadSettings = async () => {
      try {
        const result = await window.storage.get('store-settings');
        if (result) {
          setStoreSettings(JSON.parse(result.value));
        } else {
          // Set default if not found
          setStoreSettings({ logoUrl: 'https://raw.githubusercontent.com/user-attachments/assets/5363c127-4f63-421c-a283-1b39332ae28c/react-bits-logo.svg', brandName: 'React Bits', links: [{ text: 'Products', href: '/' }], settingsMenu: { about: { text: 'About Us', href: '/about' }, contact: { text: 'Contact Us', href: '/contact' } } });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadProducts();
    loadSettings();
  }, []);

  const saveProducts = async (updatedProducts) => {
    try {
      await window.storage.set('admin-products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Failed to save products');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await window.storage.set('store-settings', JSON.stringify(storeSettings));
      toast.success('Store settings updated successfully!');
    } catch (error) {
      toast.error('Failed to save settings.');
    }
  };

  const uploadToImageBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    try {
      const response = await fetch(IMGBB_API_URL, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Update your handleInputChange function
  const handleInputChange = async (e) => {
    const { name, type, files } = e.target;

    if (type === 'file') {
      if (files.length > 0) {
        setFormData(prev => ({ ...prev, imageLoading: true }));
        const uploadPromises = Array.from(files).map(file => {
          try {
            validateFile(file);
            return uploadToImageBB(file);
          } catch (error) {
            toast.error(`Error with ${file.name}: ${error.message}`);
            return Promise.resolve(null);
          }
        });

        const urls = (await Promise.all(uploadPromises)).filter(Boolean);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls], imageLoading: false }));
        toast.success(`${urls.length} image(s) uploaded!`);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? e.target.checked : e.target.value
      }));
    }
  };

  const handleCropComplete = async (cropData) => {
    if (!cropData) {
      setShowImageCropper(false);
      setTempImage(null);
      return;
    }

    try {
      // Process cropped image
      const croppedImage = await getCroppedImg(tempImage, cropData);
      const formData = new FormData();
      formData.append('image', croppedImage);
      
      // Upload to ImageBB
      const response = await fetch(IMGBB_API_URL, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, images: [...prev.images, data.data.url], imageLoading: false }));
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    }
    
    setShowImageCropper(false);
    setTempImage(null);
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const productToSave = {
        ...formData,
        id: editingProduct ? editingProduct.id : Date.now().toString(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      let updatedProducts;
      if (editingProduct) {
        // Update existing product
        updatedProducts = products.map(p => 
          p.id === editingProduct.id ? productToSave : p
        );
      } else {
        // Add new product
        updatedProducts = [...products, productToSave];
      }

      // Try to save to backend API first
      try {
        const apiEndpoint = editingProduct 
          ? `${process.env.REACT_APP_API_URL}/api/products/${editingProduct.id || editingProduct._id}`
          : `${process.env.REACT_APP_API_URL}/api/products`;
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        const response = await fetch(apiEndpoint, {
          method: editingProduct ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productToSave),
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const savedProduct = await response.json();
          console.log('Saved product:', savedProduct);
          const backendProduct = savedProduct.product || savedProduct.data || savedProduct;
          
          if (editingProduct) {
            // Update existing product
            const updatedProducts = products.map(p => 
              (p.id === editingProduct.id || p._id === editingProduct._id) ? backendProduct : p
            );
            setProducts(updatedProducts);
            await window.storage.set('admin-products', JSON.stringify(updatedProducts));
          } else {
            // Add new product
            const updatedProducts = [...products, backendProduct];
            setProducts(updatedProducts);
            await window.storage.set('admin-products', JSON.stringify(updatedProducts));
          }
          
          alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.error('API save failed:', apiError);
        
        // Log detailed error information
        console.error('Error details:', {
          message: apiError.message,
          stack: apiError.stack,
          response: apiError.response
        });
        
        // Try to get response body if available
        if (apiError.response) {
          try {
            const errorBody = await apiError.response.text();
            console.error('Response body:', errorBody);
          } catch (e) {
            console.error('Could not read response body:', e);
          }
        }
        
        // Fallback to localStorage
        await window.storage.set('admin-products', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        alert((editingProduct ? 'Product updated' : 'Product added') + ' locally (API unavailable). Check console for details.');
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Storage error:', error);
      alert(`Failed to save product: ${error.message}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      images: product.images || [],
      inStock: product.inStock,
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const updatedProducts = products.filter(p => p.id !== productId);
    await saveProducts(updatedProducts);
    alert('Product deleted!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'casual',
      images: [],
      inStock: true,
      stock: 0,
      sizes: [], // Will now store array of size codes: ['S', 'M', 'L', etc.]
      colors: []
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const categories = ['casual', 'formal', 'party', 'wedding', 'sports'];

  // Add a helper function to format price with Taka sign
  const formatPrice = (price) => {
    return `৳${price}`;
  };

  // CSV export functionality for keyboard shortcut
  const generateCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Add file validation
  const validateFile = (file) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG and WebP are allowed.');
    }
    
    if (file.size > MAX_SIZE) {
      throw new Error('File too large. Maximum size is 2MB.');
    }
    
    return true;
  };

  const handleColorInput = (value) => {
    const colors = value
      .split(',')
      .map(color => color.trim())
      .filter(color => color.length > 0);

    setFormData(prev => ({
      ...prev,
      colors: colors
    }));
  };

  // Add this new function after validateFile
  const handleImageUrl = async (url) => {
    if (url && url.trim() !== '') {
      setFormData(prev => ({ ...prev, images: [...prev.images, url.trim()] }));
    }
  };

  const openImageEditor = (imageUrl, index) => {
    const img = new Image();
    img.onload = () => {
      setEditingImage({
        url: imageUrl,
        index: index,
        originalWidth: img.width,
        originalHeight: img.height,
        width: img.width,
        height: img.height,
      });
      setResizeScale(100);
      setShowImageEditor(true);
    };
    img.onerror = () => {
      toast.error("Could not load image to resize.");
    };
    img.src = imageUrl;
  };

  const handleScaleChange = (e) => {
    const scale = e.target.value;
    setResizeScale(scale);
    setEditingImage(prev => ({
      ...prev,
      width: Math.round(prev.originalWidth * (scale / 100)),
      height: Math.round(prev.originalHeight * (scale / 100)),
    }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const newDim = parseInt(value, 10) || 0;
    const otherDim = name === 'width' ? 'height' : 'width';
    const ratio = editingImage.originalHeight / editingImage.originalWidth;

    setEditingImage(prev => ({
      ...prev,
      [name]: newDim,
      [otherDim]: Math.round(name === 'width' ? newDim * ratio : newDim / ratio),
    }));
    // This is tricky, scale slider won't be perfectly in sync if user types manually
  };

  const handleApplyResize = async () => {
    setIsResizing(true);
    const { url, width, height } = editingImage;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";

    try {
      // Use a proxy to get around CORS issues for external URLs
      const response = await fetch(`https://images.weserv.nl/?url=${encodeURIComponent(url)}`);
      const blob = await response.blob();
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (resizedBlob) => {
          const newUrl = await uploadToImageBB(resizedBlob);
          const newImages = [...formData.images];
          newImages[editingImage.index] = newUrl;
          setFormData(prev => ({ ...prev, images: newImages }));
          setShowImageEditor(false);
          toast.success('Image resized and re-uploaded!');
          setIsResizing(false);
        }, 'image/jpeg');
      };
    } catch (error) {
      toast.error('Failed to resize image. Please try again.');
      setIsResizing(false);
    }
  };

  const getDashboardTitle = () => {
    const titles = {
      'products': 'Products Management',
      'orders': 'Orders Dashboard', 
      'analytics': 'Analytics Center',
      'inventory': 'Inventory Management',
      'emails': 'Email System',
      'design': 'Design Editor',
      'settings': 'Store Settings',
      'contact-submissions': 'Contact Submissions',
      'contact-settings': 'Contact Settings'
    };
    return titles[activeTab] || 'Admin Dashboard';
  };

  return (
    <NotificationProvider>
      <DashboardLayout section={activeTab} title={getDashboardTitle()}>
        <div className="min-h-screen relative">

      <Toaster position="bottom-center" />
      
      {/* Enhanced Action Bar */}
      <MotionWrapper delay={0.1}>
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.button 
                onClick={() => setShowForm(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                title="Add New Product (Ctrl+N)"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                Add New Product
              </motion.button>
              
              <motion.button
                onClick={showShortcutsHelp}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300/50 text-gray-700 rounded-lg hover:bg-gray-50/50 transition-all backdrop-blur-sm"
                title="Keyboard Shortcuts (Ctrl+?)"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⌨️ Shortcuts
              </motion.button>
            </div>
            
            <div className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </MotionWrapper>

      {/* Enhanced Stats with Glass Cards */}
      <MotionWrapper delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            icon={<Package className="w-6 h-6 text-white" />}
            title="Total Products"
            value={products.length}
            delay={0.1}
          />
          
          <StatsCard
            icon={<Tag className="w-6 h-6 text-white" />}
            title="In Stock"
            value={products.filter(p => p.inStock).length}
            change={5}
            delay={0.2}
          />
          
          <StatsCard
            icon={<List className="w-6 h-6 text-white" />}
            title="Out of Stock"
            value={products.filter(p => !p.inStock).length}
            change={-2}
            delay={0.3}
          />
          
          <StatsCard
            icon={<Grid className="w-6 h-6 text-white" />}
            title="Categories"
            value={new Set(products.map(p => p.category)).size}
            delay={0.4}
          />
        </div>
      </MotionWrapper>

          {/* Enhanced Tab Navigation */}
          <MotionWrapper delay={0.3}>
            <div className="tab-navigation mb-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-md rounded-xl shadow-lg">
              <div className="flex px-4 sm:px-6 overflow-x-auto scrollbar-hide">
                <motion.button 
                  onClick={() => setActiveTab('products')} 
                  className={`tab-button px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                    activeTab === 'products' 
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Package className="w-4 h-4 mr-2 inline" />
                  Products
                </motion.button>
              {[
                { key: 'orders', icon: List, label: 'Orders' },
                { key: 'analytics', icon: Grid, label: 'Analytics' },
                { key: 'realtime-analytics', icon: Activity, label: '📊 Real-time Analytics' },
                { key: 'inventory', icon: Package, label: 'Inventory' },
                { key: 'emails', icon: Upload, label: 'Emails' },
                { key: 'design', icon: Grid, label: 'Design' },
                { key: 'settings', icon: StoreIcon, label: 'Store Settings' },
                { key: 'contact-submissions', icon: null, label: '📧 Contact Submissions' },
                { key: 'contact-settings', icon: null, label: '📞 Contact Settings' },
                { key: 'email-templates', icon: Mail, label: '📄 Email Templates' }
              ].map(({ key, icon: Icon, label }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`tab-button px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                    activeTab === key
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2 inline" />}
                  {label}
                </motion.button>
              ))}
              </div>
            </div>
          </MotionWrapper>

        {/* Main Content Sections with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <OrderManagement isAdmin={true} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AdvancedAnalytics />
            </motion.div>
          )}

          {activeTab === 'realtime-analytics' && (
            <motion.div
              key="realtime-analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <InventoryManagement />
            </motion.div>
          )}

          {activeTab === 'emails' && (
            <motion.div
              key="emails"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <EmailNotificationSystem />
            </motion.div>
          )}

          {activeTab === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 bg-white z-[60] overflow-hidden"
            >
              <ThemeEditor />
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-200/50"
            >
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-800">Products List</h2>
                <p className="text-gray-600 text-sm mt-1">Manage your product inventory</p>
              </div>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No products yet</p>
                <p className="text-gray-400 text-sm">Click "Add New Product" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img
                            src={(product.images && product.images[0]) || 'https://via.placeholder.com/100'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.stock} units
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-200/50"
            >
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-xl font-bold text-gray-800">Store Settings</h2>
                <p className="text-gray-600 text-sm mt-1">Configure your store preferences</p>
              </div>
            <form onSubmit={handleSettingsSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                <input type="text" value={storeSettings.brandName} onChange={(e) => setStoreSettings(s => ({ ...s, brandName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input type="text" value={storeSettings.logoUrl} onChange={(e) => setStoreSettings(s => ({ ...s, logoUrl: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">"About Us" Link Text</label>
                <input type="text" value={storeSettings.settingsMenu.about.text} onChange={(e) => setStoreSettings(s => ({ ...s, settingsMenu: { ...s.settingsMenu, about: { ...s.settingsMenu.about, text: e.target.value } } }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">"Contact Us" Link Text</label>
                <input type="text" value={storeSettings.settingsMenu.contact.text} onChange={(e) => setStoreSettings(s => ({ ...s, settingsMenu: { ...s.settingsMenu, contact: { ...s.settingsMenu.contact, text: e.target.value } } }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <Save size={20} />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

          {/* Contact Submissions Tab */}
          {activeTab === 'contact-submissions' && (
            <motion.div
              key="contact-submissions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ContactSubmissions />
            </motion.div>
          )}

          {/* Contact Settings Tab */}
          {activeTab === 'contact-settings' && (
            <motion.div
              key="contact-settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ContactInfoSettings />
            </motion.div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'email-templates' && (
            <motion.div
              key="email-templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <EmailTemplateEditor />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Banner */}
        <NotificationBanner />

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Premium Cotton Salwar Kameez"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description..."
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Image upload section */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Image
                </label>
                <div className="space-y-4">
                  {/* Image Gallery Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, images: newImages }));
                              }}
                              className="bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                              title="Remove Image"
                            >
                              <X size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openImageEditor(img, index)}
                              className="bg-blue-500 text-white p-1 rounded-full shadow-md hover:bg-blue-600"
                              title="Resize Image"
                            >
                              <Expand size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Options */}
                  {formData.images.length < 5 && ( // Limit to 5 images for example
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* File Upload */}
                      <div>
                        <label
                          htmlFor="imageInput"
                          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500"
                        >
                          <input
                            type="file"
                            name="image"
                            accept="image/*" multiple
                            onChange={handleInputChange}
                            className="hidden"
                            id="imageInput"
                          />
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Upload from device</span>
                        </label>
                      </div>

                      {/* URL Input */}
                      <div>
                        <div className="flex flex-col h-full">
                          <input
                            type="url"
                            placeholder="Or paste image URL here"
                            className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            onBlur={(e) => {
                              handleImageUrl(e.target.value);
                              e.target.value = ''; // Clear after adding
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleImageUrl(e.target.value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading Spinner */}
                  {formData.imageLoading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <label key={size.value} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size.value)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            sizes: isChecked 
                              ? [...prev.sizes, size.value]
                              : prev.sizes.filter(s => s !== size.value)
                          }));
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colors (comma-separated)
                </label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors.join(', ')}
                  onChange={(e) => handleColorInput(e.target.value)}
                  placeholder="Red, Blue, Green"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* In Stock Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  In Stock
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <Save size={20} />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Component - Add this section */}
      {showImageCropper && (
        <ImageCropper
          image={tempImage} freeform={true}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Image Resizer Editor - Add this section */}
      {showImageEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full m-4">
            <h3 className="text-lg font-bold mb-4">Adjust Image Size</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-2 bg-gray-100 flex justify-center items-center" style={{ minHeight: '300px' }}>
                <img
                  src={editingImage.url}
                  alt="Preview"
                  className="max-w-full max-h-full"
                  style={{ maxHeight: '50vh', objectFit: 'contain' }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scale ({resizeScale}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={resizeScale}
                    onChange={handleScaleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Width</label>
                    <input
                      type="number" name="width" value={editingImage.width} onChange={handleDimensionChange}
                      className="w-full px-2 py-1 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Height</label>
                    <input
                      type="number" name="height" value={editingImage.height} onChange={handleDimensionChange}
                      className="w-full px-2 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageEditor(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyResize} disabled={isResizing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
                >
                  {isResizing && <Loader2 className="animate-spin" size={18} />}
                  {isResizing ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Quick Action Floating Widget */}
        <QuickActionWidget
          actions={[
            {
              icon: <Plus className="w-4 h-4" />,
              label: "Add Product",
              onClick: () => setShowForm(true)
            },
            {
              icon: <Upload className="w-4 h-4" />,
              label: "Import Data",
              onClick: () => console.log("Import clicked")
            },
            {
              icon: <Grid className="w-4 h-4" />,
              label: "Analytics",
              onClick: () => setActiveTab('analytics')
            }
          ]}
        />
        
        </div>
      </DashboardLayout>
    </NotificationProvider>
  );
}