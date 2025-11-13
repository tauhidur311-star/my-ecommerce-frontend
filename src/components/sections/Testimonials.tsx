import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface TestimonialsProps {
  settings?: {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    cardBackgroundColor?: string;
    accentColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'grid' | 'carousel' | 'single';
    showRating?: boolean;
    showImages?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
    testimonialsPerPage?: number;
  };
  styles?: {
    container?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    testimonialCard?: string;
    avatar?: string;
    quote?: string;
    author?: string;
    rating?: string;
    navigation?: string;
  };
  testimonials?: Array<{
    id: string;
    name: string;
    role?: string;
    company?: string;
    content: string;
    rating?: number;
    avatar?: string;
  }>;
  isEditing?: boolean;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  settings = {},
  styles = {},
  testimonials = [],
  isEditing = false
}) => {
  const {
    title = 'What Our Customers Say',
    subtitle = 'Don\'t just take our word for it',
    backgroundColor = '#F9FAFB',
    textColor = '#1F2937',
    cardBackgroundColor = '#FFFFFF',
    accentColor = '#3B82F6',
    padding = '4rem 1rem',
    margin = '0',
    layout = 'grid',
    showRating = true,
    showImages = true,
    autoplay = false,
    autoplayInterval = 5000,
    testimonialsPerPage = 3
  } = settings;

  const mockTestimonials = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'Absolutely fantastic service! The products exceeded my expectations and the customer support was outstanding. Highly recommend to anyone looking for quality.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Small Business Owner',
      company: 'Local Cafe',
      content: 'Great value for money and excellent quality. The ordering process was smooth and delivery was faster than expected. Will definitely order again!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Designer',
      company: 'Creative Studio',
      content: 'The attention to detail is impressive. Every product feels premium and well-crafted. Customer service team is also very helpful and responsive.',
      rating: 4,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'David Wilson',
      role: 'Product Manager',
      company: 'Innovation Labs',
      content: 'Outstanding experience from start to finish. The product quality is top-notch and the pricing is very competitive. Exceeded all expectations.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : mockTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoplay || layout !== 'carousel') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        (prev + testimonialsPerPage) >= displayTestimonials.length ? 0 : prev + testimonialsPerPage
      );
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, layout, displayTestimonials.length, testimonialsPerPage]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const renderTestimonial = (testimonial: any, index: number) => (
    <div
      key={testimonial.id || index}
      className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${styles.testimonialCard || ''}`}
      style={{ backgroundColor: cardBackgroundColor }}
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote 
          className="w-8 h-8 opacity-20" 
          style={{ color: accentColor }}
        />
      </div>

      {/* Rating */}
      {showRating && testimonial.rating && (
        <div className={`flex items-center mb-4 ${styles.rating || ''}`}>
          {renderStars(testimonial.rating)}
        </div>
      )}

      {/* Content */}
      <blockquote className={`text-lg leading-relaxed mb-6 ${styles.quote || ''}`}>
        "{testimonial.content}"
      </blockquote>

      {/* Author */}
      <div className={`flex items-center ${styles.author || ''}`}>
        {showImages && (
          <div className={`mr-4 ${styles.avatar || ''}`}>
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor + '20' }}
              >
                <User 
                  className="w-6 h-6" 
                  style={{ color: accentColor }}
                />
              </div>
            )}
          </div>
        )}
        
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm opacity-60">
            {testimonial.role}
            {testimonial.company && (
              <span> at {testimonial.company}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      (prev + testimonialsPerPage) >= displayTestimonials.length ? 0 : prev + testimonialsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, displayTestimonials.length - testimonialsPerPage) : prev - testimonialsPerPage
    );
  };

  const getVisibleTestimonials = () => {
    if (layout === 'single') {
      return [displayTestimonials[currentIndex % displayTestimonials.length]];
    }
    if (layout === 'carousel') {
      return displayTestimonials.slice(currentIndex, currentIndex + testimonialsPerPage);
    }
    return displayTestimonials;
  };

  if (layout === 'single') {
    const currentTestimonial = displayTestimonials[currentIndex % displayTestimonials.length];

    return (
      <section
        className={`${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding,
          margin
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className={`${styles.content || ''}`}>
            {/* Header */}
            <div className="mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
                {title}
              </h2>
              {subtitle && (
                <p className={`text-lg opacity-80 ${styles.subtitle || ''}`}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Single Testimonial */}
            <div className="relative">
              {renderTestimonial(currentTestimonial, currentIndex)}

              {/* Navigation */}
              {displayTestimonials.length > 1 && (
                <div className={`flex items-center justify-center space-x-4 mt-8 ${styles.navigation || ''}`}>
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    style={{ color: accentColor }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="flex space-x-2">
                    {displayTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentIndex % displayTestimonials.length
                            ? 'w-8' 
                            : 'opacity-50'
                        }`}
                        style={{ backgroundColor: accentColor }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    style={{ color: accentColor }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.container || ''}`}
      style={{
        backgroundColor,
        color: textColor,
        padding,
        margin
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`${styles.content || ''}`}>
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-lg opacity-80 max-w-2xl mx-auto ${styles.subtitle || ''}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Testimonials */}
          <div className="relative">
            <div className={`grid ${
              layout === 'grid' 
                ? `md:grid-cols-2 lg:grid-cols-${Math.min(testimonialsPerPage, 3)}` 
                : `md:grid-cols-2 lg:grid-cols-${testimonialsPerPage}`
            } gap-8`}>
              {getVisibleTestimonials().map((testimonial, index) => 
                renderTestimonial(testimonial, index)
              )}
            </div>

            {/* Carousel Navigation */}
            {layout === 'carousel' && displayTestimonials.length > testimonialsPerPage && (
              <div className={`flex items-center justify-center space-x-4 mt-8 ${styles.navigation || ''}`}>
                <button
                  onClick={prevSlide}
                  className="p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: cardBackgroundColor, color: accentColor }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.ceil(displayTestimonials.length / testimonialsPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * testimonialsPerPage)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        Math.floor(currentIndex / testimonialsPerPage) === index
                          ? 'w-8' 
                          : 'opacity-50'
                      }`}
                      style={{ backgroundColor: accentColor }}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: cardBackgroundColor, color: accentColor }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* No testimonials message */}
          {displayTestimonials.length === 0 && !isEditing && (
            <div className="text-center py-12">
              <p className="text-lg opacity-60">No testimonials available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;