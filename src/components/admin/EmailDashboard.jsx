import React, { useState, useEffect } from 'react';
import { Mail, Send, Settings, Clock, User, Subject, MessageSquare, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const EmailDashboard = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send', 'history', 'settings'
  const [emailSettings, setEmailSettings] = useState({
    senderName: '',
    replyToAddress: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true
  });
  const [emailHistory, setEmailHistory] = useState([]);
  const [sendEmailForm, setSendEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    isHtml: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchEmailSettings();
    } else if (activeTab === 'history') {
      fetchEmailHistory();
    }
  }, [activeTab]);

  const fetchEmailSettings = async () => {
    try {
      const response = await apiService.request('/admin/email-settings');
      if (response.success && response.data) {
        setEmailSettings({ ...emailSettings, ...response.data });
      }
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
    }
  };

  const saveEmailSettings = async () => {
    try {
      setSaving(true);
      const response = await apiService.request('/admin/email-settings', {
        method: 'POST',
        body: JSON.stringify(emailSettings)
      });

      if (response.success) {
        toast.success('Email settings saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.request('/admin/email-history?limit=50');
      if (response.success) {
        setEmailHistory(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      toast.error('Failed to load email history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!sendEmailForm.to || !sendEmailForm.subject || !sendEmailForm.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.request('/admin/send-email', {
        method: 'POST',
        body: JSON.stringify(sendEmailForm)
      });

      if (response.success) {
        toast.success('Email sent successfully!');
        setSendEmailForm({ to: '', subject: '', body: '', isHtml: false });
        // Refresh history if we're on that tab
        if (activeTab === 'history') {
          fetchEmailHistory();
        }
      } else {
        throw new Error(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Dashboard</h2>
        <p className="text-gray-600">Manage email settings, send emails, and view email history.</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="flex border-b border-gray-200/50">
          {[
            { key: 'send', label: 'Send Email', icon: Send },
            { key: 'history', label: 'Email History', icon: Clock },
            { key: 'settings', label: 'Email Settings', icon: Settings }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Send Email Tab */}
            {activeTab === 'send' && (
              <motion.div
                key="send"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Email Address *
                    </label>
                    <input
                      type="email"
                      value={sendEmailForm.to}
                      onChange={(e) => setSendEmailForm({ ...sendEmailForm, to: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={sendEmailForm.subject}
                      onChange={(e) => setSendEmailForm({ ...sendEmailForm, subject: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email subject"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body *
                  </label>
                  <textarea
                    value={sendEmailForm.body}
                    onChange={(e) => setSendEmailForm({ ...sendEmailForm, body: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter your email message here..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sendEmailForm.isHtml}
                      onChange={(e) => setSendEmailForm({ ...sendEmailForm, isHtml: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Send as HTML</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={sendEmail}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Sending...' : 'Send Email'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Email History Tab */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No emails sent yet</h3>
                    <p className="text-gray-600">Email history will appear here once you start sending emails.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailHistory.map((email) => (
                      <div key={email._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(email.status)}
                              <span className="font-medium text-gray-900">{email.subject}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>To: {email.to}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Sent: {formatDate(email.sentAt || email.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              email.status === 'sent' ? 'bg-green-100 text-green-800' :
                              email.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {email.status || 'sent'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Email Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your Store Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply-To Address
                    </label>
                    <input
                      type="email"
                      value={emailSettings.replyToAddress}
                      onChange={(e) => setEmailSettings({ ...emailSettings, replyToAddress: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="noreply@yourstore.com"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="587"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="•••••••••"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={emailSettings.smtpSecure}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpSecure: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Use secure connection (TLS)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveEmailSettings}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Settings className="w-5 h-5" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;