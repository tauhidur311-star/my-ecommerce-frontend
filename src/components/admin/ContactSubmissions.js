import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">{stats.total}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">{stats.today}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Today's Submissions</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.today}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📧</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Most Common</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.bySubject[0] ? getSubjectLabel(stats.bySubject[0]._id) : 'N/A'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Submissions Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Contact Submissions
          </h2>
          
          {/* Search Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Name</th>
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Email</th>
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Subject</th>
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Message</th>
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Status</th>
                <th className="uppercase text-xs tracking-wider pb-3 text-gray-500 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission._id}
                  onClick={() => openModal(submission)}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{submission.name}</span>
                      {submission.status === 'new' && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-gray-600">{submission.email}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {getSubjectLabel(submission.subject)}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-gray-600 max-w-xs">
                    {truncateMessage(submission.message)}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status || 'new'}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">
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
      </div>

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