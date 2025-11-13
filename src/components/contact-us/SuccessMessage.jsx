import React from 'react';

const SuccessMessage = ({ message = 'Message sent successfully!' }) => {
  return (
    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-md mb-6 shadow-sm animate-fadeIn">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-green-600 text-xl mr-3">✅</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 mb-1">
            Success!
          </h3>
          <p className="text-sm text-green-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;