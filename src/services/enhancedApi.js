// Disable error logger import for production  
// Error logger removed for performance

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://my-ecommerce-backend-s0rt.onrender.com';

// Enhanced API Service with Comprehensive Token Management
class EnhancedAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Enhanced token detection - check all possible storage locations
    this.accessToken = this.getStoredToken();
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Listen for auth events
    this.setupAuthEventListeners();
  }

  // Get token from various storage locations
  getStoredToken() {
    return localStorage.getItem('accessToken') || 
           localStorage.getItem('token') || 
           localStorage.getItem('adminToken') || 
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('accessToken');
  }

  // Setup event listeners for auth state changes
  setupAuthEventListeners() {
    window.addEventListener('auth:logout', () => {
      this.clearTokens();
    });
    
    window.addEventListener('auth:login', (event) => {
      const { accessToken, refreshToken } = event.detail;
      this.setTokens(accessToken, refreshToken);
    });
  }

  // Set auth tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken); // Backward compatibility
      localStorage.setItem('adminToken', accessToken); // Backward compatibility
    }
    
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Clear all tokens and auth state
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Get auth headers with dynamic token refresh
  getHeaders(includeContentType = true) {
    const headers = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    // Always check for latest token in storage
    const currentToken = this.getStoredToken();
    if (currentToken) {
      this.accessToken = currentToken; // Update instance token
      headers.Authorization = `Bearer ${currentToken}`;
    } else {
      console.warn('🚨 No authentication token found in storage');
    }

    return headers;
  }

  // Process the queue of failed requests after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.success && data.tokens) {
        this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        console.log('✅ Token refreshed successfully');
        return data.tokens.accessToken;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearTokens();
      
      // Emit logout event for app to handle
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'refresh_failed', error: error.message }
      }));
      
      throw error;
    }
  }

  // Enhanced request method with automatic token refresh and retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    };

    // If body is provided and it's an object, stringify it
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    // Debug logging for authentication issues
    const hasToken = !!this.getStoredToken();
    console.log(`🔍 API Request Debug: ${config.method} ${endpoint}`, {
      hasToken,
      baseURL: this.baseURL,
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration (401 with TOKEN_EXPIRED code)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`🚨 401 Unauthorized for ${endpoint}:`, errorData);
        
        if (errorData.code === 'TOKEN_EXPIRED' && this.refreshToken) {
          console.log('🔄 Access token expired, attempting refresh...');
          
          // If we're already refreshing, queue this request
          if (this.isRefreshing) {
            console.log('⏳ Token refresh in progress, queueing request...');
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              // Retry the original request with new token
              const newConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${this.accessToken}`,
                },
              };
              return fetch(url, newConfig);
            }).then(async (response) => {
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
              }
              
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return await response.json();
              } else {
                return await response.text();
              }
            });
          }

          // Start refresh process
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            console.log('🔄 Retrying original request with new token...');
            
            // Retry original request with new token
            const newConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${this.accessToken}`,
              },
            };
            
            const retryResponse = await fetch(url, newConfig);
            
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({}));
              throw new Error(retryErrorData.message || retryErrorData.error || `HTTP ${retryResponse.status}`);
            }

            const contentType = retryResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await retryResponse.json();
            } else {
              return await retryResponse.text();
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        } else {
          // Not a token expiration error, or no refresh token available
          console.log('❌ Authentication failed:', errorData.error);
          if (!this.refreshToken) {
            this.clearTokens();
            window.dispatchEvent(new CustomEvent('auth:logout', {
              detail: { reason: 'no_refresh_token' }
            }));
          }
          throw new Error(errorData.error || 'Authentication failed');
        }
      }
      
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
      // Enhanced error logging with debug dialog
      const context = `API ${config.method.toUpperCase()} ${endpoint}`;
      const additionalData = {
        endpoint,
        method: config.method,
        body: config.body,
        headers: config.headers,
        baseUrl: API_BASE_URL
      };

      // Simplified error handling without error logger to prevent performance issues
      console.error(`API Error [${config.method} ${endpoint}]:`, error);
      
      console.error(`API Error [${config.method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication API methods
  async login(email, password, rememberMe = false) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe },
    });

    if (response.success && response.tokens) {
      this.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: response.tokens
      }));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: { refreshToken: this.refreshToken },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'user_logout' }
      }));
    }
  }

  // Product API methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload methods (special handling for FormData)
  async uploadImage(file, folder = 'general') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    return this.request('/upload/image', {
      method: 'POST',
      headers: this.getHeaders(false), // Don't include Content-Type for FormData
      body: formData,
    });
  }
}

// Create and export a singleton instance
const enhancedApiService = new EnhancedAPIService();

export default enhancedApiService;
export { EnhancedAPIService };