import React, { useState } from 'react';
import { Clock, User, Mail, MessageSquare, X } from 'lucide-react';

const RecentSubmissionsList = ({ items }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const truncateMessage = (message, length = 100) => {
    return message.length > length ? message.substring(0, length) + '...' : message;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Contact Submissions
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items && items.length > 0 ? (
            items.map((submission) => (
              <div
                key={submission._id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {submission.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {submission.email}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {submission.subject}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {truncateMessage(submission.message)}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent submissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for full submission details */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Submission Details
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.subject}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Submitted At
                </label>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedSubmission.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentSubmissionsList;