import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, CreditCard, Save, Plus, Edit2, Trash2, 
  Phone, Mail, Calendar, Shield, Eye, EyeOff, Check, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

const EnhancedUserProfile = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [userData, setUserData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      avatar: ''
    },
    addresses: [],
    paymentMethods: [],
    preferences: {
      language: 'en',
      currency: 'BDT',
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotionalEmails: true
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '',
      loginSessions: []
    }
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const bangladeshDivisions = [
    'Barisal', 'Chittagong', 'Dhaka', 'Khulna', 
    'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'
  ];

  const paymentTypes = [
    { value: 'bkash', label: 'bKash', icon: '📱' },
    { value: 'nagad', label: 'Nagad', icon: '💳' },
    { value: 'rocket', label: 'Rocket', icon: '🚀' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const savedData = localStorage.getItem('enhanced-user-profile');
      if (savedData) {
        setUserData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const saveUserData = (newData) => {
    try {
      localStorage.setItem('enhanced-user-profile', JSON.stringify(newData));
      setUserData(newData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      toast.error('Failed to save profile data');
    }
  };

  const handlePersonalInfoUpdate = (field, value) => {
    const newData = {
      ...userData,
      personal: {
        ...userData.personal,
        [field]: value
      }
    };
    saveUserData(newData);
  };

  const handlePreferenceUpdate = (field, value) => {
    const newData = {
      ...userData,
      preferences: {
        ...userData.preferences,
        [field]: value
      }
    };
    saveUserData(newData);
  };

  const addAddress = (address) => {
    const newAddress = {
      id: Date.now().toString(),
      ...address,
      isDefault: userData.addresses.length === 0
    };
    
    const newData = {
      ...userData,
      addresses: [...userData.addresses, newAddress]
    };
    
    saveUserData(newData);
    setShowAddressForm(false);
  };

  const updateAddress = (addressId, address) => {
    const newData = {
      ...userData,
      addresses: userData.addresses.map(addr => 
        addr.id === addressId ? { ...addr, ...address } : addr
      )
    };
    
    saveUserData(newData);
    setEditingAddress(null);
  };

  const deleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const newData = {
        ...userData,
        addresses: userData.addresses.filter(addr => addr.id !== addressId)
      };
      
      // If deleted address was default, make the first remaining address default
      if (newData.addresses.length > 0) {
        const deletedAddress = userData.addresses.find(addr => addr.id === addressId);
        if (deletedAddress && deletedAddress.isDefault) {
          newData.addresses[0].isDefault = true;
        }
      }
      
      saveUserData(newData);
    }
  };

  const setDefaultAddress = (addressId) => {
    const newData = {
      ...userData,
      addresses: userData.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    };
    
    saveUserData(newData);
  };

  const addPaymentMethod = (payment) => {
    const newPayment = {
      id: Date.now().toString(),
      ...payment,
      isDefault: userData.paymentMethods.length === 0,
      addedAt: new Date().toISOString()
    };
    
    const newData = {
      ...userData,
      paymentMethods: [...userData.paymentMethods, newPayment]
    };
    
    saveUserData(newData);
    setShowPaymentForm(false);
  };

  const deletePaymentMethod = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      const newData = {
        ...userData,
        paymentMethods: userData.paymentMethods.filter(payment => payment.id !== paymentId)
      };
      
      saveUserData(newData);
    }
  };

  const changePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, this would make an API call
    const newData = {
      ...userData,
      security: {
        ...userData.security,
        lastPasswordChange: new Date().toISOString()
      }
    };
    
    saveUserData(newData);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    toast.success('Password changed successfully!');
  };

  const menuItems = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'addresses', title: 'Addresses', icon: MapPin },
    { id: 'payments', title: 'Payment Methods', icon: CreditCard },
    { id: 'preferences', title: 'Preferences', icon: Check },
    { id: 'security', title: 'Security', icon: Shield }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {userData.personal.firstName && userData.personal.lastName 
                  ? `${userData.personal.firstName} ${userData.personal.lastName}`
                  : 'Your Profile'
                }
              </h1>
              <p className="text-blue-100">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-gray-50 p-6 border-r">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === 'personal' && (
              <PersonalInfoSection 
                data={userData.personal}
                onUpdate={handlePersonalInfoUpdate}
              />
            )}

            {activeSection === 'addresses' && (
              <AddressSection
                addresses={userData.addresses}
                showForm={showAddressForm}
                setShowForm={setShowAddressForm}
                editingAddress={editingAddress}
                setEditingAddress={setEditingAddress}
                onAdd={addAddress}
                onUpdate={updateAddress}
                onDelete={deleteAddress}
                onSetDefault={setDefaultAddress}
                divisions={bangladeshDivisions}
              />
            )}

            {activeSection === 'payments' && (
              <PaymentSection
                payments={userData.paymentMethods}
                showForm={showPaymentForm}
                setShowForm={setShowPaymentForm}
                editingPayment={editingPayment}
                setEditingPayment={setEditingPayment}
                onAdd={addPaymentMethod}
                onDelete={deletePaymentMethod}
                paymentTypes={paymentTypes}
              />
            )}

            {activeSection === 'preferences' && (
              <PreferencesSection 
                preferences={userData.preferences}
                onUpdate={handlePreferenceUpdate}
              />
            )}

            {activeSection === 'security' && (
              <SecuritySection
                security={userData.security}
                showPasswordForm={showPasswordForm}
                setShowPasswordForm={setShowPasswordForm}
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                onChangePassword={changePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Info Section Component
const PersonalInfoSection = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User size={24} className="text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={data.gender}
            onChange={(e) => onUpdate('gender', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Address Section Component (simplified for brevity)
const AddressSection = ({ addresses, showForm, setShowForm, onAdd, onDelete, onSetDefault, divisions }) => {
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    address: '',
    district: '',
    division: '',
    postalCode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      address: '',
      district: '',
      division: '',
      postalCode: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Delivery Addresses</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Address Title (e.g., Home, Office)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.division}
              onChange={(e) => setFormData({...formData, division: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select Division</option>
              {divisions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Full Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-4"
            rows="3"
            required
          />
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Address
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{address.title}</h3>
              {address.isDefault && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Default</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{address.fullName}</p>
            <p className="text-sm text-gray-600 mb-2">{address.address}</p>
            <p className="text-sm text-gray-600 mb-3">{address.district}, {address.division}</p>
            <div className="flex gap-2">
              {!address.isDefault && (
                <button
                  onClick={() => onSetDefault(address.id)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => onDelete(address.id)}
                className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-600">Add your delivery addresses for faster checkout</p>
        </div>
      )}
    </div>
  );
};

// Simplified Payment, Preferences, and Security sections would go here...
const PaymentSection = () => <div>Payment Methods Section</div>;
const PreferencesSection = () => <div>Preferences Section</div>;
const SecuritySection = () => <div>Security Section</div>;

export default EnhancedUserProfile;