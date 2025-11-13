import React from 'react';

const SummaryCard = ({ title, value, delta, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      delta: delta > 0 ? 'text-green-600' : 'text-red-600'
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-600',
      delta: delta > 0 ? 'text-green-600' : 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      delta: delta > 0 ? 'text-green-600' : 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-100',
      icon: 'text-orange-600',
      delta: delta > 0 ? 'text-green-600' : 'text-red-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white/10 backdrop-blur-md shadow rounded-lg p-4 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {delta !== undefined && delta !== null && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${colors.delta}`}>
                {delta > 0 ? '+' : ''}{delta}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs yesterday
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon size={24} className={colors.icon} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;