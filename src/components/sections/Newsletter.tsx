import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight, Gift, Bell, Star } from 'lucide-react';

interface NewsletterProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    showBenefits?: boolean;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    inputBorderColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'centered' | 'split' | 'minimal';
    benefits?: Array<{
      icon: string;
      text: string;
    }>;
  };
  styles?: {
    container?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    form?: string;
    input?: string;
    button?: string;
    benefits?: string;
  };
  onSubscribe?: (email: string) => Promise<void>;
  isEditing?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({
  settings = {},
  styles = {},
  onSubscribe,
  isEditing = false
}) => {
  const {
    title = 'Stay in the Loop',
    subtitle = 'Subscribe to our newsletter',
    description = 'Get the latest updates on new products, exclusive offers, and insider news.',
    placeholder = 'Enter your email address',
    buttonText = 'Subscribe',
    showBenefits = true,
    backgroundColor = '#F3F4F6',
    textColor = '#1F2937',
    buttonColor = '#3B82F6',
    inputBorderColor = '#D1D5DB',
    padding = '4rem 1rem',
    margin = '0',
    layout = 'centered',
    benefits = [
      { icon: 'gift', text: 'Exclusive offers and discounts' },
      { icon: 'bell', text: 'Early access to new products' },
      { icon: 'star', text: 'Insider tips and recommendations' }
    ]
  } = settings;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      } else {
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setStatus('success');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
      
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap = {
      gift: Gift,
      bell: Bell,
      star: Star,
      mail: Mail
    };
    return iconMap[iconName as keyof typeof iconMap] || Gift;
  };

  const renderBenefits = () => {
    if (!showBenefits || benefits.length === 0) return null;

    return (
      <div className={`mt-8 ${styles.benefits || ''}`}>
        <div className="grid md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const IconComponent = getIcon(benefit.icon);
            return (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: buttonColor + '20' }}
                >
                  <IconComponent 
                    className="w-4 h-4" 
                    style={{ color: buttonColor }}
                  />
                </div>
                <span className="text-sm opacity-80">{benefit.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <form 
      onSubmit={handleSubmit} 
      className={`max-w-md mx-auto ${styles.form || ''}`}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${styles.input || ''}`}
            style={{
              borderColor: status === 'error' ? '#EF4444' : inputBorderColor,
              backgroundColor: '#FFFFFF',
              color: '#1F2937'
            }}
            disabled={status === 'loading'}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${styles.button || ''}`}
          style={{
            backgroundColor: status === 'success' ? '#10B981' : buttonColor,
            color: '#FFFFFF'
          }}
        >
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
          )}
          {status === 'success' && <CheckCircle className="w-4 h-4 mr-2 inline-block" />}
          {status === 'idle' && <ArrowRight className="w-4 h-4 mr-2 inline-block" />}
          {status === 'error' && <AlertCircle className="w-4 h-4 mr-2 inline-block" />}
          
          {status === 'loading' ? 'Subscribing...' :
           status === 'success' ? 'Subscribed!' :
           status === 'error' ? 'Try Again' :
           buttonText}
        </button>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <p className="mt-3 text-green-600 text-sm text-center flex items-center justify-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Thanks for subscribing! Check your email for confirmation.
        </p>
      )}

      {status === 'error' && errorMessage && (
        <p className="mt-3 text-red-600 text-sm text-center flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errorMessage}
        </p>
      )}
    </form>
  );

  if (layout === 'minimal') {
    return (
      <section
        className={`${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding: '2rem 1rem',
          margin
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className={`${styles.content || ''}`}>
            <h3 className={`text-xl font-semibold mb-4 ${styles.title || ''}`}>
              {title}
            </h3>
            {renderForm()}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'split') {
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
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${styles.content || ''}`}>
            {/* Content */}
            <div>
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
                {title}
              </h2>
              {subtitle && (
                <h3 className={`text-xl mb-4 opacity-80 ${styles.subtitle || ''}`}>
                  {subtitle}
                </h3>
              )}
              <p className="text-lg opacity-80 mb-6 leading-relaxed">
                {description}
              </p>
              {renderBenefits()}
            </div>

            {/* Form */}
            <div className="lg:pl-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <div 
                    className="inline-flex p-3 rounded-full mb-4"
                    style={{ backgroundColor: buttonColor + '20' }}
                  >
                    <Mail 
                      className="w-6 h-6" 
                      style={{ color: buttonColor }}
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Join our community
                  </h4>
                </div>
                {renderForm()}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Centered layout (default)
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
          {/* Icon */}
          <div className="inline-flex p-4 rounded-full mb-6" style={{ backgroundColor: buttonColor + '20' }}>
            <Mail className="w-8 h-8" style={{ color: buttonColor }} />
          </div>

          {/* Content */}
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
            {title}
          </h2>
          
          {subtitle && (
            <h3 className={`text-xl md:text-2xl mb-6 opacity-80 ${styles.subtitle || ''}`}>
              {subtitle}
            </h3>
          )}
          
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Form */}
          {renderForm()}

          {/* Benefits */}
          {renderBenefits()}

          {/* Privacy Note */}
          <p className="text-xs opacity-60 mt-6 max-w-md mx-auto">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;