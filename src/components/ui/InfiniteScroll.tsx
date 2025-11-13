import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronUp } from 'lucide-react';

interface InfiniteScrollProps<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gridClassName?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  showBackToTop?: boolean;
  backToTopThreshold?: number;
  error?: string | null;
  onRetry?: () => void;
}

function InfiniteScroll<T extends { _id?: string; id?: string }>({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
  className = '',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
  loadingComponent,
  emptyComponent,
  threshold = 0.1,
  rootMargin = '100px',
  showBackToTop = true,
  backToTopThreshold = 1000,
  error,
  onRetry
}: InfiniteScrollProps<T>) {
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false
  });

  // Trigger load more when the sentinel comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !error) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore, error]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    if (!showBackToTop) return;

    const handleScroll = () => {
      setShowBackToTopButton(window.scrollY > backToTopThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showBackToTop, backToTopThreshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading more products...</span>
      </div>
    </div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg mb-2">No products found</div>
      <p className="text-gray-400">Try adjusting your search or filters</p>
    </div>
  );

  // Error component
  const errorComponent = (
    <div className="text-center py-8">
      <div className="text-red-500 text-lg mb-2">Error loading products</div>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );

  // Show empty state if no items and not loading
  if (items.length === 0 && !isLoading && !error) {
    return (
      <div className={className}>
        {emptyComponent || defaultEmptyComponent}
      </div>
    );
  }

  return (
    <div className={className} ref={containerRef}>
      {/* Items Grid */}
      <div className={gridClassName}>
        <AnimatePresence>
          {items.map((item, index) => {
            const key = item._id || item.id || index;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: Math.min(index * 0.05, 0.5) // Staggered animation
                }}
                layout
              >
                {renderItem(item, index)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {isLoading && (loadingComponent || defaultLoadingComponent)}

      {/* Error State */}
      {error && errorComponent}

      {/* Load More Sentinel */}
      {hasMore && !isLoading && !error && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {/* This element triggers the intersection observer */}
        </div>
      )}

      {/* End of Results Message */}
      {!hasMore && items.length > 0 && !isLoading && (
        <motion.div
          className="text-center py-8 border-t border-gray-200 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600">
            You've reached the end! Showing all {items.length} products.
          </p>
        </motion.div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <AnimatePresence>
          {showBackToTopButton && (
            <motion.button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default InfiniteScroll;