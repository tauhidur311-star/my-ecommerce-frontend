import React from 'react';

export default function EnhancedProductSkeleton({ index = 0 }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden opacity-0 animate-fade-in-up"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 animate-shimmer relative">
        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-12 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
        
        {/* Heart Button Skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
        
        {/* Quick Add Button Skeleton */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="w-12 h-3 bg-gray-300 rounded animate-pulse"></div>
        </div>
        
        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        
        {/* Sizes */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-3 bg-gray-300 rounded animate-pulse"></div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-5 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid skeleton component for multiple loading cards
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <EnhancedProductSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// Filter skeleton component
export function FilterSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 animate-pulse">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {/* Search skeleton */}
        <div className="flex-1 min-w-[200px] h-10 bg-gray-200 rounded-lg"></div>
        
        {/* Sort skeleton */}
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
        
        {/* Filter button skeleton */}
        <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}