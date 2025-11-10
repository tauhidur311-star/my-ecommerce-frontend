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
export { APIService };