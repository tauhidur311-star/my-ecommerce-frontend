import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong. Please try again.' }) => {
  return (
    <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-md mb-6 shadow-sm animate-fadeIn">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-red-600 text-xl mr-3">❌</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Error
          </h3>
          <p className="text-sm text-red-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;