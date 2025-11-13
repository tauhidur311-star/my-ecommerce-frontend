import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Settings, Globe, Image, Video, Link,
  Plus, Edit, Trash2, Eye, Save, X, RefreshCw,
  Search, Filter, Layout, Code, Upload, ExternalLink
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [seoSettings, setSeoSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form data for editing
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'draft',
    type: 'page'
  });

  // Mock data
  const mockPages = [
    {
      _id: '1',
      title: 'About Us',
      slug: 'about',
      content: 'Learn about our company history and values...',
      metaDescription: 'Learn about our company, mission, and values',
      status: 'published',
      type: 'page',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      views: 1250
    },
    {
      _id: '2',
      title: 'Privacy Policy',
      slug: 'privacy',
      content: 'Our privacy policy explains how we handle your data...',
      metaDescription: 'Our privacy policy and data handling practices',
      status: 'published',
      type: 'page',
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      views: 890
    },
    {
      _id: '3',
      title: 'Terms of Service',
      slug: 'terms',
      content: 'Please read our terms of service carefully...',
      metaDescription: 'Terms of service and conditions for using our platform',
      status: 'draft',
      type: 'page',
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      views: 0
    },
    {
      _id: '4',
      title: 'Black Friday Sale 2024',
      slug: 'black-friday-2024',
      content: 'Huge discounts on all products this Black Friday...',
      metaDescription: 'Black Friday 2024 sale with massive discounts',
      status: 'published',
      type: 'promotion',
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      views: 3450
    }
  ];

  const mockBlocks = [
    {
      _id: '1',
      name: 'Hero Section',
      type: 'hero',
      content: {
        title: 'Welcome to Our Store',
        subtitle: 'Discover amazing products',
        image: '/api/placeholder/800/400',
        buttonText: 'Shop Now',
        buttonLink: '/store'
      },
      status: 'active',
      usageCount: 3
    },
    {
      _id: '2',
      name: 'Newsletter Signup',
      type: 'newsletter',
      content: {
        title: 'Stay Updated',
        description: 'Subscribe to our newsletter for latest updates',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe'
      },
      status: 'active',
      usageCount: 8
    },
    {
      _id: '3',
      name: 'Contact Info',
      type: 'contact',
      content: {
        phone: '+880-123-456-7890',
        email: 'info@example.com',
        address: '123 Main St, Dhaka, Bangladesh',
        hours: 'Mon-Fri 9AM-6PM'
      },
      status: 'active',
      usageCount: 5
    }
  ];

  const mockSeoSettings = {
    siteName: 'My E-commerce Store',
    siteDescription: 'Premium products at affordable prices',
    defaultMetaKeywords: 'ecommerce, online store, products, shopping',
    googleAnalyticsId: 'GA-XXXXXXXX-X',
    facebookPixelId: 'FB-XXXXXXXX',
    robotsTxt: 'User-agent: *\nDisallow: /admin\nAllow: /',
    sitemapEnabled: true,
    structuredDataEnabled: true
  };

  // Load data on component mount
  useEffect(() => {
    setPages(mockPages);
    setBlocks(mockBlocks);
    setSeoSettings(mockSeoSettings);
  }, []);

  // Content management functions
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || item.name,
      slug: item.slug || '',
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2),
      metaDescription: item.metaDescription || '',
      metaKeywords: item.metaKeywords || '',
      status: item.status,
      type: item.type || 'page'
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingItem) {
        // Update existing item
        if (activeTab === 'pages') {
          setPages(prev => prev.map(page => 
            page._id === editingItem._id 
              ? { ...page, ...formData, lastModified: new Date().toISOString() }
              : page
          ));
        } else {
          setBlocks(prev => prev.map(block => 
            block._id === editingItem._id 
              ? { ...block, name: formData.title, content: JSON.parse(formData.content), status: formData.status }
              : block
          ));
        }
      } else {
        // Create new item
        const newItem = {
          _id: Date.now().toString(),
          ...formData,
          lastModified: new Date().toISOString(),
          views: 0
        };

        if (activeTab === 'pages') {
          setPages(prev => [...prev, newItem]);
        } else {
          setBlocks(prev => [...prev, {
            ...newItem,
            name: formData.title,
            content: JSON.parse(formData.content),
            usageCount: 0
          }]);
        }
      }

      setShowEditor(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title || item.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (activeTab === 'pages') {
        setPages(prev => prev.filter(page => page._id !== item._id));
      } else {
        setBlocks(prev => prev.filter(block => block._id !== item._id));
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      metaKeywords: '',
      status: 'draft',
      type: 'page'
    });
  };

  const updateSeoSettings = async (newSettings) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSeoSettings(newSettings);
    } catch (error) {
      console.error('Error updating SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search and status
  const getFilteredItems = () => {
    const items = activeTab === 'pages' ? pages : blocks;
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.title || item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    return filtered;
  };

  const ContentEditor = () => (
    <AnimatePresence>
      {showEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'pages' ? 'Page' : 'Block'}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeTab === 'pages' ? 'Page Title' : 'Block Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title..."
                    />
                  </div>
                  
                  {activeTab === 'pages' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="url-slug"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab === 'pages' ? 'Page Content' : 'Block Configuration (JSON)'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={activeTab === 'pages' ? 12 : 8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={activeTab === 'pages' ? 'Enter page content...' : 'Enter JSON configuration...'}
                  />
                </div>

                {activeTab === 'pages' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="SEO meta description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                      <input
                        type="text"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="active">Active</option>
                    </select>
                  </div>

                  {activeTab === 'pages' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="page">Page</option>
                        <option value="promotion">Promotion</option>
                        <option value="blog">Blog Post</option>
                        <option value="landing">Landing Page</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <EnhancedButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save'}
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    onClick={() => setShowEditor(false)}
                  >
                    Cancel
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const SEOSettings = () => (
    <GlassCard title="SEO Settings">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={seoSettings.siteName}
              onChange={(e) => setSeoSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={seoSettings.googleAnalyticsId}
              onChange={(e) => setSeoSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
          <textarea
            value={seoSettings.siteDescription}
            onChange={(e) => setSeoSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Keywords</label>
          <input
            type="text"
            value={seoSettings.defaultMetaKeywords}
            onChange={(e) => setSeoSettings(prev => ({ ...prev, defaultMetaKeywords: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Robots.txt</label>
          <textarea
            value={seoSettings.robotsTxt}
            onChange={(e) => setSeoSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seoSettings.sitemapEnabled}
              onChange={(e) => setSeoSettings(prev => ({ ...prev, sitemapEnabled: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable Sitemap</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seoSettings.structuredDataEnabled}
              onChange={(e) => setSeoSettings(prev => ({ ...prev, structuredDataEnabled: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable Structured Data</span>
          </label>
        </div>

        <div className="pt-4 border-t">
          <EnhancedButton
            variant="primary"
            onClick={() => updateSeoSettings(seoSettings)}
            disabled={loading}
          >
            <Save size={16} />
            Save SEO Settings
          </EnhancedButton>
        </div>
      </div>
    </GlassCard>
  );

  const ItemCard = ({ item, type }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{item.title || item.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'published' || item.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {item.status?.toUpperCase()}
            </span>
            {item.type && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {item.type}
              </span>
            )}
            {item.usageCount !== undefined && (
              <span className="text-xs text-gray-500">Used {item.usageCount} times</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {item.slug && (
            <button
              onClick={() => window.open(`/${item.slug}`, '_blank')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Page"
            >
              <ExternalLink size={16} />
            </button>
          )}
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {item.slug && (
          <p className="text-sm text-gray-600">
            <strong>URL:</strong> /{item.slug}
          </p>
        )}
        {item.metaDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.metaDescription}</p>
        )}
        {item.lastModified && (
          <p className="text-xs text-gray-500">
            Last modified: {new Date(item.lastModified).toLocaleDateString()}
          </p>
        )}
        {item.views !== undefined && (
          <p className="text-xs text-gray-500">{item.views} views</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage website pages, blocks, and SEO settings</p>
        </div>
        <div className="flex gap-3">
          <EnhancedButton
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowEditor(true);
            }}
          >
            <Plus size={16} />
            Create {activeTab === 'pages' ? 'Page' : activeTab === 'blocks' ? 'Block' : 'Content'}
          </EnhancedButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        {[
          { id: 'pages', label: 'Pages', icon: FileText },
          { id: 'blocks', label: 'Reusable Blocks', icon: Layout },
          { id: 'seo', label: 'SEO Settings', icon: Globe }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEO Settings Tab */}
      {activeTab === 'seo' && <SEOSettings />}

      {/* Pages/Blocks Content */}
      {activeTab !== 'seo' && (
        <>
          {/* Filters */}
          <GlassCard>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>

              <EnhancedButton variant="outline" disabled={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </EnhancedButton>
            </div>
          </GlassCard>

          {/* Content Grid */}
          {getFilteredItems().length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? `No ${activeTab} match your current filters.`
                  : `You haven't created any ${activeTab} yet.`
                }
              </p>
              <EnhancedButton
                variant="primary"
                onClick={() => {
                  setEditingItem(null);
                  resetForm();
                  setShowEditor(true);
                }}
              >
                <Plus size={16} />
                Create Your First {activeTab === 'pages' ? 'Page' : 'Block'}
              </EnhancedButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems().map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  type={activeTab}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Content Editor Modal */}
      <ContentEditor />
    </div>
  );
};

export default ContentManagement;