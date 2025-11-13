import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { api } from '../services/api';

// Main application store
export const useAppStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        // Global state
        isOnline: navigator.onLine,
        user: null,
        isAuthenticated: false,
        theme: 'light',
        notifications: [],
        unreadCount: 0,
        
        // Loading states
        isLoading: {
          auth: false,
          data: false,
          submit: false
        },
        
        // Error states
        errors: {},
        
        // Cache timestamps
        cacheTimestamps: {},
        
        // Actions
        setOnlineStatus: (status) => set(state => {
          state.isOnline = status;
        }),
        
        setUser: (user) => set(state => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),
        
        setTheme: (theme) => set(state => {
          state.theme = theme;
          document.documentElement.setAttribute('data-theme', theme);
        }),
        
        setLoading: (key, value) => set(state => {
          state.isLoading[key] = value;
        }),
        
        setError: (key, error) => set(state => {
          state.errors[key] = error;
        }),
        
        clearError: (key) => set(state => {
          delete state.errors[key];
        }),
        
        clearAllErrors: () => set(state => {
          state.errors = {};
        }),
        
        addNotification: (notification) => set(state => {
          state.notifications.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
          });
          
          if (!notification.read) {
            state.unreadCount++;
          }
          
          // Keep only last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        }),
        
        markNotificationAsRead: (id) => set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }),
        
        markAllNotificationsAsRead: () => set(state => {
          state.notifications.forEach(n => n.read = true);
          state.unreadCount = 0;
        }),
        
        removeNotification: (id) => set(state => {
          const index = state.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        }),
        
        updateCacheTimestamp: (key) => set(state => {
          state.cacheTimestamps[key] = Date.now();
        }),
        
        isCacheValid: (key, maxAge = 5 * 60 * 1000) => {
          const timestamp = get().cacheTimestamps[key];
          return timestamp && (Date.now() - timestamp) < maxAge;
        },
        
        // Authentication actions
        login: async (credentials) => {
          set(state => { state.isLoading.auth = true; });
          try {
            const response = await api.post('/auth/login', credentials);
            const { user, token } = response.data;
            
            // Store token
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            set(state => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading.auth = false;
            });
            
            return { success: true, user };
          } catch (error) {
            set(state => {
              state.isLoading.auth = false;
              state.errors.auth = error.response?.data?.message || 'Login failed';
            });
            throw error;
          }
        },
        
        logout: async () => {
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.warn('Logout API call failed:', error);
          } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            set(state => {
              state.user = null;
              state.isAuthenticated = false;
              state.notifications = [];
              state.unreadCount = 0;
              state.errors = {};
            });
          }
        },
        
        initializeAuth: async () => {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/auth/me');
            
            set(state => {
              state.user = response.data.user;
              state.isAuthenticated = true;
            });
          } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          cacheTimestamps: state.cacheTimestamps
        })
      }
    ),
    {
      name: 'app-store'
    }
  )
);

// Analytics store
export const useAnalyticsStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        data: null,
        realTimeMetrics: null,
        isLoading: false,
        error: null,
        lastFetch: null,
        timeRange: '7d',
        
        setTimeRange: (range) => set(state => {
          state.timeRange = range;
        }),
        
        fetchAnalytics: async (range = null, force = false) => {
          const state = get();
          const timeRange = range || state.timeRange;
          const now = Date.now();
          const cacheValid = state.lastFetch && (now - state.lastFetch) < 300000; // 5 min cache
          
          if (!force && cacheValid && state.data && !state.isLoading) {
            return state.data;
          }
          
          set(state => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const response = await api.get(`/admin/analytics/summary?range=${timeRange}`);
            const data = response.data;
            
            set(state => {
              state.data = data.data;
              state.isLoading = false;
              state.lastFetch = now;
              state.error = null;
            });
            
            return data.data;
          } catch (error) {
            set(state => {
              state.error = error.response?.data?.message || 'Failed to fetch analytics';
              state.isLoading = false;
            });
            throw error;
          }
        },
        
        updateRealTimeMetrics: (metrics) => set(state => {
          state.realTimeMetrics = metrics;
          if (state.data) {
            state.data.realTimeMetrics = metrics;
          }
        }),
        
        clearCache: () => set(state => {
          state.data = null;
          state.lastFetch = null;
          state.error = null;
        })
      })),
      {
        name: 'analytics-store',
        partialize: (state) => ({
          data: state.data,
          lastFetch: state.lastFetch,
          timeRange: state.timeRange
        })
      }
    )
  )
);

// Inventory store
export const useInventoryStore = create()(
  devtools(
    immer((set, get) => ({
      products: [],
      lowStockAlerts: [],
      metrics: null,
      isLoading: false,
      error: null,
      filters: {
        search: '',
        category: 'all',
        status: 'all'
      },
      
      setFilters: (filters) => set(state => {
        state.filters = { ...state.filters, ...filters };
      }),
      
      fetchInventory: async () => {
        set(state => { state.isLoading = true; });
        
        try {
          const response = await api.get('/admin/inventory');
          
          set(state => {
            state.products = response.data.data.products;
            state.metrics = response.data.data.metrics;
            state.isLoading = false;
            state.error = null;
          });
        } catch (error) {
          set(state => {
            state.error = error.response?.data?.message || 'Failed to fetch inventory';
            state.isLoading = false;
          });
        }
      },
      
      fetchLowStockAlerts: async () => {
        try {
          const response = await api.get('/admin/inventory/alerts');
          set(state => {
            state.lowStockAlerts = response.data.data;
          });
        } catch (error) {
          console.error('Failed to fetch low stock alerts:', error);
        }
      },
      
      updateProductStock: (productId, newStock) => set(state => {
        const product = state.products.find(p => p._id === productId);
        if (product) {
          product.stock = newStock;
        }
      }),
      
      removeProduct: (productId) => set(state => {
        state.products = state.products.filter(p => p._id !== productId);
      })
    }))
  )
);

// Initialize online status monitoring
window.addEventListener('online', () => useAppStore.getState().setOnlineStatus(true));
window.addEventListener('offline', () => useAppStore.getState().setOnlineStatus(false));

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);