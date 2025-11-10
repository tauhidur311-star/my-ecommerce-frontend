import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Save, ArrowLeft, Package, Heart, Settings, Bell } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import OrderManagement from '../../components/OrderManagement';
import WishlistManager from '../../components/WishlistManager';
import EnhancedUserProfile from '../../components/EnhancedUserProfile';

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
  const [userData, setUserData] = useState({
    name: '',
    address: '',
    phone: '',
    province: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        toast.error('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }

        const data = await response.json();
        setUserData({
          name: data.user.name || '',
          address: data.user.address || '',
          phone: data.user.phone || '',
          province: data.user.province || ''
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- Validation ---
    if (!userData.name.trim()) {
      toast.error('Full Name is required.');
      setLoading(false);
      return;
    }
    if (!userData.address.trim()) {
      toast.error('Billing Address is required.');
      setLoading(false);
      return;
    }
    if (!userData.province) {
      toast.error('Please select your Province / Region.');
      setLoading(false);
      return;
    }
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(userData.phone)) {
      toast.error('Please enter a valid 11-digit phone number starting with 01.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      // Update user data in local storage as well
      const localUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...localUser, ...data.user }));

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'enhanced-profile', title: 'Account Settings', icon: Settings },
    { id: 'orders', title: 'Orders', icon: Package },
    { id: 'wishlist', title: 'Wishlist', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <Toaster position="bottom-center" />
      
      {/* Enhanced Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your account and track your orders</p>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" />
                Menu
              </h2>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px]">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={userData.name} 
                            onChange={handleInputChange} 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <span>🇧🇩</span>
                            <span className="ml-2">+880</span>
                          </div>
                          <input 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            value={userData.phone} 
                            onChange={handleInputChange} 
                            className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                      disabled={loading} 
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save size={20} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  </div>
                  <OrderManagement isAdmin={false} />
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <WishlistManager isModal={false} />
                </div>
              )}

              {activeTab === 'enhanced-profile' && (
                <div>
                  <EnhancedUserProfile />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}