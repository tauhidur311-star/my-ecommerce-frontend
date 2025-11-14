import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const ProductReviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterRating, setFilterRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [productId, sortBy, filterRating, verifiedOnly]);

  // Check if user can review
  useEffect(() => {
    if (user && productId) {
      checkCanReview();
    }
  }, [user, productId]);

  const loadReviews = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        sortBy,
        sortOrder: 'desc'
      });

      if (filterRating) params.append('rating', filterRating);
      if (verifiedOnly) params.append('verifiedOnly', 'true');

      const response = await api.getProductReviews(productId, params.toString());
      
      if (response.success) {
        const newReviews = append ? [...reviews, ...response.data.reviews] : response.data.reviews;
        setReviews(newReviews);
        setStatistics(response.data.statistics);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await api.checkCanReview(productId);
      setCanReview(response.data);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleLoadMore = () => {
    loadReviews(page + 1, true);
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const response = await api.voteOnReview(reviewId, voteType);
      if (response.success) {
        // Update the review in the state
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? {
                  ...review,
                  helpfulVotes: response.data.helpfulVotes,
                  unhelpfulVotes: response.data.unhelpfulVotes
                }
              : review
          )
        );
        toast.success('Vote recorded!');
      }
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Failed to record vote');
    }
  };

  const handleReport = async (reviewId, reason, details) => {
    if (!user) {
      toast.error('Please login to report');
      return;
    }

    try {
      const response = await api.reportReview(reviewId, { reason, details });
      if (response.success) {
        toast.success('Review reported successfully');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBreakdown = () => {
    if (!statistics || !statistics.ratingBreakdown) return null;

    const total = statistics.totalReviews;
    if (total === 0) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {statistics.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(statistics.averageRating), 'w-6 h-6')}
            <div className="text-gray-600 mt-2">
              Based on {total} review{total !== 1 ? 's' : ''}
            </div>
            {statistics.verifiedPurchases > 0 && (
              <div className="text-sm text-green-600 mt-1">
                {statistics.verifiedPurchases} verified purchase{statistics.verifiedPurchases !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = statistics.ratingBreakdown[rating] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderReviewActions = (review) => (
    <div className="flex items-center space-x-4 mt-4">
      {/* Helpfulness Voting */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Helpful?</span>
        <button
          onClick={() => handleVote(review._id, 'helpful')}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">{review.helpfulVotes || 0}</span>
        </button>
        <button
          onClick={() => handleVote(review._id, 'unhelpful')}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-sm">{review.unhelpfulVotes || 0}</span>
        </button>
      </div>

      {/* Report Button */}
      {user && user.id !== review.userId._id && (
        <button
          onClick={() => {
            const reason = prompt('Why are you reporting this review?');
            if (reason) {
              handleReport(review._id, 'other', reason);
            }
          }}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
        >
          <Flag className="w-4 h-4" />
          <span className="text-sm">Report</span>
        </button>
      )}
    </div>
  );

  const renderReview = (review) => {
    const isExpanded = expandedReviews.has(review._id);
    const shouldTruncate = review.comment.length > 300;

    return (
      <div key={review._id} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {review.userId.avatar ? (
                <img
                  src={review.userId.avatar}
                  alt={review.userId.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {review.userId.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{review.userId.name}</span>
                {review.verifiedPurchase && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">{review.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
          <div className="text-gray-700">
            {shouldTruncate && !isExpanded ? (
              <>
                {review.comment.substring(0, 300)}...
                <button
                  onClick={() => toggleExpanded(review._id)}
                  className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
                >
                  Read more
                </button>
              </>
            ) : (
              <>
                {review.comment}
                {shouldTruncate && isExpanded && (
                  <button
                    onClick={() => toggleExpanded(review._id)}
                    className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
                  >
                    Read less
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex space-x-2 mb-4">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.alt || `Review image ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        {/* Review Aspects */}
        {review.aspects && Object.keys(review.aspects).length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(review.aspects).map(([aspect, rating]) => (
                <div key={aspect} className="text-center">
                  <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                    {aspect}
                  </div>
                  {renderStars(rating, 'w-3 h-3')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Actions */}
        {renderReviewActions(review)}

        {/* Review Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-gray-200">
            {review.replies.map((reply, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">
                    {reply.userId.name}
                  </span>
                  {reply.userType === 'admin' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{reply.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Rating Summary */}
      {renderRatingBreakdown()}

      {/* Write Review Button */}
      {user && canReview && (
        <div className="mb-6">
          {canReview.canReview ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write a Review
            </button>
          ) : (
            <p className="text-gray-600">
              {canReview.reason === 'already_reviewed' 
                ? 'You have already reviewed this product' 
                : 'You can only review products you have purchased'}
            </p>
          )}
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="createdAt">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Rating:</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded"
          />
          <span>Verified purchases only</span>
        </label>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading && page === 1 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map(renderReview)}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          canReview={canReview}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            loadReviews(1); // Reload reviews
            checkCanReview(); // Update review eligibility
          }}
        />
      )}
    </div>
  );
};

// Review Form Component
const ReviewForm = ({ productId, canReview, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    aspects: {
      quality: 0,
      value: 0,
      design: 0,
      comfort: 0,
      sizing: 0
    },
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating || !formData.title || !formData.comment) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createReview({
        productId,
        ...formData
      });

      if (response.success) {
        toast.success(response.message);
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (current, onChange, label) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= current
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            {renderStarRating(
              formData.rating,
              (rating) => setFormData(prev => ({ ...prev, rating })),
              'Overall Rating *'
            )}

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your review"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Aspect Ratings */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Rate Specific Aspects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.aspects).map(([aspect, rating]) => (
                  <div key={aspect}>
                    {renderStarRating(
                      rating,
                      (newRating) => setFormData(prev => ({
                        ...prev,
                        aspects: { ...prev.aspects, [aspect]: newRating }
                      })),
                      aspect.charAt(0).toUpperCase() + aspect.slice(1)
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;