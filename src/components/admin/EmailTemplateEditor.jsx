import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Edit3, 
  X, 
  Plus, 
  Trash2,
  Copy,
  Mail,
  Code,
  Type,
  Palette
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import apiService from '../../services/api';

export default function EmailTemplateEditor() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    category: 'response',
    variables: []
  });

  const [previewData, setPreviewData] = useState({
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
    companyName: 'Your Company',
    supportEmail: 'support@yourcompany.com'
  });

  const categories = [
    { value: 'response', label: 'Customer Response', color: 'blue' },
    { value: 'notification', label: 'Notifications', color: 'green' },
    { value: 'marketing', label: 'Marketing', color: 'purple' },
    { value: 'system', label: 'System', color: 'orange' }
  ];

  const predefinedTemplates = {
    customerResponse: {
      name: 'Customer Response - General',
      subject: 'Re: {{subject}} - Thank you for contacting us',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for contacting us!</h2>
            <p>Dear {{recipientName}},</p>
            <p>Thank you for reaching out to us regarding "{{subject}}". We have received your message and appreciate you taking the time to contact us.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #333;">Your Original Message:</h4>
              <p style="margin: 0; color: #666; font-style: italic;">{{originalMessage}}</p>
            </div>
            <p>Our team will review your inquiry and respond within 24 hours. If you have any urgent questions, please don't hesitate to contact us directly.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #666; margin: 0;">Best regards,<br><strong>{{companyName}} Support Team</strong></p>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">{{supportEmail}}</p>
            </div>
          </div>
        </div>
      `,
      category: 'response',
      variables: [
        { name: 'recipientName', description: 'Customer name', required: true },
        { name: 'subject', description: 'Original inquiry subject', required: true },
        { name: 'originalMessage', description: 'Customer original message', required: false },
        { name: 'companyName', description: 'Your company name', required: false },
        { name: 'supportEmail', description: 'Support email address', required: false }
      ]
    },
    welcomeEmail: {
      name: 'Welcome - New Customer',
      subject: 'Welcome to {{companyName}}!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; padding: 40px; border-radius: 15px; text-align: center;">
            <h1 style="color: #333; margin-bottom: 20px; font-size: 28px;">Welcome to {{companyName}}!</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">We're excited to have you join our community.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="text-align: left; color: #666; line-height: 1.8;">
                <li>Explore our product catalog</li>
                <li>Set up your preferences</li>
                <li>Join our community forum</li>
                <li>Follow us on social media</li>
              </ul>
            </div>
            <a href="{{dashboardUrl}}" style="display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Get Started</a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">If you have any questions, we're here to help at {{supportEmail}}</p>
          </div>
        </div>
      `,
      category: 'marketing',
      variables: [
        { name: 'companyName', description: 'Your company name', required: true },
        { name: 'dashboardUrl', description: 'Link to user dashboard', required: false },
        { name: 'supportEmail', description: 'Support email address', required: false }
      ]
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiService.request('/admin/email-templates');
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = (templateKey) => {
    const template = predefinedTemplates[templateKey];
    setFormData(template);
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      category: template.category,
      variables: template.variables || []
    });
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      const endpoint = selectedTemplate 
        ? `/admin/email-templates/${selectedTemplate._id}`
        : '/admin/email-templates';
      
      const method = selectedTemplate ? 'PUT' : 'POST';
      
      const response = await apiService.request(endpoint, {
        method,
        body: JSON.stringify(formData)
      });
      
      if (response.success) {
        await fetchTemplates();
        setShowEditor(false);
        setSelectedTemplate(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await apiService.request(`/admin/email-templates/${templateId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      htmlContent: '',
      category: 'response',
      variables: []
    });
  };

  const renderPreview = () => {
    let preview = formData.htmlContent;
    
    // Replace variables with preview data
    Object.keys(previewData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, previewData[key]);
    });
    
    return preview;
  };

  if (loading) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
        <p className="text-white/80">Loading email templates...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard delay={0.1}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Templates</h2>
            <p className="text-white/70">Create and manage reusable email templates</p>
          </div>
          <motion.button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg border border-blue-400/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            New Template
          </motion.button>
        </div>
      </GlassCard>

      {/* Quick Start Templates */}
      <GlassCard delay={0.2}>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(predefinedTemplates).map(([key, template]) => (
            <motion.div
              key={key}
              onClick={() => handleCreateTemplate(key)}
              className="p-4 border border-white/20 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="font-medium text-white mb-2">{template.name}</h4>
              <p className="text-white/60 text-sm mb-3">{template.subject}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full bg-${categories.find(c => c.value === template.category)?.color}-500/20 text-${categories.find(c => c.value === template.category)?.color}-300`}>
                {categories.find(c => c.value === template.category)?.label}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Templates List */}
      <GlassCard delay={0.3}>
        <h3 className="text-lg font-semibold text-white mb-4">Your Templates</h3>
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No templates created yet</p>
            <p className="text-white/40 text-sm">Start with a quick template above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <motion.div
                key={template._id}
                className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white">{template.name}</h4>
                  <p className="text-white/60 text-sm">{template.subject}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                      {categories.find(c => c.value === template.category)?.label}
                    </span>
                    <span className="text-xs text-white/50">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Template Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {selectedTemplate ? 'Edit Template' : 'Create Template'}
                </h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => setShowEditor(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {/* Editor Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-gray-800">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter email subject (use {{variables}} for dynamic content)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">HTML Content</label>
                    <textarea
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                      className="w-full h-64 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-mono text-sm"
                      placeholder="Enter HTML email content..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSaveTemplate}
                      disabled={saving || !formData.name || !formData.subject}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg border border-green-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Template'}
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setShowEditor(false);
                        resetForm();
                        setSelectedTemplate(null);
                      }}
                      className="px-4 py-2 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>

                {/* Preview */}
                {showPreview && (
                  <div className="border border-white/20 rounded-lg overflow-hidden">
                    <div className="bg-white/10 px-4 py-2 border-b border-white/20">
                      <h4 className="font-medium text-white">Preview</h4>
                    </div>
                    <div 
                      className="bg-white h-64 overflow-y-auto p-4"
                      dangerouslySetInnerHTML={{ __html: renderPreview() }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}