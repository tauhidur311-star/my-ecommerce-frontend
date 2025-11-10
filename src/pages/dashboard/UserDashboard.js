import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Save, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <Toaster position="bottom-center" />
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Dashboard</h1>
          <Link to="/" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" name="name" id="name" value={userData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" name="address" id="address" value={userData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <span>🇧🇩</span>
                <span className="ml-2">+880</span>
              </div>
              <input type="tel" name="phone" id="phone" value={userData.phone} onChange={handleInputChange} className="w-full pl-24 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="1XXXXXXXXX" maxLength="11" />
            </div>
          </div>
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province / Region</label>
            <select name="province" id="province" value={userData.province} onChange={handleInputChange} className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white">
              <option value="">Select a Division</option>
              {bangladeshDivisions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}