import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Mail, Phone, Calendar, User, MapPin,
  Search, Filter, Eye, Trash2, Star, Archive, RefreshCw,
  Download, CheckCircle, AlertCircle, Clock, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0
  });

  const { user } = useAuth();

  // Mock data for demonstration - replace with real API call
  const mockSubmissions = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-234-567-8900',
      subject: 'Product Inquiry',
      message: 'Hi, I am interested in your latest iPhone models. Could you please provide more details about pricing and availability?',
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-234-567-8901',
      subject: 'Order Support',
      message: 'I need help with my recent order #12345. The delivery was delayed and I haven\'t received any updates.',
      status: 'in-progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '',
      subject: 'Technical Issue',
      message: 'I am experiencing issues with the checkout process. The payment gateway keeps failing when I try to complete my purchase.',
      status: 'resolved',
      priority: 'high',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1-234-567-8902',
      subject: 'Return Request',
      message: 'I would like to return my recent purchase. The product doesn\'t match the description on your website.',
      status: 'new',
      priority: 'low',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    }
  ];

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, statusFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // Replace with real API call
      // const response = await api.get('/admin/contacts');
      // setSubmissions(response.data);
      
      // Using mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissions(mockSubmissions);
      
      // Calculate stats
      const newStats = {
        total: mockSubmissions.length,
        new: mockSubmissions.filter(s => s.status === 'new').length,
        inProgress: mockSubmissions.filter(s => s.status === 'in-progress').length,
        resolved: mockSubmissions.filter(s => s.status === 'resolved').length,
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error loading contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(submission =>
        submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const updateSubmissionStatus = async (id, newStatus) => {
    try {
      // Replace with real API call
      // await api.patch(`/admin/contacts/${id}/status`, { status: newStatus });
      
      setSubmissions(prev => 
        prev.map(submission => 
          submission._id === id 
            ? { ...submission, status: newStatus, updatedAt: new Date().toISOString() }
            : submission
        )
      );

      // Update stats
      const updatedSubmissions = submissions.map(submission => 
        submission._id === id 
          ? { ...submission, status: newStatus }
          : submission
      );
      
      const newStats = {
        total: updatedSubmissions.length,
        new: updatedSubmissions.filter(s => s.status === 'new').length,
        inProgress: updatedSubmissions.filter(s => s.status === 'in-progress').length,
        resolved: updatedSubmissions.filter(s => s.status === 'resolved').length,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const deleteSubmission = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        // Replace with real API call
        // await api.delete(`/admin/contacts/${id}`);
        
        setSubmissions(prev => prev.filter(submission => submission._id !== id));
      } catch (error) {
        console.error('Error deleting submission:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const SubmissionModal = ({ submission, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Contact Submission Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{submission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{submission.email}</p>
              </div>
            </div>

            {submission.phone && (
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{submission.phone}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <p className="text-gray-900">{submission.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <p className="text-gray-900 whitespace-pre-wrap">{submission.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(submission.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                    {submission.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getPriorityColor(submission.priority)}`}>
                  {submission.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{new Date(submission.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <select
                value={submission.status}
                onChange={(e) => updateSubmissionStatus(submission._id, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${submission.email}?subject=Re: ${submission.subject}`)}
              >
                <Mail size={16} />
                Reply
              </EnhancedButton>

              <EnhancedButton
                variant="danger"
                size="sm"
                onClick={() => deleteSubmission(submission._id)}
              >
                <Trash2 size={16} />
                Delete
              </EnhancedButton>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={loadSubmissions}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>

          <EnhancedButton
            variant="outline"
            size="sm"
          >
            <Download size={16} />
            Export
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Submissions"
          value={stats.total}
          icon={MessageCircle}
          color="blue"
          delay={0}
        />
        <StatCard
          title="New"
          value={stats.new}
          icon={AlertCircle}
          color="orange"
          delay={0.1}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="yellow"
          delay={0.2}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="green"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </GlassCard>

      {/* Submissions List */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <motion.tr
                  key={submission._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{submission.name}</div>
                      <div className="text-sm text-gray-600">{submission.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs truncate" title={submission.subject}>
                      {submission.subject}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority)}`}>
                      {submission.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowModal(true);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        onClick={() => window.open(`mailto:${submission.email}?subject=Re: ${submission.subject}`)}
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Reply"
                      >
                        <Mail size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteSubmission(submission._id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Contact submissions will appear here when customers reach out.'
                }
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {showModal && selectedSubmission && (
          <SubmissionModal
            submission={selectedSubmission}
            onClose={() => {
              setShowModal(false);
              setSelectedSubmission(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactSubmissions;