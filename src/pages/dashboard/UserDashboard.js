import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Save, ArrowLeft, Package, Heart, 
  ShoppingCart, Settings, Bell, Shield, CreditCard, MapPin as AddressIcon 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import NotificationBell from '../../components/NotificationBell';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
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
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    address: '',
    phone: '',
    province: ''
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Initialize socket connection for real-time features
  const { isConnected } = useSocket();

  useEffect(() => {
    const fetchUserData = async () => {
      // If auth is still loading, wait
      if (authLoading) return;
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        setLoading(false);
        toast.error('You must be logged in to view this page.');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Use enhanced API service which handles token refresh automatically
        const response = await enhancedApiService.request('/api/users/profile');
        
        if (response.success && response.user) {
          setUserData({
            name: response.user.name || '',
            address: response.user.address || '',
            phone: response.user.phone || '',
            province: response.user.province || ''
          });
        } else {
          throw new Error(response.error || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);

        // If it's an authentication error, just navigate without showing error
        if (error.message.includes('Authentication') || error.message.includes('token')) {
          navigate('/login');
        } else {
          toast.error(error.message || 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserOrders = async () => {
      try {
        setOrdersLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserData();
    if (user) {
      // Fetch user orders
      fetchUserOrders();
    }
  }, [navigate, isAuthenticated, authLoading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    if (!userData.name.trim()) {
      toast.error('Full Name is required.');
      setSaving(false);
      return;
    }
    if (!userData.address.trim()) {
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
    if (!phoneRegex.test(userData.phone)) {
      toast.error('Please enter a valid 11-digit phone number starting with 01.');
      setSaving(false);
      return;
    }

    try {
      // Use enhanced API service which handles token refresh automatically
      const response = await enhancedApiService.request('/api/users/profile', {
        method: 'PUT',
        body: userData
      });

      if (response.success && response.user) {
        // Update user data in local storage
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...localUser, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const dashboardStats = [
    { title: 'Total Orders', value: orders.length.toString(), icon: Package, color: 'bg-blue-500' },
    { title: 'Wishlist Items', value: '5', icon: Heart, color: 'bg-red-500' },
    { title: 'Cart Items', value: '3', icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Notifications', value: '8', icon: Bell, color: 'bg-purple-500' }
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
        cart={[]}
        onLogout={logout}
        onLogin={() => {}}
        onCartClick={() => {}}
        onCheckout={() => {}}
        onSearch={() => {}}
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
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
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