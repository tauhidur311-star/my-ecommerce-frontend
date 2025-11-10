import React from 'react';
import { Loader2, Package, BarChart3, Users, ShoppingCart } from 'lucide-react';

// Spinner Component
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
    />
  );
};

// Button Loading State
export const LoadingButton = ({ 
  loading = false, 
  children, 
  className = '',
  disabled = false,
  loadingText = 'Loading...',
  ...props 
}) => {
  return (
    <button
      className={`relative ${className} ${loading ? 'cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

// Card Loading Skeleton
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-32"></div>
  </div>
);

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b bg-gray-50">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded animate-pulse ${
                    colIndex === 0 ? 'w-32' : 
                    colIndex === 1 ? 'w-24' : 
                    colIndex === 2 ? 'w-16' : 'w-20'
                  }`}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Product Card Loading Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Analytics Chart Loading Skeleton
export const ChartSkeleton = ({ height = 'h-64' }) => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className={`${height} bg-gray-100 rounded flex items-end justify-between px-4 pb-4`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-t w-8"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        ></div>
      ))}
    </div>
  </div>
);

// Full Page Loading Component
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
    <Spinner size="xl" color="blue" />
    <p className="mt-4 text-gray-600 text-lg">{message}</p>
  </div>
);

// Overlay Loading Component
export const OverlayLoader = ({ visible = false, message = 'Loading...' }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center min-w-[200px]">
        <Spinner size="lg" color="blue" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Section Loading Component with Icon
export const SectionLoader = ({ 
  icon: Icon = Package, 
  message = 'Loading data...',
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`}>
    <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <div className="flex items-center justify-center space-x-2">
      <Spinner size="sm" color="gray" />
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

// Dashboard Loading State
export const DashboardLoader = () => (
  <div className="space-y-8 p-6">
    {/* Header Skeleton */}
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Table Section */}
    <TableSkeleton rows={5} columns={6} />
  </div>
);

// Smart Loading Component that chooses appropriate loader
export const SmartLoader = ({ 
  type = 'spinner', 
  size = 'md',
  fullPage = false,
  overlay = false,
  ...props 
}) => {
  if (fullPage) {
    return <PageLoader {...props} />;
  }
  
  if (overlay) {
    return <OverlayLoader visible={true} {...props} />;
  }

  switch (type) {
    case 'dashboard':
      return <DashboardLoader />;
    case 'table':
      return <TableSkeleton {...props} />;
    case 'cards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: props.count || 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    case 'products':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: props.count || 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      );
    case 'section':
      return <SectionLoader {...props} />;
    default:
      return <Spinner size={size} {...props} />;
  }
};

export default {
  Spinner,
  LoadingButton,
  CardSkeleton,
  TableSkeleton,
  ProductCardSkeleton,
  ChartSkeleton,
  PageLoader,
  OverlayLoader,
  SectionLoader,
  DashboardLoader,
  SmartLoader
};