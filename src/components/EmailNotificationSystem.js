import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Settings, Users, Package, ShoppingCart, 
  Bell, Check, X, Edit2, Trash2, Eye, Calendar, Clock,
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailNotificationSystem = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState({});
  const [emailQueue, setEmailQueue] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = () => {
    try {
      // Load email templates
      const templatesData = localStorage.getItem('email-templates');
      if (templatesData) {
        setEmailTemplates(JSON.parse(templatesData));
      } else {
        setEmailTemplates(defaultTemplates);
        localStorage.setItem('email-templates', JSON.stringify(defaultTemplates));
      }

      // Load email settings
      const settingsData = localStorage.getItem('email-settings');
      if (settingsData) {
        setEmailSettings(JSON.parse(settingsData));
      } else {
        setEmailSettings(defaultSettings);
        localStorage.setItem('email-settings', JSON.stringify(defaultSettings));
      }

      // Load email history
      const historyData = localStorage.getItem('email-history');
      if (historyData) {
        setEmailHistory(JSON.parse(historyData));
      }

      // Load email queue
      const queueData = localStorage.getItem('email-queue');
      if (queueData) {
        setEmailQueue(JSON.parse(queueData));
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      toast.error('Failed to load email configuration');
    }
  };

  const defaultTemplates = [
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      subject: 'Order Confirmation - {{orderNumber}}',
      category: 'orders',
      content: `
        <h2>Thank you for your order!</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order <strong>{{orderNumber}}</strong> has been confirmed and is being processed.</p>
        <h3>Order Details:</h3>
        <ul>
          {{#each items}}
          <li>{{name}} - Quantity: {{quantity}} - Price: ৳{{price}}</li>
          {{/each}}
        </ul>
        <p><strong>Total: ৳{{total}}</strong></p>
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>Your Store Team</p>
      `,
      isActive: true,
      lastModified: new Date().toISOString()
    },
    {
      id: 'order_shipped',
      name: 'Order Shipped',
      subject: 'Your order {{orderNumber}} has been shipped!',
      category: 'orders',
      content: `
        <h2>Your order is on its way!</h2>
        <p>Dear {{customerName}},</p>
        <p>Great news! Your order <strong>{{orderNumber}}</strong> has been shipped.</p>
        {{#if trackingNumber}}
        <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
        {{/if}}
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        <p>You can track your package using the tracking number above.</p>
        <p>Best regards,<br>Your Store Team</p>
      `,
      isActive: true,
      lastModified: new Date().toISOString()
    },
    {
      id: 'low_stock_alert',
      name: 'Low Stock Alert',
      subject: 'Low Stock Alert - {{productName}}',
      category: 'inventory',
      content: `
        <h2>Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        <p><strong>Product:</strong> {{productName}}</p>
        <p><strong>Current Stock:</strong> {{currentStock}}</p>
        <p><strong>Category:</strong> {{category}}</p>
        <p>Please consider restocking this item to avoid stockouts.</p>
        <p>Admin Team</p>
      `,
      isActive: true,
      lastModified: new Date().toISOString()
    },
    {
      id: 'welcome_email',
      name: 'Welcome Email',
      subject: 'Welcome to {{storeName}}!',
      category: 'customers',
      content: `
        <h2>Welcome to {{storeName}}!</h2>
        <p>Dear {{customerName}},</p>
        <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
        <p>Here's what you can do with your account:</p>
        <ul>
          <li>Track your orders</li>
          <li>Save items to your wishlist</li>
          <li>Manage multiple delivery addresses</li>
          <li>Get exclusive member offers</li>
        </ul>
        <p>Happy shopping!</p>
        <p>Best regards,<br>{{storeName}} Team</p>
      `,
      isActive: true,
      lastModified: new Date().toISOString()
    },
    {
      id: 'promotional_email',
      name: 'Promotional Email',
      subject: 'Special Offer - {{offerTitle}}',
      category: 'marketing',
      content: `
        <h2>{{offerTitle}}</h2>
        <p>Dear {{customerName}},</p>
        <p>{{offerDescription}}</p>
        <p><strong>Offer Details:</strong></p>
        <ul>
          <li>Discount: {{discountAmount}}</li>
          <li>Valid until: {{validUntil}}</li>
          <li>Code: {{promoCode}}</li>
        </ul>
        <p>Don't miss out on this amazing deal!</p>
        <p>Best regards,<br>{{storeName}} Team</p>
      `,
      isActive: true,
      lastModified: new Date().toISOString()
    }
  ];

  const defaultSettings = {
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@yourstore.com',
    fromName: 'Your Store',
    replyToEmail: 'support@yourstore.com',
    enableEmailNotifications: true,
    enableOrderConfirmations: true,
    enableShippingNotifications: true,
    enableLowStockAlerts: true,
    enableWelcomeEmails: true,
    enablePromotionalEmails: false,
    dailyEmailLimit: 1000,
    retryAttempts: 3,
    retryDelay: 300 // seconds
  };

  const saveEmailTemplates = (templates) => {
    localStorage.setItem('email-templates', JSON.stringify(templates));
    setEmailTemplates(templates);
  };

  const saveEmailSettings = (settings) => {
    localStorage.setItem('email-settings', JSON.stringify(settings));
    setEmailSettings(settings);
  };

  const addToEmailHistory = (emailData) => {
    const historyEntry = {
      id: Date.now().toString(),
      ...emailData,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [historyEntry, ...emailHistory].slice(0, 100); // Keep last 100 emails
    setEmailHistory(updatedHistory);
    localStorage.setItem('email-history', JSON.stringify(updatedHistory));
  };

  const sendEmail = async (emailData) => {
    try {
      // In a real application, this would make an API call to your email service
      // For demo purposes, we'll simulate email sending
      
      const { to, subject, content, templateId, variables } = emailData;
      
      // Process template variables
      let processedContent = content;
      let processedSubject = subject;
      
      if (variables) {
        Object.keys(variables).forEach(key => {
          const placeholder = `{{${key}}}`;
          processedContent = processedContent.replace(new RegExp(placeholder, 'g'), variables[key]);
          processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), variables[key]);
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to email history
      addToEmailHistory({
        to,
        subject: processedSubject,
        content: processedContent,
        templateId,
        status: 'sent',
        deliveredAt: new Date().toISOString()
      });

      toast.success(`Email sent successfully to ${to}`);
      return { success: true };
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Add to email history with error status
      addToEmailHistory({
        ...emailData,
        status: 'failed',
        error: error.message
      });
      
      toast.error('Failed to send email');
      return { success: false, error: error.message };
    }
  };

  const sendBulkEmails = async (emailList) => {
    const results = [];
    
    for (const email of emailList) {
      const result = await sendEmail(email);
      results.push({ email: email.to, ...result });
      
      // Add small delay between emails to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    toast.success(`Bulk email completed: ${successful} sent, ${failed} failed`);
    return results;
  };

  const getEmailStatsForPeriod = (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEmails = emailHistory.filter(email => 
      new Date(email.timestamp) >= cutoffDate
    );
    
    return {
      total: recentEmails.length,
      sent: recentEmails.filter(e => e.status === 'sent').length,
      failed: recentEmails.filter(e => e.status === 'failed').length,
      deliveryRate: recentEmails.length > 0 
        ? (recentEmails.filter(e => e.status === 'sent').length / recentEmails.length * 100).toFixed(1)
        : 0
    };
  };

  const stats = getEmailStatsForPeriod(30);

  const tabItems = [
    { id: 'templates', title: 'Templates', icon: Mail },
    { id: 'settings', title: 'Settings', icon: Settings },
    { id: 'history', title: 'History', icon: Clock },
    { id: 'send', title: 'Send Email', icon: Send }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="text-blue-600" />
              Email Notifications
            </h1>
            <p className="text-gray-600">Manage email templates and notification settings</p>
          </div>
        </div>

        {/* Email Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Sent (30d)</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="text-blue-200" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Delivered</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <CheckCircle className="text-green-200" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <AlertCircle className="text-red-200" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Delivery Rate</p>
                <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
              </div>
              <CheckCircle className="text-purple-200" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.title}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'templates' && (
            <TemplatesTab
              templates={emailTemplates}
              onSave={saveEmailTemplates}
              showForm={showTemplateForm}
              setShowForm={setShowTemplateForm}
              editingTemplate={editingTemplate}
              setEditingTemplate={setEditingTemplate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={emailSettings}
              onSave={saveEmailSettings}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              history={emailHistory}
              onResend={sendEmail}
            />
          )}

          {activeTab === 'send' && (
            <SendEmailTab
              templates={emailTemplates}
              onSend={sendEmail}
              onBulkSend={sendBulkEmails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Templates Tab Component
const TemplatesTab = ({ templates, onSave, showForm, setShowForm, editingTemplate, setEditingTemplate }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: 'orders',
    content: '',
    isActive: true
  });

  const categories = [
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'marketing', label: 'Marketing', icon: Bell }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const templateData = {
      id: editingTemplate?.id || Date.now().toString(),
      ...formData,
      lastModified: new Date().toISOString()
    };

    let updatedTemplates;
    if (editingTemplate) {
      updatedTemplates = templates.map(t => t.id === editingTemplate.id ? templateData : t);
      toast.success('Template updated successfully!');
    } else {
      updatedTemplates = [...templates, templateData];
      toast.success('Template created successfully!');
    }

    onSave(updatedTemplates);
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', category: 'orders', content: '', isActive: true });
  };

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        category: editingTemplate.category,
        content: editingTemplate.content,
        isActive: editingTemplate.isActive
      });
    }
  }, [editingTemplate]);

  const deleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      onSave(updatedTemplates);
      toast.success('Template deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Email Subject (use {{variables}} for dynamic content)"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <textarea
            placeholder="Email Content (HTML supported, use {{variables}} for dynamic content)"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="8"
            required
          />
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active Template</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingTemplate(null);
                setFormData({ name: '', subject: '', category: 'orders', content: '', isActive: true });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => {
          const categoryInfo = categories.find(cat => cat.value === template.category);
          const CategoryIcon = categoryInfo?.icon || Mail;
          
          return (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon size={16} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowForm(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong> {template.subject}
              </p>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Category: {categoryInfo?.label}</span>
                <span>Modified: {new Date(template.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates</h3>
          <p className="text-gray-600">Create your first email template to get started.</p>
        </div>
      )}
    </div>
  );
};

// Simplified Settings, History, and Send Email tabs would go here...
const SettingsTab = () => <div>Email Settings Configuration</div>;
const HistoryTab = () => <div>Email History and Logs</div>;
const SendEmailTab = () => <div>Send Email Interface</div>;

export default EmailNotificationSystem;