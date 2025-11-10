import React, { Suspense } from 'react';
import { Heart } from 'lucide-react';

const WishlistPage = React.lazy(() => import('../pages/WishlistPage'));

function WishlistPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-red-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Navigation Skeleton */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-pink-200 rounded animate-pulse"></div>
            <div>
              <div className="w-48 h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-pink-200 rounded-full flex items-center justify-center animate-pulse">
            <Heart size={32} className="text-pink-400" />
          </div>
          <div className="w-64 h-6 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-96 h-4 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
          <div className="w-32 h-10 bg-pink-200 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function LazyWishlistPage() {
  return (
    <Suspense fallback={<WishlistPageSkeleton />}>
      <WishlistPage />
    </Suspense>
  );
}