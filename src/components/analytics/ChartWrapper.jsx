import React from 'react';

const ChartWrapper = ({ title, children, loading = false, error = null, className = '' }) => {
  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md shadow rounded-lg p-6 border border-white/20 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartWrapper;