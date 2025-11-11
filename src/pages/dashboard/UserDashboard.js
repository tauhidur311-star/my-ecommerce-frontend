import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Save, ArrowLeft, Package, Heart, 
  ShoppingCart, Settings, Bell, Shield, CreditCard, MapPin as AddressIcon, ExternalLink 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import NotificationBell from '../../components/NotificationBell';
import { useSocket } from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import enhancedApiService from '../../services/enhancedApi';

const bangladeshDivisions = [
  'Barisal',
  'Chittagong',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet'
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, terminateAllSessions } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    address: '',
    phone: '',
    province: ''
  });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'profile';
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionWarnings, setSessionWarnings] = useState([]);
  const [newAddress, setNewAddress] = useState({
    label: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  
  // Initialize socket connection for real-time features
  const { isConnected } = useSocket();

  useEffect(() => {
    const fetchUserData = async () => {
      // If auth is still loading, wait
      if (authLoading) return;
      
      // If not authenticated, redirect to login
      if (!user) {
        setLoading(false);
        toast.error('You must be logged in to view this page.');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        // Helper function to extract address string from object
        const extractAddress = (addressData) => {
          if (typeof addressData === 'string') {
            return addressData;
          }
          if (typeof addressData === 'object' && addressData) {
            return addressData.street || addressData.address || '';
          }
          return '';
        };

        // First, set user data from auth context (immediate fallback)
        if (user) {
          const authData = {
            name: user.name || '',
            address: extractAddress(user.address),
            phone: user.phone || '',
            province: user.province || ''
          };
          setUserData(authData);
        }

        // Then try to fetch from API for any updates
        try {
          const response = await enhancedApiService.request('/api/users/profile');
          
          if (response.success && response.user) {
            const apiData = {
              name: response.user.name || user?.name || '',
              address: extractAddress(response.user.address) || extractAddress(user?.address) || '',
              phone: response.user.phone || user?.phone || '',
              province: response.user.province || user?.province || ''
            };
            setUserData(apiData);
          }
        } catch (apiError) {
          // Keep using auth context data - API fetch is optional
        }
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        
        // Ensure we always have user data from auth context as minimum
        if (user) {
          setUserData({
            name: user.name || '',
            address: user.address || '',
            phone: user.phone || '',
            province: user.province || ''
          });
        }

        // If it's an authentication error, navigate to login
        if (error.message.includes('Authentication') || error.message.includes('token')) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserOrders = async (retryCount = 0) => {
      try {
        const response = await enhancedApiService.request('/api/orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        if (err.response?.status === 429) {
          const retryAfter = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.log(`Rate limited. Retrying in ${Math.ceil(retryAfter / 1000)} seconds...`);
          
          setTimeout(() => {
            fetchUserOrders(retryCount + 1);
          }, retryAfter);
        } else if (err.response?.status === 401) {
          navigate('/');
        } else {
          console.error('Failed to load orders. Please try again.', err);
        }
      }
    };

    const fetchUserWishlist = async () => {
      try {
        const response = await enhancedApiService.request('/api/wishlist');
        setWishlist(response.data.items || []);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    };

    const fetchCartCount = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        }
      } catch (err) {
        console.error('Failed to load cart count:', err);
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const response = await enhancedApiService.request('/api/notifications/unread-count');
        setNotificationCount(response.count || 0);
      } catch (err) {
        // Notification API might not be implemented yet
        setNotificationCount(0);
      }
    };

    const fetchActiveSessions = async () => {
      try {
        const response = await enhancedApiService.request('/api/auth/active-sessions');
        if (response.success && response.sessions) {
          setActiveSessions(response.sessions);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
        // Create fallback session data if API fails
        const fallbackSession = {
          id: 'current-session',
          deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer',
          browser: getBrowserName(),
          ipAddress: 'Current IP',
          location: 'Current Location',
          lastActivity: new Date().toISOString(),
          isCurrent: true,
          createdAt: user?.lastLoginAt || new Date().toISOString()
        };
        setActiveSessions([fallbackSession]);
      }
    };

    const getBrowserName = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown Browser';
    };

    const fetchAddresses = async () => {
      try {
        // Since address management isn't implemented in backend yet,
        // create default address from user profile
        if (user) {
          const defaultAddress = {
            _id: 'default',
            label: 'Home',
            name: user.name || '',
            phone: user.phone || '',
            address: typeof user.address === 'string' ? user.address : (user.address?.street || ''),
            city: user.province || '',
            zipCode: '',
            isDefault: true
          };
          setAddresses([defaultAddress]);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
        setAddresses([]);
      }
    };

    fetchUserData();
    if (user) {
      // Fetch user orders and wishlist
      fetchUserOrders();
      fetchUserWishlist();
      fetchCartCount();
      fetchNotificationCount();
      fetchActiveSessions();
      
      // Fetch addresses with error handling to prevent tab breaking
      try {
        fetchAddresses();
      } catch (error) {
        console.error('Address fetch failed:', error);
        setAddresses([]);
      }
    }
  }, [navigate, authLoading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Validation
    if (!userData.name || !userData.name.trim()) {
      toast.error('Full Name is required.');
      setSaving(false);
      return;
    }
    if (!userData.address || !userData.address.trim()) {
      toast.error('Billing Address is required.');
      setSaving(false);
      return;
    }
    if (!userData.province) {
      toast.error('Please select your Province / Region.');
      setSaving(false);
      return;
    }
    const phoneRegex = /^01[0-9]{9}$/;
    if (!userData.phone || !phoneRegex.test(userData.phone)) {
      toast.error('Please enter a valid 11-digit phone number starting with 01.');
      setSaving(false);
      return;
    }

    try {
      // Format data to match backend validation schema
      const requestData = {
        name: userData.name,
        phone: userData.phone,
        address: {
          street: userData.address,  // Convert string address to object
          city: userData.province,   // Use province as city
          state: userData.province,  // Also set as state
          country: 'Bangladesh'
        },
        province: userData.province
      };

      // Use enhanced API service which handles token refresh automatically
      const response = await enhancedApiService.request('/api/users/profile', {
        method: 'PUT',
        body: requestData
      });

      if (response.success && response.user) {
        // Update user data in local storage
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...localUser, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.error || response.message || 'Failed to update profile.');
      }
    } catch (error) {
      // Enhanced error handling
      if (error.response?.data) {
        toast.error(error.response.data.message || error.response.data.error || 'Server error occurred');
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const dashboardStats = [
    { title: 'Total Orders', value: orders.length.toString(), icon: Package, color: 'bg-blue-500' },
    { title: 'Wishlist Items', value: wishlist.length.toString(), icon: Heart, color: 'bg-red-500' },
    { title: 'Cart Items', value: cartCount.toString(), icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Notifications', value: notificationCount.toString(), icon: Bell, color: 'bg-purple-500' }
  ];

  const menuItems = [
    { id: 'profile', title: 'Profile Settings', icon: User },
    { id: 'orders', title: 'Order History', icon: Package },
    { id: 'wishlist', title: 'Wishlist', icon: Heart },
    { id: 'addresses', title: 'Address Book', icon: AddressIcon },
    { id: 'payments', title: 'Payment Methods', icon: CreditCard },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'notifications', title: 'Notifications', icon: Bell }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          user={user}
          cart={[]}
          onLogout={logout}
          onLogin={() => {}}
          onCartClick={() => {}}
          onCheckout={() => {}}
          onSearch={() => {}}
          products={[]}
        />
        <div className="pt-28 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar 
        user={user}
        cart={(() => {
          try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
          } catch {
            return [];
          }
        })()}
        onLogout={logout}
        onLogin={() => setActiveTab('security')}
        onCartClick={() => navigate('/')}
        onCheckout={() => navigate('/')}
        onSearch={() => navigate('/')}
        products={[]}
      />
      <Toaster position="bottom-center" />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome Back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-600 text-lg">Manage your account and track your orders</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Store
            </Link>
            
            {/* Real-time Notification Bell */}
            <NotificationBell />
            
            {/* Socket Connection Status */}
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">Live Updates</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-white/20 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 sticky top-32">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" />
                Menu
              </h2>
              <nav className="space-y-3">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/50 hover:shadow-md hover:scale-102'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === item.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8 min-h-[600px]">
              {activeTab === 'orders' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={64} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                      <Link 
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <ShoppingCart size={20} />
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order._id} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order._id?.slice(-8) || 'N/A'}</h3>
                              <p className="text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                              </span>
                              <p className="text-lg font-bold mt-2">৳{order.totalAmount || 0}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Items ({order.items?.length || 0})</h4>
                            <div className="space-y-2">
                              {order.items?.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                                  <div>
                                    <p className="font-medium">{item.productId?.name || 'Product'}</p>
                                    <p className="text-gray-600">
                                      Qty: {item.quantity} × ৳{item.price} = ৳{item.quantity * item.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <p className="text-sm text-gray-500">
                                  +{order.items.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {order.shippingAddress && (
                            <div className="border-t pt-4 mt-4">
                              <h4 className="font-medium mb-2">Shipping Address</h4>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.name}<br />
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Heart size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
                  </div>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart size={64} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-500 mb-6">Add products you love to your wishlist</p>
                      <Link 
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Heart size={20} />
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map(item => (
                        <div key={item._id} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-white/20 group hover:shadow-md transition">
                          <div className="relative mb-4">
                            <img 
                              src={item.product?.images?.[0] || item.product?.image || 'https://via.placeholder.com/200?text=No+Image'} 
                              alt={item.product?.name}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                              }}
                            />
                            <button 
                              onClick={async () => {
                                try {
                                  await enhancedApiService.request(`/api/wishlist/${item._id}`, {
                                    method: 'DELETE'
                                  });
                                  setWishlist(prev => prev.filter(w => w._id !== item._id));
                                  toast.success('Removed from wishlist');
                                } catch (error) {
                                  toast.error('Failed to remove from wishlist');
                                }
                              }}
                              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100"
                            >
                              <Heart size={16} className="text-red-500 fill-current" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg line-clamp-2">{item.product?.name || 'Product'}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {item.product?.description || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-blue-600">
                                ৳{item.product?.price || 0}
                              </span>
                              {item.product?.stock > 0 ? (
                                <button 
                                  onClick={async () => {
                                    try {
                                      // Add to cart logic here
                                      toast.success(`${item.product.name} added to cart!`);
                                    } catch (error) {
                                      toast.error('Failed to add to cart');
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                  Add to Cart
                                </button>
                              ) : (
                                <span className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <AddressIcon size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Address List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
                      
                      {addresses.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <AddressIcon size={48} className="mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-500">No saved addresses</p>
                        </div>
                      ) : (
                        addresses.map(address => (
                          <div key={address._id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{address.label}</span>
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Default</span>
                                )}
                              </div>
                              <button 
                                onClick={async () => {
                                  try {
                                    // Since address management isn't implemented in backend,
                                    // remove address locally for now
                                    if (address._id === 'default') {
                                      toast.error('Cannot delete default address');
                                      return;
                                    }
                                    setAddresses(prev => prev.filter(a => a._id !== address._id));
                                    toast.success('Address removed (locally)');
                                  } catch (error) {
                                    toast.error('Failed to delete address');
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                {address._id === 'default' ? 'Default' : 'Delete'}
                              </button>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="font-medium text-gray-900">{address.name}</p>
                              <p>{address.address}</p>
                              <p>{address.city} {address.zipCode}</p>
                              <p>{address.phone}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Add New Address Form */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          // Since address management isn't implemented in backend,
                          // simulate adding address locally for now
                          const newAddressWithId = {
                            ...newAddress,
                            _id: `addr_${Date.now()}`,
                            isDefault: addresses.length === 0
                          };
                          
                          setAddresses(prev => [...prev, newAddressWithId]);
                          setNewAddress({
                            label: '',
                            name: '',
                            phone: '',
                            address: '',
                            city: '',
                            zipCode: ''
                          });
                          toast.success('Address added successfully (locally stored)');
                        } catch (error) {
                          toast.error('Failed to add address');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                          <input
                            type="text"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="e.g., Home, Office"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                          <textarea
                            value={newAddress.address}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                            <input
                              type="text"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Add Address
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Password Change Section */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-orange-600" />
                        Change Password
                      </h3>
                      
                      {user?.authProvider === 'google' || user?.googleId ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-blue-600" />
                            <h4 className="font-medium text-blue-800">Google Account</h4>
                          </div>
                          <p className="text-blue-700 text-sm">
                            You signed in with Google. To change your password, please go to your Google Account settings.
                          </p>
                          <a 
                            href="https://myaccount.google.com/security" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            Manage Google Account
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      ) : (
                        <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const currentPassword = formData.get('currentPassword');
                        const newPassword = formData.get('newPassword');
                        const confirmPassword = formData.get('confirmPassword');
                        
                        if (newPassword !== confirmPassword) {
                          toast.error('New passwords do not match');
                          return;
                        }
                        
                        if (newPassword.length < 6) {
                          toast.error('Password must be at least 6 characters');
                          return;
                        }
                        
                        try {
                          const response = await enhancedApiService.request('/api/auth/change-password', {
                            method: 'POST',
                            body: { currentPassword, newPassword }
                          });
                          
                          if (response.success) {
                            toast.success('Password changed successfully');
                            e.target.reset();
                          } else {
                            throw new Error(response.error || 'Failed to change password');
                          }
                        } catch (error) {
                          console.error('Password change error:', error);
                          if (error.response?.data?.error) {
                            toast.error(error.response.data.error);
                          } else {
                            toast.error(error.message || 'Failed to change password');
                          }
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            minLength="6"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            minLength="6"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                        >
                          Change Password
                        </button>
                      </form>
                      )}
                    </div>
                    
                    {/* Account Information */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Account Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <p className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                            {user?.email || 'Not provided'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                          <p className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                          <p className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                          <p className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                            {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Session Management */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-green-600" />
                        Session Management
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Active Sessions List */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Active Sessions</h4>
                          {activeSessions.map(session => (
                            <div key={session.id} className={`p-4 border rounded-lg ${
                              session.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    session.isCurrent ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                  }`}></div>
                                  <h5 className="font-medium text-gray-800">
                                    {session.isCurrent ? 'Current Session' : 'Other Session'}
                                  </h5>
                                  {session.isCurrent && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      This Device
                                    </span>
                                  )}
                                </div>
                                {!session.isCurrent && (
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await enhancedApiService.request(`/api/auth/terminate-session/${session.id}`, {
                                          method: 'DELETE'
                                        });
                                        setActiveSessions(prev => prev.filter(s => s.id !== session.id));
                                        toast.success('Session terminated');
                                      } catch (error) {
                                        toast.error('Failed to terminate session');
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Terminate
                                  </button>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Device:</strong> {session.deviceInfo}</p>
                                <p><strong>Browser:</strong> {session.browser}</p>
                                <p><strong>IP:</strong> {session.ipAddress}</p>
                                <p><strong>Location:</strong> {session.location}</p>
                                <p><strong>Last Active:</strong> {new Date(session.lastActivity).toLocaleString()}</p>
                                <p><strong>Login Time:</strong> {new Date(session.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Session Security Info */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-blue-600" />
                            <h4 className="font-medium text-blue-800">Session Security</h4>
                          </div>
                          <div className="text-xs text-blue-600 space-y-1">
                            <p>• IP address changes are monitored for security</p>
                            <p>• Session validates automatically every 5 minutes</p>
                            <p>• You can terminate suspicious sessions manually</p>
                            <p>• Warnings are logged but won't auto-logout</p>
                          </div>
                        </div>

                        {/* Session Warnings */}
                        {sessionWarnings.length > 0 && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-3">Recent Security Warnings</h4>
                            <div className="space-y-2">
                              {sessionWarnings.slice(0, 5).map(warning => (
                                <div key={warning.id} className="text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-orange-700">{warning.message}</span>
                                    <span className="text-orange-600 text-xs">
                                      {new Date(warning.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                          <div>
                            <h4 className="font-medium text-orange-900">Terminate All Sessions</h4>
                            <p className="text-sm text-orange-700">Log out from all devices and browsers</p>
                          </div>
                          <button 
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to terminate all sessions? You will be logged out from all devices.')) {
                                try {
                                  const result = await terminateAllSessions();
                                  if (result.success) {
                                    toast.success('All sessions terminated successfully');
                                  } else {
                                    toast.error(result.error || 'Failed to terminate sessions');
                                  }
                                } catch (error) {
                                  toast.error('Failed to terminate sessions');
                                }
                              }
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                          >
                            Terminate All
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Actions */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-purple-600" />
                        Account Actions
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Download Account Data</h4>
                            <p className="text-sm text-gray-600">Get a copy of your account information</p>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                const response = await enhancedApiService.request('/api/users/export-data');
                                // Handle download
                                toast.success('Account data export initiated');
                              } catch (error) {
                                toast.error('Failed to export account data');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            Download
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                          <div>
                            <h4 className="font-medium text-red-900">Delete Account</h4>
                            <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                          </div>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                toast.error('Account deletion feature will be implemented');
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            name="name" 
                            value={userData.name} 
                            onChange={handleInputChange} 
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm" 
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Contact Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                            <span className="text-lg">🇧🇩</span>
                            <span className="ml-2 font-medium">+880</span>
                          </div>
                          <input 
                            type="tel" 
                            name="phone" 
                            value={userData.phone} 
                            onChange={handleInputChange} 
                            className="w-full pl-28 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm" 
                            placeholder="1XXXXXXXXX" 
                            maxLength="11" 
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea 
                          name="address" 
                          id="address" 
                          value={userData.address} 
                          onChange={handleInputChange} 
                          rows="3"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          placeholder="Enter your full address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">Province / Region</label>
                      <select 
                        name="province" 
                        id="province" 
                        value={userData.province} 
                        onChange={handleInputChange} 
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select a Division</option>
                        {bangladeshDivisions.map(division => (
                          <option key={division} value={division}>{division}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Save size={20} />
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center animate-bounce">
                      <Package size={48} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">When you place orders, they will appear here. Start shopping to see your order history!</p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart size={20} />
                      Start Shopping
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Heart size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl flex items-center justify-center animate-heartbeat">
                      <Heart size={48} className="text-pink-600 fill-current" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Save items you love for later. Add products to your wishlist and manage them here!</p>
                    <Link 
                      to="/wishlist" 
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Heart size={20} />
                      View Wishlist
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <AddressIcon size={20} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <AddressIcon size={18} />
                      Add New Address
                    </button>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <AddressIcon size={48} className="text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No addresses saved</h3>
                    <p className="text-gray-600">Add delivery addresses to make checkout faster and easier.</p>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <CreditCard size={18} />
                      Add Payment Method
                    </button>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                      <CreditCard size={48} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No payment methods</h3>
                    <p className="text-gray-600">Add your preferred payment methods for quick and secure checkout.</p>
                  </div>
                </div>
              )}

              {(activeTab === 'security' || activeTab === 'notifications') && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === 'security' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'
                    }`}>
                      {activeTab === 'security' ? <Shield size={20} className="text-white" /> : <Bell size={20} className="text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTab === 'security' ? 'Security Settings' : 'Notification Preferences'}
                    </h2>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <Settings size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h3>
                    <p className="text-gray-600 mb-8">We're working on enhanced security and notification features.</p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-semibold rounded-xl">
                      <Settings size={18} />
                      Under Development
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}