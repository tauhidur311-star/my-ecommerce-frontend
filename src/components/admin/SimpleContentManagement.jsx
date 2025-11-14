import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Settings, Globe, Image, Plus, Edit, Trash2, Eye, Save, X,
  Search, Filter, Layout, Code, Upload, ExternalLink, AlertCircle, CheckCircle
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';
import toast from 'react-hot-toast';

const SimpleContentManagement = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Form data for editing
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    status: 'draft',
    type: 'page'
  });

  // Load content from localStorage or API
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from API first
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/admin/content', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPages(data.pages || []);
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Load from localStorage or create initial content
        const savedContent = localStorage.getItem('admin-content');
        if (savedContent) {
          setPages(JSON.parse(savedContent));
        } else {
          // Create initial content pages
          const initialPages = [
            {
              _id: Date.now().toString(),
              title: 'About Us',
              slug: 'about',
              content: 'Welcome to our store! We are committed to providing the best products and services to our customers.',
              metaDescription: 'Learn about our company, mission, and values',
              status: 'published',
              type: 'page',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              views: 0
            },
            {
              _id: (Date.now() + 1).toString(),
              title: 'Contact Info',
              slug: 'contact-info',
              content: 'Get in touch with us for any questions or support needs.',
              metaDescription: 'Contact information and support details',
              status: 'published',
              type: 'page',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              views: 0
            }
          ];
          setPages(initialPages);
          localStorage.setItem('admin-content', JSON.stringify(initialPages));
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async (contentData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Generate slug from title if not provided
      if (!contentData.slug && contentData.title) {
        contentData.slug = contentData.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      }

      // Validate required fields
      if (!contentData.title.trim()) {
        toast.error('Page title is required');
        return;
      }

      if (!contentData.slug.trim()) {
        toast.error('Page URL slug is required');
        return;
      }

      // Check for duplicate slugs
      const existingPage = pages.find(p => 
        p.slug === contentData.slug && p._id !== editingItem?._id
      );
      
      if (existingPage) {
        toast.error(`A page with URL "/${contentData.slug}" already exists`);
        return;
      }

      let updatedPages;
      
      if (editingItem) {
        // Update existing page
        updatedPages = pages.map(page => 
          page._id === editingItem._id 
            ? { ...page, ...contentData, updatedAt: new Date().toISOString() }
            : page
        );
      } else {
        // Create new page
        const newPage = {
          _id: Date.now().toString(),
          ...contentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 0
        };
        updatedPages = [...pages, newPage];
      }

      // Try to save to API
      try {
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pages: updatedPages })
        });
        
        if (!response.ok) {
          throw new Error('API save failed');
        }
      } catch (apiError) {
        // Save to localStorage as fallback
        localStorage.setItem('admin-content', JSON.stringify(updatedPages));
      }

      setPages(updatedPages);
      setShowEditor(false);
      setEditingItem(null);
      resetForm();
      toast.success(editingItem ? 'Page updated successfully' : 'Page created successfully');
      
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const deletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      const updatedPages = pages.filter(page => page._id !== pageId);
      
      // Try to save to API
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pages: updatedPages })
        });
        
        if (!response.ok) {
          throw new Error('API save failed');
        }
      } catch (apiError) {
        // Save to localStorage as fallback
        localStorage.setItem('admin-content', JSON.stringify(updatedPages));
      }

      setPages(updatedPages);
      toast.success('Page deleted successfully');
      
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      status: 'draft',
      type: 'page'
    });
  };

  const viewPage = (page) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    
    if (page.status === 'published') {
      // Published pages are accessible to everyone
      const pageUrl = `/${page.slug}`;
      window.open(pageUrl, '_blank');
      
    } else if (page.status === 'draft') {
      if (isAdmin) {
        // Admins can preview draft pages
        const draftUrl = `/preview/${page.slug}?token=${localStorage.getItem('token')}`;
        
        // Try admin preview URL first, fallback to modal
        const previewWindow = window.open(draftUrl, '_blank');
        
        // Fallback to modal preview if admin preview route doesn't exist
        setTimeout(() => {
          if (previewWindow && previewWindow.closed) {
            showPagePreview(page, 'ADMIN DRAFT PREVIEW');
          }
        }, 1000);
      } else {
        alert('⚠️ Draft pages are only accessible to administrators');
        return;
      }
      
    } else if (page.status === 'archived') {
      if (isAdmin) {
        // Even admins should only see archived content in preview modal
        showPagePreview(page, 'ARCHIVED CONTENT PREVIEW');
      } else {
        alert('🚫 This page has been archived and is no longer accessible');
        return;
      }
    }
  };

  const showPagePreview = (page, previewType = 'PREVIEW') => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Determine preview styling based on status
    let headerColor = '#1f2937';
    let headerText = previewType;
    let bannerColor = '#3b82f6';
    
    if (page.status === 'draft') {
      headerColor = '#d97706';
      bannerColor = '#f59e0b';
      headerText = '⚠️ DRAFT PREVIEW - ADMIN ONLY';
    } else if (page.status === 'archived') {
      headerColor = '#6b7280';
      bannerColor = '#9ca3af';
      headerText = '🗄️ ARCHIVED CONTENT - ADMIN PREVIEW';
    }
    
    const previewContent = `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <!-- Admin Preview Banner -->
        <div style="background: ${bannerColor}; color: white; padding: 15px; text-align: center; font-weight: bold; margin-bottom: 0;">
          ${headerText}
        </div>
        <div style="background: #f8fafc; padding: 10px; border-left: 4px solid ${bannerColor}; margin-bottom: 20px;">
          <strong>Admin Info:</strong> Viewing as ${currentUser.name || 'Admin'} | 
          Status: ${page.status.toUpperCase()} | 
          URL: /${page.slug} |
          Last Modified: ${new Date(page.updatedAt).toLocaleString()}
        </div>
        
        <!-- Page Content -->
        <div style="padding: 20px;">
          <h1 style="color: ${headerColor}; margin-bottom: 10px;">${page.title}</h1>
          <div style="line-height: 1.6; color: #374151; margin: 20px 0;">
            ${page.content.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <div style="color: #6b7280; font-size: 14px; background: #f9fafb; padding: 15px; border-radius: 8px;">
            <strong>SEO Meta Description:</strong><br>
            ${page.metaDescription || 'No meta description provided'}
          </div>
        </div>
        
        <!-- Access Control Notice -->
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; margin: 20px; border-radius: 8px;">
          <strong>⚠️ Access Control Notice:</strong><br>
          ${page.status === 'draft' ? 
            'This draft page is only accessible to administrators. Publish to make it public.' :
            page.status === 'archived' ? 
            'This archived page is not accessible to the public and returns 404 errors.' :
            'This published page is publicly accessible.'
          }
        </div>
      </div>
    `;
    
    const previewWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${headerText}: ${page.title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; background: #ffffff; }
            .status-draft { border-left: 4px solid #f59e0b !important; }
            .status-archived { border-left: 4px solid #9ca3af !important; }
          </style>
        </head>
        <body>
          ${previewContent}
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  const openEditor = (page = null) => {
    if (page) {
      setEditingItem(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaDescription: page.metaDescription || '',
        status: page.status,
        type: page.type
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setShowEditor(true);
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle size={16} />;
      case 'draft': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage your website pages and content</p>
        </div>
        
        <EnhancedButton variant="primary" onClick={() => openEditor()}>
          <Plus size={16} />
          Create Page
        </EnhancedButton>
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
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </GlassCard>

      {/* Pages List */}
      <div className="grid gap-6">
        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-600 mb-4">
              {pages.length === 0 
                ? "Create your first page to get started." 
                : "No pages match your current filters."
              }
            </p>
            <EnhancedButton variant="primary" onClick={() => openEditor()}>
              <Plus size={16} />
              Create First Page
            </EnhancedButton>
          </div>
        ) : (
          filteredPages.map((page) => (
            <motion.div
              key={page._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(page.status)}`}>
                      {getStatusIcon(page.status)}
                      {page.status.toUpperCase()}
                    </span>
                    {page.status === 'draft' && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Not Public
                      </span>
                    )}
                    {page.status === 'archived' && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">
                    /{page.slug}
                    {page.status === 'published' && (
                      <span className="text-green-600 ml-2">✓ Live</span>
                    )}
                  </p>
                  <p className="text-gray-700 line-clamp-2 mb-3">
                    {page.content.length > 150 ? 
                      page.content.substring(0, 150) + '...' : 
                      page.content
                    }
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                    <span>Views: {page.views}</span>
                    {page.status === 'published' && (
                      <span className="text-green-600">• Public</span>
                    )}
                    {page.status === 'draft' && (
                      <span className="text-yellow-600">• Draft Only</span>
                    )}
                    {page.status === 'archived' && (
                      <span className="text-gray-600">• Archived</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => viewPage(page)}
                    title={
                      page.status === 'published' ? 'View live page' :
                      page.status === 'draft' ? 'Admin preview (draft not public)' :
                      'Admin preview (archived - not accessible)'
                    }
                  >
                    <Eye size={14} />
                    {page.status === 'published' ? 'View Live' : 
                     page.status === 'draft' ? 'Preview (Admin)' :
                     'Preview (Archived)'}
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => openEditor(page)}
                  >
                    <Edit size={14} />
                    Edit
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => deletePage(page._id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem ? 'Edit Page' : 'Create Page'}
                  </h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter page title"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="page-url-slug"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your page content here..."
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description for search engines"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <EnhancedButton
                    variant="outline"
                    onClick={() => setShowEditor(false)}
                  >
                    Cancel
                  </EnhancedButton>
                  <EnhancedButton
                    variant="primary"
                    onClick={() => saveContent(formData)}
                  >
                    <Save size={16} />
                    {editingItem ? 'Update Page' : 'Create Page'}
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleContentManagement;