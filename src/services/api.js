const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Service Layer to replace localStorage
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API call method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials) {
    return this.makeRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    const result = await this.makeRequest('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    return result;
  }

  async verifyToken() {
    return this.makeRequest('/auth/verify', { method: 'GET' });
  }

  // Products APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/products?${queryString}` : '/admin/products';
    return this.makeRequest(endpoint);
  }

  async getProduct(id) {
    return this.makeRequest(`/admin/products/${id}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.makeRequest(`/admin/products/${id}`, { method: 'DELETE' });
  }

  async bulkUpdateProducts(updates) {
    return this.makeRequest('/admin/products/bulk', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Orders APIs
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
    return this.makeRequest(endpoint);
  }

  async getOrder(id) {
    return this.makeRequest(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.makeRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderStats(dateRange = '30days') {
    return this.makeRequest(`/admin/orders/stats?range=${dateRange}`);
  }

  // Customers APIs
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/customers?${queryString}` : '/admin/customers';
    return this.makeRequest(endpoint);
  }

  async getCustomer(id) {
    return this.makeRequest(`/admin/customers/${id}`);
  }

  async getCustomerOrders(id) {
    return this.makeRequest(`/admin/customers/${id}/orders`);
  }

  async updateCustomer(id, customerData) {
    return this.makeRequest(`/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  // Analytics APIs
  async getAnalytics(dateRange = '30days') {
    return this.makeRequest(`/admin/analytics?range=${dateRange}`);
  }

  async getSalesAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/analytics/sales?${queryString}` : '/admin/analytics/sales';
    return this.makeRequest(endpoint);
  }

  async getCustomerAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/analytics/customers?${queryString}` : '/admin/analytics/customers';
    return this.makeRequest(endpoint);
  }

  async getProductAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/analytics/products?${queryString}` : '/admin/analytics/products';
    return this.makeRequest(endpoint);
  }

  // Settings APIs
  async getSettings() {
    return this.makeRequest('/admin/settings');
  }

  async updateSettings(settings) {
    return this.makeRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Notifications APIs
  async getNotifications() {
    return this.makeRequest('/admin/notifications');
  }

  async markNotificationRead(id) {
    return this.makeRequest(`/admin/notifications/${id}/read`, { method: 'PUT' });
  }

  async createNotification(notification) {
    return this.makeRequest('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  // Fallback methods for localStorage compatibility
  async getFromStorage(key) {
    try {
      // Try API first
      const response = await this.makeRequest(`/admin/data/${key}`);
      return response;
    } catch (error) {
      console.warn('API unavailable, falling back to localStorage:', error);
      // Fallback to localStorage
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  async saveToStorage(key, data) {
    try {
      // Try API first
      await this.makeRequest(`/admin/data/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ data }),
      });
    } catch (error) {
      console.warn('API unavailable, falling back to localStorage:', error);
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Image upload
  async uploadImage(file, folder = 'products') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      const response = await fetch(`${this.baseURL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new APIService();

// Export both the class and instance
export default apiService;
  // ===== NEW ENHANCED API METHODS =====

  // Notifications API
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  },

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  },

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },

  async getNotificationPreferences() {
    return this.request('/notifications/preferences');
  },

  async updateNotificationPreferences(preferences) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  // Cart API
  async getCart() {
    return this.request('/cart');
  },

  async addToCart(productId, quantity = 1, options = {}) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, ...options }),
    });
  },

  async updateCartItem(productId, quantity, options = {}) {
    return this.request(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, ...options }),
    });
  },

  async removeFromCart(productId, options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/cart/items/${productId}?${params}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  },

  async applyCoupon(couponCode) {
    return this.request('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  },

  async removeCoupon(code) {
    return this.request(`/cart/coupon/${code}`, {
      method: 'DELETE',
    });
  },

  async getCartSummary() {
    return this.request('/cart/summary');
  },

  async syncCart() {
    return this.request('/cart/sync', {
      method: 'POST',
    });
  },

  // Payment API
  async getPaymentMethods(amount) {
    return this.request(`/payments/methods?amount=${amount}`);
  },

  async calculatePaymentFee(paymentMethod, amount) {
    return this.request('/payments/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, amount }),
    });
  },

  async createStripePaymentIntent(amount, orderId) {
    return this.request('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  },

  async initiateMobileBankingPayment(paymentMethod, amount, orderId, mobileNumber) {
    return this.request('/payments/mobile-banking/initiate', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, amount, orderId, mobileNumber }),
    });
  },

  async confirmMobileBankingPayment(transactionId, userTransactionId) {
    return this.request('/payments/mobile-banking/confirm', {
      method: 'POST',
      body: JSON.stringify({ transactionId, userTransactionId }),
    });
  },

  async confirmCODOrder(orderId) {
    return this.request('/payments/cod/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async getPaymentHistory(page = 1, limit = 10) {
    return this.request(`/payments/history?page=${page}&limit=${limit}`);
  },

  // Advanced Search API
  async searchProducts(params) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/search/products?${searchParams}`);
  },

  async getSearchSuggestions(query, limit = 10) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async getPopularSearches() {
    return this.request('/search/popular');
  },

  async getSearchFilters(category = '') {
    return this.request(`/search/filters${category ? `?category=${category}` : ''}`);
  },

  async getSimilarProducts(productId, limit = 8) {
    return this.request(`/search/similar/${productId}?limit=${limit}`);
  },

  async trackSearch(query, resultCount, filters = {}) {
    return this.request('/search/track', {
      method: 'POST',
      body: JSON.stringify({ query, resultCount, filters }),
    });
  },

  // File Upload API
  async uploadImage(file, folder = 'general') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    return fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(response => response.json());
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    return fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(response => response.json());
  },

  // Enhanced User API
  async getUserProfile() {
    return this.request('/users/profile');
  },

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async getUserOrders(page = 1, limit = 10) {
    return this.request(`/users/orders?page=${page}&limit=${limit}`);
  },

  // Categories API
  async getCategories(flat = false) {
    return this.request(`/categories${flat ? '?flat=true' : ''}`);
  },

  async getCategoryBySlug(slug) {
    return this.request(`/categories/${slug}`);
  },

  // Admin API (for admin users)
  async getAdminDashboard(period = '30') {
    return this.request(`/admin/dashboard?period=${period}`);
  },

  async getAdminUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/users?${searchParams}`);
  },

  async getAdminOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/orders?${searchParams}`);
  },

  async updateOrderStatus(orderId, status) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getSalesAnalytics(period = '30', groupBy = 'day') {
    return this.request(`/admin/analytics/sales?period=${period}&groupBy=${groupBy}`);
  },
};

export { APIService };