import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Plus, Edit, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import enhancedApiService from '../../services/enhancedApi';
import toast from 'react-hot-toast';

const TestimonialsSection = ({ settings, onOpenAssetPicker, isEditing = false, onUpdateSection }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    reviewText: '',
    rating: 5,
    avatarUrl: '',
    customerEmail: ''
  });

  const defaultSettings = {
    title: 'What Our Customers Say',
    subtitle: '',
    layout: 'carousel',
    showAvatars: true,
    showRatings: true,
    autoplay: true,
    autoplayInterval: 5000,
    itemsPerView: 3,
    backgroundColor: '#f8f9fa'
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (mergedSettings.autoplay && testimonials.length > mergedSettings.itemsPerView) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.max(1, testimonials.length - mergedSettings.itemsPerView + 1));
      }, mergedSettings.autoplayInterval);

      return () => clearInterval(interval);
    }
  }, [testimonials, mergedSettings.autoplay, mergedSettings.autoplayInterval, mergedSettings.itemsPerView]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await enhancedApiService.get('/testimonials/active?limit=20');
      if (response.success) {
        setTestimonials(response.data || []);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.reviewText) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const endpoint = editingTestimonial 
        ? `/admin/testimonials/${editingTestimonial._id}`
        : '/admin/testimonials';
      
      const method = editingTestimonial ? 'put' : 'post';
      
      const response = await enhancedApiService[method](endpoint, formData);
      
      if (response.success) {
        toast.success(editingTestimonial ? 'Testimonial updated!' : 'Testimonial added!');
        await loadTestimonials();
        handleCloseModal();
      }
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customerName: testimonial.customerName,
      reviewText: testimonial.reviewText,
      rating: testimonial.rating,
      avatarUrl: testimonial.avatarUrl || '',
      customerEmail: testimonial.customerEmail || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await enhancedApiService.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted!');
      await loadTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({
      customerName: '',
      reviewText: '',
      rating: 5,
      avatarUrl: '',
      customerEmail: ''
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.max(1, testimonials.length - mergedSettings.itemsPerView + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? Math.max(0, testimonials.length - mergedSettings.itemsPerView) : prev - 1);
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section 
      className="py-16 relative"
      style={{ backgroundColor: mergedSettings.backgroundColor }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {mergedSettings.title}
          </h2>
          {mergedSettings.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {mergedSettings.subtitle}
            </p>
          )}
          
          {isEditing && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </button>
          )}
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No testimonials yet</p>
            {isEditing && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Your First Testimonial
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Testimonials Grid/Carousel */}
            <div className="overflow-hidden">
              <motion.div
                className={`flex transition-transform duration-500 ease-in-out ${
                  mergedSettings.layout === 'grid' ? 'flex-wrap' : ''
                }`}
                style={{
                  transform: mergedSettings.layout === 'carousel' 
                    ? `translateX(-${currentSlide * (100 / mergedSettings.itemsPerView)}%)` 
                    : 'none'
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial._id}
                    className={`${
                      mergedSettings.layout === 'carousel'
                        ? `flex-shrink-0 w-1/${mergedSettings.itemsPerView}`
                        : `w-full md:w-1/2 lg:w-1/3`
                    } px-4 mb-8`}
                    style={{ 
                      width: mergedSettings.layout === 'carousel' 
                        ? `${100 / mergedSettings.itemsPerView}%` 
                        : undefined 
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-lg p-6 h-full relative group"
                    >
                      {isEditing && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(testimonial)}
                            className="p-1 bg-blue-500 text-white rounded mr-1 hover:bg-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial._id)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Customer Info */}
                      <div className="flex items-center mb-4">
                        {mergedSettings.showAvatars && (
                          <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                            {testimonial.avatarUrl ? (
                              <img
                                src={testimonial.avatarUrl}
                                alt={testimonial.customerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                {testimonial.customerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {testimonial.customerName}
                          </h4>
                          {mergedSettings.showRatings && (
                            <div className="flex items-center mt-1">
                              {renderStars(testimonial.rating)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-600 italic">
                        "{testimonial.reviewText}"
                      </p>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            {mergedSettings.layout === 'carousel' && testimonials.length > mergedSettings.itemsPerView && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Testimonial Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Text *
                  </label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {onOpenAssetPicker && (
                      <button
                        type="button"
                        onClick={() => onOpenAssetPicker((asset) => {
                          setFormData(prev => ({ ...prev, avatarUrl: asset.url }));
                        })}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Browse
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TestimonialsSection;