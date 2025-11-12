import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = ({ section, settings, isEditing }) => {
  const {
    title = 'What Our Customers Say',
    testimonials = [
      {
        name: 'John Doe',
        content: 'Amazing product and excellent service!',
        rating: 5,
        image: ''
      }
    ],
    backgroundColor = '#f9fafb'
  } = settings;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section 
      className="py-16 relative"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              {isEditing ? (
                <span className="border-b-2 border-dashed border-gray-400">
                  {title}
                </span>
              ) : (
                title
              )}
            </h2>
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
              {/* Rating */}
              <div className="mb-4">
                {renderStars(testimonial.rating || 5)}
              </div>

              {/* Content */}
              <blockquote className="text-gray-600 mb-6">
                "{isEditing ? (
                  <span className="border-b border-dashed border-gray-400 pb-1">
                    {testimonial.content}
                  </span>
                ) : (
                  testimonial.content
                )}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-gray-500 font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {isEditing ? (
                      <span className="border-b border-dashed border-gray-400 pb-1">
                        {testimonial.name}
                      </span>
                    ) : (
                      testimonial.name
                    )}
                  </div>
                  {testimonial.title && (
                    <div className="text-sm text-gray-500">{testimonial.title}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add more testimonial placeholder in editing mode */}
          {isEditing && testimonials.length < 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">+</span>
                </div>
                <p className="text-sm">Add Testimonial</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editing indicators */}
      {isEditing && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Testimonials Section
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;