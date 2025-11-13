import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Gift, 
  Star, 
  Check,
  ArrowRight,
  Clock,
  Percent,
  Heart,
  Shield
} from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string, preferences?: any) => Promise<boolean>;
  className?: string;
  type?: 'newsletter' | 'exit-intent' | 'discount' | 'welcome';
  title?: string;
  subtitle?: string;
  offer?: {
    discount: number;
    code: string;
    expiresIn?: number; // minutes
  };
  design?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    image?: string;
  };
  trigger?: {
    exitIntent?: boolean;
    timeDelay?: number; // seconds
    scrollPercent?: number;
    pageViews?: number;
  };
  preferences?: {
    categories: string[];
    frequency: string[];
  };
}

interface ExitIntentDetectorProps {
  onExitIntent: () => void;
  enabled: boolean;
  sensitivity?: number;
}

const ExitIntentDetector: React.FC<ExitIntentDetectorProps> = ({ 
  onExitIntent, 
  enabled, 
  sensitivity = 50 
}) => {
  useEffect(() => {
    if (!enabled) return;

    let hasTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;
      
      // Check if mouse is leaving from the top of the page
      if (e.clientY <= sensitivity) {
        hasTriggered = true;
        onExitIntent();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasTriggered) return;
      hasTriggered = true;
      onExitIntent();
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onExitIntent, enabled, sensitivity]);

  return null;
};

const NewsletterModal: React.FC<NewsletterModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  className = '',
  type = 'newsletter',
  title,
  subtitle,
  offer,
  design = {},
  trigger = {},
  preferences
}) => {
  const [email, setEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(offer?.expiresIn ? offer.expiresIn * 60 : 0);
  const [showExitIntent, setShowExitIntent] = useState(false);

  // Timer countdown for offers
  useEffect(() => {
    if (!offer?.expiresIn || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [offer?.expiresIn, timeLeft]);

  // Exit intent detection
  const handleExitIntent = useCallback(() => {
    if (type === 'exit-intent' && !showExitIntent) {
      setShowExitIntent(true);
    }
  }, [type, showExitIntent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const preferences = {
        categories: selectedCategories,
        frequency: selectedFrequency
      };

      const success = await onSubscribe(email, preferences);
      
      if (success) {
        setIsSuccess(true);
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setEmail('');
          setSelectedCategories([]);
          setSelectedFrequency('weekly');
        }, 2000);
      } else {
        setError('Subscription failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getModalContent = () => {
    switch (type) {
      case 'exit-intent':
        return {
          title: title || 'Wait! Don\'t Leave Yet!',
          subtitle: subtitle || 'Subscribe and get 10% off your first order',
          icon: <Heart size={48} className="text-red-500" />
        };
      case 'discount':
        return {
          title: title || 'Special Offer Just for You!',
          subtitle: subtitle || `Get ${offer?.discount}% off with code ${offer?.code}`,
          icon: <Percent size={48} className="text-green-500" />
        };
      case 'welcome':
        return {
          title: title || 'Welcome to StyleShop!',
          subtitle: subtitle || 'Stay updated with our latest collections and exclusive offers',
          icon: <Star size={48} className="text-blue-500" />
        };
      default:
        return {
          title: title || 'Stay in the Loop!',
          subtitle: subtitle || 'Subscribe to our newsletter for exclusive offers and updates',
          icon: <Mail size={48} className="text-purple-500" />
        };
    }
  };

  const content = getModalContent();

  const shouldShow = isOpen || (type === 'exit-intent' && showExitIntent);

  return (
    <>
      {trigger.exitIntent && (
        <ExitIntentDetector
          onExitIntent={handleExitIntent}
          enabled={!isOpen && !showExitIntent}
        />
      )}

      <AnimatePresence>
        {shouldShow && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring" }}
              style={{
                backgroundColor: design.backgroundColor || '#ffffff',
                color: design.textColor || '#1f2937'
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header Image */}
              {design.image && (
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                  <img
                    src={design.image}
                    alt="Newsletter"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}

              <div className="p-8">
                {/* Success State */}
                {isSuccess ? (
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Thank you for subscribing!
                    </h3>
                    <p className="text-gray-600">
                      Check your email for exclusive offers and updates.
                    </p>
                    {offer && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-800 font-medium">
                          Your discount code: <span className="font-mono font-bold">{offer.code}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <motion.div
                        className="flex justify-center mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        {content.icon}
                      </motion.div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {content.title}
                      </h2>
                      
                      <p className="text-gray-600">
                        {content.subtitle}
                      </p>

                      {/* Timer for offers */}
                      {offer && timeLeft > 0 && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-red-600">
                          <Clock size={16} />
                          <span className="font-mono font-bold">
                            Expires in {formatTime(timeLeft)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Input */}
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        {error && (
                          <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                      </div>

                      {/* Preferences */}
                      {preferences && (
                        <div className="space-y-4">
                          {/* Categories */}
                          {preferences.categories.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interested in:
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {preferences.categories.map(category => (
                                  <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      selectedCategories.includes(category)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Frequency */}
                          {preferences.frequency.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email frequency:
                              </label>
                              <select
                                value={selectedFrequency}
                                onChange={(e) => setSelectedFrequency(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {preferences.frequency.map(freq => (
                                  <option key={freq} value={freq}>
                                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        style={{
                          backgroundColor: design.accentColor || '#3b82f6'
                        }}
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>
                              {offer ? 'Get My Discount' : 'Subscribe Now'}
                            </span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Trust Signals */}
                    <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Shield size={12} />
                        <span>100% Secure</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail size={12} />
                        <span>No Spam</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <X size={12} />
                        <span>Unsubscribe Anytime</span>
                      </div>
                    </div>

                    {/* Offer Details */}
                    {offer && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 text-center">
                          <Gift size={14} className="inline mr-1" />
                          Use code <span className="font-mono font-bold">{offer.code}</span> for {offer.discount}% off your first order
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsletterModal;