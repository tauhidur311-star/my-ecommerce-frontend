import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, Package, Mail, Settings, Shield,
  Bell, Search, Menu, X, Home, TrendingUp, AlertTriangle,
  MessageCircle, Calendar, Download, RefreshCw, Activity,
  ShoppingBag, DollarSign, Star, FileText, Palette
} from 'lucide-react';
import ConnectionStatus from '../../components/ui/ConnectionStatus';
import { useAnalyticsData } from '../../hooks/useAnalyticsData.js';
import { useNotifications, useRealTimeNotifications } from '../../hooks/useNotifications.js';
import { useOfflineCache, useServiceWorker } from '../../hooks/useOfflineCache.js';
import GlassCard from '../../components/ui/glass/GlassCard';
import EnhancedButton from '../../components/ui/EnhancedButton';
import NotificationToast from '../../components/notifications/NotificationToast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

// Lazy load components for better performance
const EnhancedAnalyticsDashboard = lazy(() => import('../../components/analytics/EnhancedAnalyticsDashboard.jsx'));
const InventoryTable = lazy(() => import('../../components/inventory/InventoryTable.jsx'));
const ProductsManagement = lazy(() => import('../../components/admin/ProductsManagement.jsx'));
const UserManagement = lazy(() => import('../../components/admin/UserManagement.jsx'));
const SegmentationPanel = lazy(() => import('../../components/customers/SegmentationPanel.jsx'));
const ContactSubmissions = lazy(() => import('../../components/admin/ContactSubmissions.jsx'));
const OrdersManagement = lazy(() => import('../../components/admin/OrdersManagement.jsx'));
const CampaignManager = lazy(() => import('../../components/marketing/CampaignManager.jsx'));
const PerformanceMonitor = lazy(() => import('../../components/admin/SimplePerformanceMonitor.jsx'));
const ContentManagement = lazy(() => import('../../components/admin/SimpleContentManagement.jsx'));
const ConnectionDiagnostics = lazy(() => import('../../components/admin/ConnectionDiagnostics.jsx'));

const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // ✅ FIXED: Removed 'theme-editor' from admin navigation - it should be a separate app
  const navigationItems = useCallback(() => [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'contacts', label: 'Contact Us', icon: MessageCircle },
    { id: 'marketing', label: 'Marketing', icon: Mail },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'diagnostics', label: 'Diagnostics', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ], []);
  
  // Load admin preferences from cookies
  React.useEffect(() => {
    const cookieManager = require('../../utils/cookieManager').default;
    const savedTab = cookieManager.getCookie('adminActiveTab');
    const savedLayout = cookieManager.getAdminLayout();
    
    if (savedTab && navigationItems().find(item => item.id === savedTab)) {
      setActiveTab(savedTab);
    }
    
    // Apply admin layout preferences
    document.body.setAttribute('data-admin-layout', savedLayout);
  }, [navigationItems]); // Include navigationItems dependency
  
  // Save active tab to cookies when it changes
  React.useEffect(() => {
    const cookieManager = require('../../utils/cookieManager').default;
    cookieManager.setCookie('adminActiveTab', activeTab, { maxAge: 31536000 });
  }, [activeTab]);

  // ✅ FIXED: Updated valid tabs list - removed 'theme-editor'
  useEffect(() => {
    const validTabs = ['overview', 'analytics', 'orders', 'products', 'inventory', 'users', 'customers', 'contacts', 'marketing', 'content', 'performance', 'diagnostics', 'settings'];
    if (!validTabs.includes(activeTab)) {
      console.log('Invalid tab detected, resetting to overview:', activeTab);
      setActiveTab('overview');
    }
  }, [activeTab]); // Include activeTab dependency
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Hooks
  const { summary, realTimeMetrics, isLoading, refreshAll } = useAnalyticsData('7d');
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { isConnected } = useRealTimeNotifications();
  const { isOnline, lastSync } = useOfflineCache('admin_dashboard');
  const { isRegistered, updateAvailable, updateServiceWorker } = useServiceWorker();

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && refreshAll) {
        refreshAll();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isOnline, refreshAll]); // Include refreshAll dependency

  const quickStats = [
    {
      title: 'Revenue Today',
      value: `৳${realTimeMetrics?.revenueToday?.toLocaleString() || 0}`,
      change: summary?.revenueGrowth || 0,
      color: 'blue',
      icon: TrendingUp
    },
    {
      title: 'Orders Today',
      value: realTimeMetrics?.ordersToday || 0,
      change: summary?.ordersGrowth || 0,
      color: 'green',
      icon: Package
    },
    {
      title: 'Active Sessions',
      value: realTimeMetrics?.activeSessions || 0,
      color: 'purple',
      icon: Users
    },
    {
      title: 'Notifications',
      value: unreadCount,
      color: 'orange',
      icon: Bell
    }
  ];

  const SidebarItem = ({ item, isActive, onClick }) => (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <item.icon size={20} />
      <span className="font-medium">{item.label}</span>
    </motion.button>
  );

  const QuickStatCard = ({ stat, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          {stat.change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp 
                size={14} 
                className={stat.change >= 0 ? 'text-green-500' : 'text-red-500'} 
              />
              <span className={`text-sm font-medium ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stat.change)}%
              </span>
              <span className="text-sm text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${stat.color}-100`}>
          <stat.icon size={24} className={`text-${stat.color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const StatusBar = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            Real-time: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          
          {lastSync && (
            <span className="text-xs opacity-75">
              Last sync: {new Date(lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {updateAvailable && (
            <button 
              onClick={updateServiceWorker}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
            >
              Update Available
            </button>
          )}
          
          <span className="text-xs">
            Service Worker: {isRegistered ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <QuickStatCard key={stat.title} stat={stat} delay={index * 0.1} />
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard title="Recent Orders" className="h-96">
                <div className="space-y-3">
                  {realTimeMetrics?.recentOrders?.length > 0 ? (
                    realTimeMetrics.recentOrders.slice(0, 5).map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Order #{order.orderNumber}</p>
                            <p className="text-xs text-gray-600">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">৳{order.total.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 mt-8">
                      <Package className="mx-auto w-12 h-12 mb-2 opacity-50" />
                      <p>No recent orders</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard title="System Alerts" className="h-96">
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" />
                        <span className="text-sm font-medium">{notification.title}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </motion.div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <Bell className="mx-auto w-12 h-12 mb-2 opacity-50" />
                      <p>No alerts at the moment</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <EnhancedAnalyticsDashboard />
          </Suspense>
        );

      case 'orders':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <OrdersManagement />
          </Suspense>
        );

      case 'products':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ProductsManagement />
          </Suspense>
        );

      case 'inventory':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <InventoryTable />
          </Suspense>
        );

      case 'users':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <UserManagement />
          </Suspense>
        );

      case 'customers':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <SegmentationPanel />
          </Suspense>
        );

      case 'contacts':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ContactSubmissions />
          </Suspense>
        );

      case 'marketing':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <CampaignManager />
          </Suspense>
        );


      case 'content':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ContentManagement />
          </Suspense>
        );

      case 'performance':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <PerformanceMonitor />
          </Suspense>
        );

      case 'diagnostics':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ConnectionDiagnostics />
          </Suspense>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <GlassCard title="System Settings">
              <div className="space-y-4">
                <p className="text-gray-600">System settings and configuration options will be available here.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Security Settings</h4>
                    <p className="text-sm text-gray-600">Manage security preferences and access controls</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notification Settings</h4>
                    <p className="text-sm text-gray-600">Configure alert preferences and notification channels</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        );

      default:
        return <div>Tab content not found</div>;
    }
  };

  if (isLoading && !summary) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <StatusBar />
      
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Admin</h2>
                    <p className="text-sm text-gray-600">Dashboard</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navigationItems().map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    />
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigationItems().find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-600">
                    Welcome back! Here's what's happening with your store.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  />
                </div>

                {/* View Store Button */}
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Home size={16} />
                  View Store
                </EnhancedButton>

                {/* ✅ FIXED: Clear Theme Editor Button */}
                <EnhancedButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/design')}
                  title="Open Theme Editor in new tab"
                >
                  <Palette size={16} />
                  Theme Editor
                </EnhancedButton>

                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={refreshAll}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </EnhancedButton>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200/50 z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 10).map((notification) => (
                            <NotificationToast
                              key={notification._id}
                              notification={notification}
                              inModal={true}
                            />
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="mx-auto w-12 h-12 mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;