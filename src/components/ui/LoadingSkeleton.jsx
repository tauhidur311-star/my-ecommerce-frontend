import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ 
  rows = 3, 
  className = '', 
  showAvatar = false,
  showChart = false,
  variant = 'default'
}) => {
  const skeletonVariants = {
    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const SkeletonRow = ({ height = 'h-4', width = 'w-full', delay = 0 }) => (
    <motion.div
      className={`${height} ${width} bg-gray-200 rounded-lg`}
      variants={skeletonVariants}
      animate="pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );

  const SkeletonAvatar = () => (
    <motion.div
      className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"
      variants={skeletonVariants}
      animate="pulse"
    />
  );

  const SkeletonChart = () => (
    <div className="space-y-3">
      <SkeletonRow height="h-6" width="w-1/3" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-end gap-2">
            <SkeletonRow 
              height={`h-${Math.floor(Math.random() * 8) + 4}`} 
              width="w-8" 
              delay={i * 100}
            />
            <SkeletonRow 
              height={`h-${Math.floor(Math.random() * 12) + 6}`} 
              width="w-8" 
              delay={i * 100 + 50}
            />
            <SkeletonRow 
              height={`h-${Math.floor(Math.random() * 10) + 4}`} 
              width="w-8" 
              delay={i * 100 + 100}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const AdminDashboardSkeleton = () => (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonRow height="h-8" width="w-64" />
          <SkeletonRow height="h-4" width="w-96" />
        </div>
        <div className="flex gap-3">
          <SkeletonRow height="h-10" width="w-24" />
          <SkeletonRow height="h-10" width="w-24" />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <SkeletonRow height="h-4" width="w-24" />
                <SkeletonRow height="h-8" width="w-16" />
                <SkeletonRow height="h-3" width="w-32" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <SkeletonChart />
        </motion.div>
        
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <SkeletonChart />
        </motion.div>
      </div>

      {/* Table Skeleton */}
      <motion.div
        className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="p-6 border-b border-gray-200">
          <SkeletonRow height="h-6" width="w-48" />
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 flex items-center gap-4">
              <SkeletonAvatar />
              <div className="flex-1 space-y-2">
                <SkeletonRow height="h-4" width="w-48" />
                <SkeletonRow height="h-3" width="w-32" />
              </div>
              <SkeletonRow height="h-8" width="w-24" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (variant === 'dashboard') {
    return <AdminDashboardSkeleton />;
  }

  if (showChart) {
    return (
      <div className={`space-y-4 ${className}`}>
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showAvatar && (
        <div className="flex items-center gap-4">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <SkeletonRow height="h-4" width="w-3/4" />
            <SkeletonRow height="h-3" width="w-1/2" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <SkeletonRow 
            key={i} 
            delay={i * 100}
            width={i === rows - 1 ? 'w-3/4' : 'w-full'}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;