// User Service for fetching real user dashboard data
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const userService = {
  // Fetch all users with their complete profiles
  async getAllUsers() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.users || data.data || [];
      }
      throw new Error('Failed to fetch users');
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Fetch user profile data
  async getUserProfile(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || data.data || null;
      }
      throw new Error('Failed to fetch user profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Get users from local database/registration data
  async getUsersFromDatabase() {
    try {
      // Try different endpoints that might contain user data
      const endpoints = [
        '/api/users',
        '/api/admin/users', 
        '/api/users/profiles',
        '/api/customers'
      ];

      for (const endpoint of endpoints) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const users = data.users || data.customers || data.data || [];
            
            if (users.length > 0) {
              console.log(`Found ${users.length} users from ${endpoint}`);
              return users;
            }
          }
        } catch (error) {
          console.warn(`Endpoint ${endpoint} failed:`, error.message);
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching users from database:', error);
      return [];
    }
  },

  // Extract users from order history and combine with registration data
  async getCombinedUserData() {
    try {
      // Get users from various sources
      const [
        apiUsers,
        dbUsers,
        orderData,
        currentUser
      ] = await Promise.all([
        this.getAllUsers(),
        this.getUsersFromDatabase(),
        this.getUsersFromOrders(),
        this.getCurrentUserData()
      ]);

      // Combine and deduplicate users
      const allUsers = [];
      const userEmails = new Set();

      // Add current user first
      if (currentUser && currentUser.email && !userEmails.has(currentUser.email)) {
        userEmails.add(currentUser.email);
        allUsers.push(currentUser);
      }

      // Add API users
      apiUsers.forEach(user => {
        if (user.email && !userEmails.has(user.email)) {
          userEmails.add(user.email);
          allUsers.push(user);
        }
      });

      // Add database users
      dbUsers.forEach(user => {
        if (user.email && !userEmails.has(user.email)) {
          userEmails.add(user.email);
          allUsers.push(user);
        }
      });

      // Add users from orders
      orderData.forEach(user => {
        if (user.email && !userEmails.has(user.email)) {
          userEmails.add(user.email);
          allUsers.push(user);
        }
      });

      console.log(`Combined ${allUsers.length} unique users from all sources`);
      return allUsers;
    } catch (error) {
      console.error('Error combining user data:', error);
      return [];
    }
  },

  // Get current logged-in user data - fetch fresh from API
  async getCurrentUserData() {
    try {
      // First, try to fetch updated user profile from API
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (currentUser._id && token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const updatedUser = data.user || data.data || data;
            
            if (updatedUser) {
              console.log('Fetched updated user profile from API:', updatedUser);
              
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              return {
                _id: updatedUser._id || updatedUser.id,
                name: updatedUser.name || updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role || 'admin',
                isActive: updatedUser.isActive !== false,
                createdAt: updatedUser.createdAt || new Date().toISOString(),
                lastLogin: updatedUser.lastLogin || new Date().toISOString(),
                phone: updatedUser.phone || updatedUser.mobile || updatedUser.phoneNumber,
                address: {
                  street: updatedUser.address?.street || updatedUser.street,
                  city: updatedUser.address?.city || updatedUser.city,
                  country: updatedUser.address?.country || updatedUser.country,
                  zipCode: updatedUser.address?.zipCode || updatedUser.zipCode || updatedUser.postalCode
                },
                avatar: updatedUser.avatar || updatedUser.profilePicture,
                verified: updatedUser.emailVerified || updatedUser.isVerified
              };
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, using localStorage data');
        }
      }
      
      // Fallback to localStorage data
      const adminOrders = JSON.parse(localStorage.getItem('admin-orders') || '[]');

      if (currentUser.email) {
        console.log('Using localStorage user data:', currentUser);
        
        return {
          _id: currentUser._id || currentUser.id || Date.now().toString(),
          name: currentUser.name || currentUser.fullName || 'Current User',
          email: currentUser.email,
          role: currentUser.role || 'admin',
          isActive: true,
          createdAt: currentUser.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          phone: currentUser.phone || currentUser.mobile || currentUser.phoneNumber || 
                 (currentUser.address?.phone) || 'Not provided',
          address: {
            street: currentUser.address?.street || currentUser.street || 
                   currentUser.address?.address1 || currentUser.address1 || 'Not provided',
            city: currentUser.address?.city || currentUser.city || 'Not provided',
            country: currentUser.address?.country || currentUser.country || 'Not provided',
            zipCode: currentUser.address?.zipCode || currentUser.zipCode || 
                    currentUser.address?.postalCode || currentUser.postalCode || 'Not provided'
          },
          orderCount: adminOrders.filter(o => o.customer?.email === currentUser.email).length,
          totalSpent: adminOrders
            .filter(o => o.customer?.email === currentUser.email)
            .reduce((sum, o) => sum + (o.total || 0), 0),
          avatar: currentUser.avatar || currentUser.profilePicture || 
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`,
          verified: currentUser.emailVerified || currentUser.isVerified || false,
          // Additional fields that might be in user object
          dateOfBirth: currentUser.dateOfBirth || currentUser.dob,
          gender: currentUser.gender
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  },

  // Extract users from order data
  async getUsersFromOrders() {
    try {
      const adminOrders = JSON.parse(localStorage.getItem('admin-orders') || '[]');
      const users = [];
      const userEmails = new Set();

      adminOrders.forEach(order => {
        if (order.customer?.email && !userEmails.has(order.customer.email)) {
          userEmails.add(order.customer.email);
          
          const userOrders = adminOrders.filter(o => o.customer?.email === order.customer.email);
          const recentOrder = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          
          users.push({
            _id: order.customer.email.replace(/[^a-zA-Z0-9]/g, '_'),
            name: recentOrder.customer?.name || order.customer?.name || 'Customer',
            email: order.customer.email,
            role: 'customer',
            isActive: new Date() - new Date(recentOrder.createdAt) < 30 * 24 * 60 * 60 * 1000,
            createdAt: userOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt || new Date().toISOString(),
            lastLogin: recentOrder.createdAt || new Date().toISOString(),
            phone: recentOrder.customer?.phone || 
                   recentOrder.customer?.mobile || 
                   recentOrder.shippingAddress?.phone || 'Not provided',
            address: {
              street: recentOrder.shippingAddress?.street || 
                      recentOrder.shippingAddress?.address || 'Not provided',
              city: recentOrder.shippingAddress?.city || 'Not provided',
              country: recentOrder.shippingAddress?.country || 'Not provided',
              zipCode: recentOrder.shippingAddress?.zipCode || 
                       recentOrder.shippingAddress?.postalCode || 'Not provided'
            },
            orderCount: userOrders.length,
            totalSpent: userOrders.reduce((sum, o) => sum + (o.total || 0), 0),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(order.customer.name || 'Customer')}`,
            verified: false
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Error extracting users from orders:', error);
      return [];
    }
  }
};

export default userService;