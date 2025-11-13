import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Send, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Eye,
  BarChart3,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import enhancedApiService from '../../services/enhancedApi';

const EmailCampaignList = ({ onCreateNew, onEditCampaign }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, [searchTerm, statusFilter, pagination.current]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await enhancedApiService.get(`/admin/email-campaigns?${params}`);
      if (response.success) {
        setCampaigns(response.data.campaigns);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load campaigns');
      console.error('Load campaigns error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await enhancedApiService.post(`/admin/email-campaigns/${campaignId}/send`);
      toast.success('Campaign sent successfully');
      loadCampaigns(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await enhancedApiService.delete(`/admin/email-campaigns/${campaignId}`);
      toast.success('Campaign deleted successfully');
      loadCampaigns(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete campaign');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      sending: { color: 'bg-yellow-100 text-yellow-800', text: 'Sending' },
      sent: { color: 'bg-green-100 text-green-800', text: 'Sent' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num) => {
    if (num === 0) return '0';
    return num?.toLocaleString() || '-';
  };

  const getOpenRate = (campaign) => {
    if (!campaign.analytics || campaign.analytics.totalSent === 0) return '0%';
    const rate = (campaign.analytics.totalOpened / campaign.analytics.totalSent) * 100;
    return `${rate.toFixed(1)}%`;
  };

  const CampaignActions = ({ campaign }) => (
    <div className="relative">
      <button
        onClick={() => setShowActions(showActions === campaign._id ? null : campaign._id)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {showActions === campaign._id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onEditCampaign(campaign);
                setShowActions(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Campaign
            </button>
            
            <button
              onClick={() => {
                // Open analytics view
                setShowActions(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </button>

            {campaign.status === 'draft' && (
              <button
                onClick={() => {
                  handleSendCampaign(campaign._id);
                  setShowActions(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </button>
            )}

            {campaign.status !== 'sending' && (
              <button
                onClick={() => {
                  handleDeleteCampaign(campaign._id);
                  setShowActions(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Campaign
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Campaigns
          </h2>
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No campaigns found</p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sent/Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {campaigns.map((campaign) => (
                <motion.tr
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {campaign.subject}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {campaign.recipientList?.length || 
                       (campaign.recipientFilter?.type === 'all' ? '1,250' : 
                        campaign.recipientFilter?.type === 'customers' ? '890' : 
                        campaign.recipientFilter?.type === 'subscribers' ? '340' : '0')}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {campaign.sentAt ? (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-1 text-green-500" />
                          {formatDate(campaign.sentAt)}
                        </div>
                      ) : campaign.scheduledAt ? (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-500" />
                          {formatDate(campaign.scheduledAt)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getOpenRate(campaign)}
                      </div>
                      {campaign.analytics?.totalSent > 0 && (
                        <div className="ml-2">
                          <div className="text-xs text-gray-500">
                            ({formatNumber(campaign.analytics.totalOpened)}/{formatNumber(campaign.analytics.totalSent)})
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CampaignActions campaign={campaign} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {campaigns.length > 0 && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
              {pagination.total} campaigns
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-blue-500 text-white rounded">
                {pagination.current}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(null)}
        />
      )}
    </div>
  );
};

export default EmailCampaignList;