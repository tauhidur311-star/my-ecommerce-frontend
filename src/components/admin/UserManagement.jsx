import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Edit, Trash2, Shield, Mail,
  Eye, Calendar, MapPin, Phone, UserCheck, UserX,
  RefreshCw, Download, Grid, List, Crown, AlertTriangle,
  Clock, Globe, CheckCircle, XCircle
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    customers: 0,
    newThisMonth: 0
  });

  // Enhanced API functions using userService
  const fetchUsers = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (forceRefresh) {
        // Clear any cached user data and force fresh fetch
        console.log('Force refreshing user data...');
        
        // Try to fetch fresh user profile from API
        const token = localStorage.getItem('token');
        try {
          const response = await fetch('/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const updatedUser = data.user || data.data || data;
            
            if (updatedUser) {
              console.log('Fresh user data from API:', updatedUser);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        } catch (apiError) {
          console.log('Could not fetch fresh user data from API:', apiError.message);
        }
      }
      
      // Debug: Check what's actually in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('=== USER DATA DEBUG ===');
      console.log('Current localStorage user data:', storedUser);
      console.log('Phone fields:', {
        phone: storedUser.phone,
        mobile: storedUser.mobile,
        phoneNumber: storedUser.phoneNumber,
        addressPhone: storedUser.address?.phone
      });
      console.log('Address fields:', {
        addressObject: storedUser.address,
        street: storedUser.street,
        city: storedUser.city,
        country: storedUser.country,
        zipCode: storedUser.zipCode
      });
      console.log('=== END DEBUG ===');
      
      // Use the enhanced userService to get real user data
      const usersData = await userService.getCombinedUserData();
      
      console.log(`Loaded ${usersData.length} real users from all sources`);
      console.log('First user data:', usersData[0]);
      
      setUsers(usersData);
      calculateStats(usersData);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const forceRefreshUsers = () => {
    fetchUsers(true);
  };

  const calculateStats = (usersData) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: usersData.length,
      active: usersData.filter(u => u.isActive).length,
      inactive: usersData.filter(u => !u.isActive).length,
      admins: usersData.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      customers: usersData.filter(u => u.role === 'customer').length,
      newThisMonth: usersData.filter(u => new Date(u.createdAt) >= startOfMonth).length
    };
    setStats(stats);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      // Update in local state immediately for better UX
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive, lastLogin: new Date().toISOString() } : user
      ));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isActive } : user
        ));
        return true;
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. You may not have sufficient permissions.');
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const UserCard = ({ user }) => {
    const getRoleIcon = (role) => {
      switch (role) {
        case 'super_admin':
          return <Crown size={16} className="text-purple-600" />;
        case 'admin':
          return <Shield size={16} className="text-blue-600" />;
        default:
          return <Users size={16} className="text-gray-600" />;
      }
    };

    const getRoleBadge = (role) => {
      const colors = {
        super_admin: 'bg-purple-100 text-purple-800',
        admin: 'bg-blue-100 text-blue-800',
        customer: 'bg-gray-100 text-gray-800'
      };
      return colors[role] || colors.customer;
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{user.name || 'No Name'}</h3>
                {getRoleIcon(user.role)}
              </div>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => getUserDetails(user._id)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => updateUserStatus(user._id, !user.isActive)}
              className={`p-2 rounded-lg transition-colors ${
                user.isActive 
                  ? 'text-orange-600 hover:bg-orange-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={user.isActive ? 'Deactivate User' : 'Activate User'}
            >
              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
            </button>
            {user.role !== 'super_admin' && (
              <button
                onClick={() => deleteUser(user._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete User"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRoleBadge(user.role)}`}>
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              <span>{user.phone}</span>
            </div>
          )}

          {user.address?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{user.address.city}, {user.address.country}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          {user.lastLoginAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            {user.isEmailVerified ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={14} />
                <span>Email Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <XCircle size={14} />
                <span>Email Unverified</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const UserModal = () => {
    if (!selectedUser) return null;

    return (
      <AnimatePresence>
        {showUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name || 'No Name'}</h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedUser.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          selectedUser.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.role.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-gray-700">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span className="text-gray-700">{selectedUser.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {selectedUser.address && (selectedUser.address.street || selectedUser.address.city) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-500 mt-0.5" />
                        <div className="text-gray-700">
                          {selectedUser.address.street && <div>{selectedUser.address.street}</div>}
                          <div>
                            {selectedUser.address.city && `${selectedUser.address.city}, `}
                            {selectedUser.address.state && `${selectedUser.address.state}, `}
                            {selectedUser.address.country || 'Bangladesh'}
                          </div>
                          {selectedUser.address.zipCode && <div>{selectedUser.address.zipCode}</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Joined:</span>
                        <p className="text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      {selectedUser.lastLoginAt && (
                        <div>
                          <span className="text-sm text-gray-500">Last Login:</span>
                          <p className="text-gray-700">{new Date(selectedUser.lastLoginAt).toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Email Status:</span>
                        <p className={`text-sm font-medium ${
                          selectedUser.isEmailVerified ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {selectedUser.isEmailVerified ? 'Verified' : 'Unverified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Auth Provider:</span>
                        <p className="text-gray-700 capitalize">{selectedUser.authProvider || 'Local'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t">
                    <EnhancedButton
                      variant={selectedUser.isActive ? "outline" : "primary"}
                      onClick={() => {
                        updateUserStatus(selectedUser._id, !selectedUser.isActive);
                        setSelectedUser(prev => ({ ...prev, isActive: !prev.isActive }));
                      }}
                    >
                      {selectedUser.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                    </EnhancedButton>
                    
                    <EnhancedButton
                      variant="outline"
                      onClick={() => window.open(`mailto:${selectedUser.email}`, '_blank')}
                    >
                      <Mail size={16} />
                      Send Email
                    </EnhancedButton>

                    {selectedUser.role !== 'super_admin' && (
                      <EnhancedButton
                        variant="outline"
                        onClick={() => {
                          deleteUser(selectedUser._id);
                          setShowUserModal(false);
                        }}
                      >
                        <Trash2 size={16} />
                        Delete User
                      </EnhancedButton>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage customer accounts and user permissions</p>
        </div>
        <div className="flex gap-3">
          <EnhancedButton variant="outline" onClick={() => fetchUsers(false)} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>
          
          <EnhancedButton variant="primary" onClick={forceRefreshUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Force Refresh Profile
          </EnhancedButton>
          <EnhancedButton variant="outline">
            <Download size={16} />
            Export
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value={stats.active}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Inactive Users"
          value={stats.inactive}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={Shield}
          color="purple"
        />
        <StatsCard
          title="Customers"
          value={stats.customers}
          icon={Users}
          color="gray"
        />
        <StatsCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={Calendar}
          color="orange"
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      {/* Users Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {users.length === 0 
                  ? "No users have registered yet." 
                  : "No users match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredUsers.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      <UserModal />
    </div>
  );
};

export default UserManagement;