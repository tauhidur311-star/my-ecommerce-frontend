import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Calendar, Users, TrendingUp, Eye, Click,
  PlayCircle, PauseCircle, Square, Edit3, Trash2, Plus,
  Target, BarChart3, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import EnhancedButton from '../ui/EnhancedButton';
import GlassModal from '../ui/glass/GlassModal';
import toast from 'react-hot-toast';

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    targetSegment: 'all',
    scheduledAt: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/admin/marketing/campaigns');
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/marketing/analytics');
      setAnalytics(response.data.analytics || {});
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/admin/marketing/campaigns', newCampaign);
      fetchCampaigns();
      setShowCreateModal(false);
      setNewCampaign({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        targetSegment: 'all',
        scheduledAt: '',
        status: 'draft'
      });
      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      await api.put(`/admin/marketing/campaigns/${campaignId}/${action}`);
      fetchCampaigns();
      toast.success(`Campaign ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} campaign`);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await api.delete(`/admin/marketing/campaigns/${campaignId}`);
      fetchCampaigns();
      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'draft': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircle size={16} />;
      case 'scheduled': return <Clock size={16} />;
      case 'paused': return <PauseCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'draft': return <Edit3 size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  );

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp 
                size={14} 
                className={change >= 0 ? 'text-green-500' : 'text-red-500'} 
              />
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const CampaignCard = ({ campaign, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h3>
          <p className="text-gray-600 text-sm">{campaign.subject}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
              {getStatusIcon(campaign.status)}
              {campaign.status}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users size={12} />
              {campaign.targetAudience} recipients
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {campaign.status === 'draft' && (
            <EnhancedButton
              variant="primary"
              size="sm"
              onClick={() => handleCampaignAction(campaign._id, 'start')}
            >
              <Send size={14} />
              Send
            </EnhancedButton>
          )}
          {campaign.status === 'active' && (
            <EnhancedButton
              variant="warning"
              size="sm"
              onClick={() => handleCampaignAction(campaign._id, 'pause')}
            >
              <PauseCircle size={14} />
              Pause
            </EnhancedButton>
          )}
          {campaign.status === 'paused' && (
            <EnhancedButton
              variant="success"
              size="sm"
              onClick={() => handleCampaignAction(campaign._id, 'resume')}
            >
              <PlayCircle size={14} />
              Resume
            </EnhancedButton>
          )}
          
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCampaign(campaign);
              setShowAnalyticsModal(true);
            }}
          >
            <BarChart3 size={14} />
            Analytics
          </EnhancedButton>
          
          <button
            onClick={() => handleDeleteCampaign(campaign._id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {campaign.analytics && (
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="font-semibold text-gray-900">{campaign.analytics.delivered || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Opened</p>
            <p className="font-semibold text-gray-900">{campaign.analytics.opened || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Clicked</p>
            <p className="font-semibold text-gray-900">{campaign.analytics.clicked || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">CTR</p>
            <p className="font-semibold text-gray-900">{campaign.analytics.ctr || 0}%</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Manager</h2>
          <p className="text-gray-600">Create and manage marketing campaigns</p>
        </div>
        
        <EnhancedButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Create Campaign
        </EnhancedButton>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={campaigns.length}
          icon={Mail}
          color="blue"
          delay={0.1}
        />
        <MetricCard
          title="Active Campaigns"
          value={campaigns.filter(c => c.status === 'active').length}
          icon={PlayCircle}
          color="green"
          delay={0.2}
        />
        <MetricCard
          title="Total Sent"
          value={analytics.totalSent?.toLocaleString() || 0}
          change={analytics.sentGrowth}
          icon={Send}
          color="purple"
          delay={0.3}
        />
        <MetricCard
          title="Avg Open Rate"
          value={`${analytics.avgOpenRate || 0}%`}
          change={analytics.openRateGrowth}
          icon={Eye}
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Performance Chart */}
      {analytics.chartData && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2} name="Opened" />
              <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" strokeWidth={2} name="Clicked" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200/50">
        {['all', 'active', 'draft', 'scheduled', 'paused', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredCampaigns.map((campaign, index) => (
            <CampaignCard key={campaign._id} campaign={campaign} index={index} />
          ))}
        </AnimatePresence>
        
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No campaigns found</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <GlassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Enter campaign name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">Email Campaign</option>
                <option value="sms">SMS Campaign</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={newCampaign.subject}
              onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={newCampaign.content}
              onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
              placeholder="Enter campaign content"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
              <select
                value={newCampaign.targetSegment}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetSegment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="vip">VIP Customers</option>
                <option value="premium">Premium Customers</option>
                <option value="loyal">Loyal Customers</option>
                <option value="regular">Regular Customers</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
              <input
                type="datetime-local"
                value={newCampaign.scheduledAt}
                onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <EnhancedButton
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              variant="outline"
              onClick={() => {
                setNewCampaign({ ...newCampaign, status: 'draft' });
                handleCreateCampaign();
              }}
            >
              Save as Draft
            </EnhancedButton>
            <EnhancedButton
              variant="primary"
              onClick={() => {
                setNewCampaign({ ...newCampaign, status: 'active' });
                handleCreateCampaign();
              }}
            >
              Create & Send
            </EnhancedButton>
          </div>
        </div>
      </GlassModal>

      {/* Campaign Analytics Modal */}
      <GlassModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title={`Campaign Analytics - ${selectedCampaign?.name}`}
        size="xl"
      >
        {selectedCampaign && (
          <div className="space-y-6">
            {/* Analytics metrics would go here */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Delivered"
                value={selectedCampaign.analytics?.delivered || 0}
                icon={Send}
                color="blue"
              />
              <MetricCard
                title="Opened"
                value={selectedCampaign.analytics?.opened || 0}
                icon={Eye}
                color="green"
              />
              <MetricCard
                title="Clicked"
                value={selectedCampaign.analytics?.clicked || 0}
                icon={Click}
                color="purple"
              />
              <MetricCard
                title="CTR"
                value={`${selectedCampaign.analytics?.ctr || 0}%`}
                icon={Target}
                color="orange"
              />
            </div>
            
            {/* Additional analytics charts and data would be here */}
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default CampaignManager;