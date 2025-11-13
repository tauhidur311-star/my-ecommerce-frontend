import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageCircle, User, Calendar, Filter, Search,
  CheckCircle, XCircle, Eye, RefreshCw, AlertTriangle,
  ThumbsUp, ThumbsDown, Flag, Image, ExternalLink
} from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';
import EnhancedButton from '../ui/EnhancedButton';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0
  });

  // API functions
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (data.success) {
        const reviewsData = data.data || [];
        setReviews(reviewsData);
        calculateStats(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use mock data on error for demo
      const mockReviews = generateMockReviews();
      setReviews(mockReviews);
      calculateStats(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = () => [
    {
      _id: '1',
      product: {
        _id: 'p1',
        name: 'iPhone 15 Pro',
        images: ['/api/placeholder/100/100']
      },
      user: {
        _id: 'u1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      rating: 5,
      comment: 'Excellent product! The camera quality is outstanding and the performance is top-notch. Highly recommended for anyone looking for a premium smartphone experience.',
      status: 'approved',
      isVerifiedPurchase: true,
      helpfulVotes: 12,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      product: {
        _id: 'p2',
        name: 'MacBook Pro',
        images: ['/api/placeholder/100/100']
      },
      user: {
        _id: 'u2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      rating: 4,
      comment: 'Great laptop for development work. The M3 chip is incredibly fast. Only minor issue is the price point, but the performance justifies it.',
      status: 'pending',
      isVerifiedPurchase: true,
      helpfulVotes: 8,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      product: {
        _id: 'p3',
        name: 'AirPods Pro',
        images: ['/api/placeholder/100/100']
      },
      user: {
        _id: 'u3',
        name: 'Mike Johnson',
        email: 'mike@example.com'
      },
      rating: 2,
      comment: 'Not satisfied with the noise cancellation. Expected better quality for this price range. The sound quality is decent but not exceptional.',
      status: 'pending',
      isVerifiedPurchase: false,
      helpfulVotes: 3,
      flagged: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '4',
      product: {
        _id: 'p4',
        name: 'iPad Air',
        images: ['/api/placeholder/100/100']
      },
      user: {
        _id: 'u4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com'
      },
      rating: 5,
      comment: 'Perfect for digital art and note-taking. The Apple Pencil integration is seamless. Battery life is excellent and the display is gorgeous.',
      status: 'approved',
      isVerifiedPurchase: true,
      helpfulVotes: 15,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '5',
      product: {
        _id: 'p5',
        name: 'Apple Watch',
        images: ['/api/placeholder/100/100']
      },
      user: {
        _id: 'u5',
        name: 'David Brown',
        email: 'david@example.com'
      },
      rating: 1,
      comment: 'Poor quality. Stopped working after a week. Customer service was unhelpful. Would not recommend.',
      status: 'rejected',
      isVerifiedPurchase: false,
      helpfulVotes: 1,
      flagged: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const calculateStats = (reviewsData) => {
    const stats = {
      total: reviewsData.length,
      pending: reviewsData.filter(r => r.status === 'pending').length,
      approved: reviewsData.filter(r => r.status === 'approved').length,
      rejected: reviewsData.filter(r => r.status === 'rejected').length,
      avgRating: reviewsData.length > 0 
        ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
        : 0
    };
    setStats(stats);
  };

  const moderateReview = async (reviewId, action, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/admin/${reviewId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to moderate review');
      }

      // Update local state
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
          : review
      ));

      if (selectedReview && selectedReview._id === reviewId) {
        setSelectedReview(prev => ({ 
          ...prev, 
          status: action === 'approve' ? 'approved' : 'rejected' 
        }));
      }

      return true;
    } catch (error) {
      console.error('Error moderating review:', error);
      // Mock update for demo
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
          : review
      ));
      return true;
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove from local state
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      setShowReviewModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      // Mock delete for demo
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      setShowReviewModal(false);
      setSelectedReview(null);
    }
  };

  // Filter reviews
  useEffect(() => {
    let filtered = reviews;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const StarRating = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <img
            src={review.product.images?.[0] || '/api/placeholder/60/60'}
            alt={review.product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{review.product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-600">by {review.user.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                review.status === 'approved' ? 'bg-green-100 text-green-800' :
                review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {review.status.toUpperCase()}
              </span>
              {review.isVerifiedPurchase && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Verified Purchase
                </span>
              )}
              {review.flagged && (
                <Flag size={14} className="text-red-500" />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedReview(review);
              setShowReviewModal(true);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 line-clamp-3">{review.comment}</p>
      </div>

      {/* Review Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} />
            {review.helpfulVotes} helpful
          </span>
        </div>
        
        {review.status === 'pending' && (
          <div className="flex gap-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => moderateReview(review._id, 'reject')}
            >
              <XCircle size={14} />
              Reject
            </EnhancedButton>
            <EnhancedButton
              variant="primary"
              size="sm"
              onClick={() => moderateReview(review._id, 'approve')}
            >
              <CheckCircle size={14} />
              Approve
            </EnhancedButton>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Product & Rating */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={selectedReview.product.images?.[0] || '/api/placeholder/80/80'}
                      alt={selectedReview.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedReview.product.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <StarRating rating={selectedReview.rating} size={20} />
                        <span className="text-lg font-medium">{selectedReview.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="text-gray-700">{selectedReview.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-gray-500" />
                        <span className="text-gray-700">{selectedReview.user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Review Comment</h4>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.comment}</p>
                    </div>
                  </div>

                  {/* Review Metadata */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Review Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedReview.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Verified Purchase:</span>
                        <span className="ml-2">{selectedReview.isVerifiedPurchase ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Helpful Votes:</span>
                        <span className="ml-2">{selectedReview.helpfulVotes}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Flagged:</span>
                        <span className="ml-2">{selectedReview.flagged ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2">{new Date(selectedReview.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-2">{new Date(selectedReview.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t">
                    {selectedReview.status === 'pending' && (
                      <>
                        <EnhancedButton
                          variant="primary"
                          onClick={() => {
                            moderateReview(selectedReview._id, 'approve');
                          }}
                        >
                          <CheckCircle size={16} />
                          Approve Review
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          onClick={() => {
                            moderateReview(selectedReview._id, 'reject');
                          }}
                        >
                          <XCircle size={16} />
                          Reject Review
                        </EnhancedButton>
                      </>
                    )}
                    
                    <EnhancedButton
                      variant="outline"
                      onClick={() => deleteReview(selectedReview._id)}
                    >
                      <XCircle size={16} />
                      Delete Review
                    </EnhancedButton>

                    <EnhancedButton
                      variant="outline"
                      onClick={() => window.open(`/products/${selectedReview.product._id}`, '_blank')}
                    >
                      <ExternalLink size={16} />
                      View Product
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-gray-600">Moderate and manage customer product reviews</p>
        </div>
        <div className="flex gap-3">
          <EnhancedButton variant="outline" onClick={fetchReviews} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Reviews"
          value={stats.total}
          icon={MessageCircle}
          color="blue"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Avg Rating"
          value={stats.avgRating}
          icon={Star}
          color="purple"
          subtitle="out of 5 stars"
        />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </GlassCard>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading reviews...</p>
        </div>
      ) : (
        <>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {reviews.length === 0 
                  ? "No reviews have been submitted yet." 
                  : "No reviews match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredReviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Details Modal */}
      <ReviewModal />
    </div>
  );
};

export default ReviewsManagement;