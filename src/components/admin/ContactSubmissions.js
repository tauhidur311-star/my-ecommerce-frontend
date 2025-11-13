import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import GlassCard, { StatsCard } from '../ui/GlassCard';
import FloatingWidget from '../ui/FloatingWidget';
import { MessageSquare, FileText, TrendingUp } from 'lucide-react';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, bySubject: [] });

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      const response = await apiService.request('/admin/contacts');
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.request('/contact/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contact stats:', error);
    }
  };

  const filterSubmissions = () => {
    if (!searchTerm.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const filtered = submissions.filter(submission =>
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubmissions(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (message, maxLength = 60) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const getSubjectLabel = (subject) => {
    const subjectMap = {
      general: 'General Inquiry',
      support: 'Technical Support',
      billing: 'Billing Question',
      partnership: 'Partnership',
      feedback: 'Feedback',
      other: 'Other'
    };
    return subjectMap[subject] || subject;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const markAsRead = async (submissionId) => {
    try {
      await apiService.request(`/admin/contacts/${submissionId}/mark-read`, {
        method: 'PATCH'
      });
      fetchSubmissions(); // Refresh data
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const openModal = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
    if (submission.status === 'new') {
      markAsRead(submission._id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mt-6 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced Header */}
      <GlassCard delay={0.1}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Contact Submissions</h2>
            <p className="text-white/80">Manage and respond to customer inquiries with real-time updates</p>
          </div>
          <div className="text-white/60">
            <MessageSquare size={32} />
          </div>
        </div>
      </GlassCard>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={<FileText className="w-6 h-6 text-white" />}
          title="Total Submissions"
          value={stats.total}
          delay={0.2}
        />
        
        <StatsCard
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Today's Submissions"
          value={stats.today}
          change={stats.today > 0 ? 12 : 0}
          delay={0.3}
        />
        
        <StatsCard
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          title="Most Common"
          value={stats.bySubject[0] ? getSubjectLabel(stats.bySubject[0]._id) : 'N/A'}
          delay={0.4}
        />
      </div>

      {/* Contact Submissions Table */}
      <GlassCard delay={0.5}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Contact Submissions
            </h2>
            <p className="text-white/70 text-sm">
              {filteredSubmissions.length} of {submissions.length} submissions shown
            </p>
          </div>
          
          {/* Enhanced Search Filter */}
          <div className="relative mt-4 sm:mt-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/40 sm:text-sm bg-white/10 backdrop-blur-sm transition-all duration-200 text-white placeholder-white/60"
              placeholder="Search by name or email..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-gray-50/50 backdrop-blur-sm">
              <tr className="border-b border-gray-200/50">
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Name</th>
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Email</th>
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Subject</th>
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Message</th>
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Status</th>
                <th className="uppercase text-xs tracking-wider py-4 px-6 text-gray-500 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <tr
                  key={submission._id}
                  onClick={() => openModal(submission)}
                  className="border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {submission.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <span className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{submission.name}</span>
                        {submission.status === 'new' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-gray-600 font-medium">{submission.email}</td>
                  <td className="py-5 px-6">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm">
                      {getSubjectLabel(submission.subject)}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-gray-600 max-w-xs">
                    <p className="truncate group-hover:text-gray-800 transition-colors">
                      {truncateMessage(submission.message)}
                    </p>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(submission.status)}`}>
                      {submission.status || 'new'}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-gray-500 font-medium">
                    {formatDate(submission.createdAt || submission.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No contact submissions found</div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Floating Help Widget */}
      <FloatingWidget
        icon={<MessageSquare className="w-5 h-5 text-white" />}
        label="Need Help?"
        onClick={() => window.open('/help', '_blank')}
        variant="primary"
      />

      {/* Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto border border-gray-100 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Submission Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-gray-900">{getSubjectLabel(selectedSubmission.subject)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                    <p className="text-gray-900">{formatDate(selectedSubmission.createdAt || selectedSubmission.timestamp)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${getSubjectLabel(selectedSubmission.subject)}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;