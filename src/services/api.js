const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Enhanced request method with automatic token refresh
  async request(endpoint, options = {}) {
    let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // If token expired, try to refresh
      if (response.status === 401 && token) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry request with new token
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({
              error: `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
            }));
            throw new Error(errorData.error || `HTTP ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          window.location.href = '/auth';
          throw new Error('Authentication expired');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Token refresh method
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        return data.tokens.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Product endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateProfile(userData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Order endpoints
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async cancelOrder(orderId, reason = '') {
    return this.makeRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async requestReturn(orderId, items, reason) {
    return this.makeRequest(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ items, reason }),
    });
  }

  async createOrder(orderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderById(id) {
    return this.makeRequest(`/orders/${id}`);
  }

  async updateOrder(id, orderData) {
    return this.makeRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(id) {
    return this.makeRequest(`/orders/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async getAnalytics(endpoint) {
    return this.makeRequest(`/analytics/${endpoint}`);
  }

  async getOverviewData() {
    return this.makeRequest('/analytics/overview');
  }

  async getProductAnalytics() {
    return this.makeRequest('/analytics/products');
  }

  async getSalesAnalytics() {
    return this.makeRequest('/analytics/sales');
  }

  async getUserAnalytics() {
    return this.makeRequest('/analytics/users');
  }

  // ===== NEW ENHANCED API METHODS =====

  // Notifications API
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/api/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/api/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  async getNotificationPreferences() {
    return this.request('/api/notifications/preferences');
  }

  async updateNotificationPreferences(preferences) {
    return this.request('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Reviews API
  async getProductReviews(productId, queryParams = '') {
    return this.request(`/api/reviews/product/${productId}?${queryParams}`);
  }

  async getUserReviews(page = 1, limit = 10) {
    return this.request(`/api/reviews/user?page=${page}&limit=${limit}`);
  }

  async checkCanReview(productId) {
    return this.request(`/api/reviews/can-review/${productId}`);
  }

  async createReview(reviewData) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async voteOnReview(reviewId, voteType) {
    return this.request(`/api/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async reportReview(reviewId, reportData) {
    return this.request(`/api/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async replyToReview(reviewId, message) {
    return this.request(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Two-Factor Authentication API
  async enableTwoFactor() {
    return this.request('/api/auth/2fa/enable', {
      method: 'POST',
    });
  }

  async verifyTwoFactorSetup(code) {
    return this.request('/api/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disableTwoFactor(password) {
    return this.request('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async sendTwoFactorCode(email) {
    return this.request('/api/auth/2fa/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyTwoFactorLogin(email, code) {
    return this.request('/api/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async getTwoFactorStatus() {
    return this.request('/api/auth/2fa/status');
  }

  // Search API
  async searchProducts(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    return this.request(`/api/search/products?${params.toString()}`);
  }

  async getSearchSuggestions(query) {
    return this.request(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getPopularSearches() {
    return this.request('/api/search/popular');
  }

  // Wishlist API
  async getWishlist() {
    return this.request('/api/wishlist');
  }

  async addToWishlist(productId, productData) {
    return this.request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, productData }),
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist() {
    return this.request('/api/wishlist/clear', {
      method: 'DELETE',
    });
  }

  // Cart API
  async getCart() {
    return this.request('/api/cart');
  }

  async addToCart(productId, quantity = 1, options = {}) {
    return this.request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, ...options }),
    });
  }

  async updateCartItem(productId, quantity, options = {}) {
    return this.request(`/api/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, ...options }),
    });
  }

  async removeFromCart(productId, options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/cart/items/${productId}?${params}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  async applyCoupon(couponCode) {
    return this.request('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  }

  async removeCoupon(code) {
    return this.request(`/cart/coupon/${code}`, {
      method: 'DELETE',
    });
  }

  async getCartSummary() {
    return this.request('/cart/summary');
  }

  async syncCart() {
    return this.request('/cart/sync', {
      method: 'POST',
    });
  }

  // Payment API
  async getPaymentMethods(amount) {
    return this.request(`/payments/methods?amount=${amount}`);
  }

  async calculatePaymentFee(paymentMethod, amount) {
    return this.request('/payments/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, amount }),
    });
  }

  async createStripePaymentIntent(amount, orderId) {
    return this.request('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  }

  async initiateMobileBankingPayment(paymentMethod, amount, orderId, mobileNumber) {
    return this.request('/payments/mobile-banking/initiate', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, amount, orderId, mobileNumber }),
    });
  }

  async confirmMobileBankingPayment(transactionId, userTransactionId) {
    return this.request('/payments/mobile-banking/confirm', {
      method: 'POST',
      body: JSON.stringify({ transactionId, userTransactionId }),
    });
  }

  async confirmCODOrder(orderId) {
    return this.request('/payments/cod/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async getPaymentHistory(page = 1, limit = 10) {
    return this.request(`/payments/history?page=${page}&limit=${limit}`);
  }

  // Advanced Search API
  async searchProducts(params) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/search/products?${searchParams}`);
  }

  async getSearchSuggestions(query, limit = 10) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getPopularSearches() {
    return this.request('/search/popular');
  }

  async getSearchFilters(category = '') {
    return this.request(`/search/filters${category ? `?category=${category}` : ''}`);
  }

  async getSimilarProducts(productId, limit = 8) {
    return this.request(`/search/similar/${productId}?limit=${limit}`);
  }

  async trackSearch(query, resultCount, filters = {}) {
    return this.request('/search/track', {
      method: 'POST',
      body: JSON.stringify({ query, resultCount, filters }),
    });
  }

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
  }

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
  }

  // Enhanced User API
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserOrders(page = 1, limit = 10) {
    return this.request(`/users/orders?page=${page}&limit=${limit}`);
  }

  // Categories API
  async getCategories(flat = false) {
    return this.request(`/categories${flat ? '?flat=true' : ''}`);
  }

  async getCategoryBySlug(slug) {
    return this.request(`/categories/${slug}`);
  }

  // Admin API (for admin users)
  async getAdminDashboard(period = '30') {
    return this.request(`/admin/dashboard?period=${period}`);
  }

  async getAdminUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/users?${searchParams}`);
  }

  async getAdminOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/orders?${searchParams}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// Create and export a singleton instance
const apiService = new APIService();

// Export both the class and instance
export default apiService;
export { APIService, apiService };