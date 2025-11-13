import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, User, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    showMap?: boolean;
    showContactInfo?: boolean;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    inputBorderColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'split' | 'centered' | 'minimal';
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
      hours?: string;
    };
    mapEmbedUrl?: string;
  };
  styles?: {
    container?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    form?: string;
    input?: string;
    textarea?: string;
    button?: string;
    contactInfo?: string;
    map?: string;
  };
  onSubmit?: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  isEditing?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  settings = {},
  styles = {},
  onSubmit,
  isEditing = false
}) => {
  const {
    title = 'Get in Touch',
    subtitle = 'We\'d love to hear from you',
    description = 'Send us a message and we\'ll respond as soon as possible.',
    showMap = true,
    showContactInfo = true,
    backgroundColor = '#FFFFFF',
    textColor = '#1F2937',
    buttonColor = '#3B82F6',
    inputBorderColor = '#D1D5DB',
    padding = '4rem 1rem',
    margin = '0',
    layout = 'split',
    contactInfo = {
      email: 'info@yourstore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Store Street, City, State 12345',
      hours: 'Mon-Fri: 9AM-6PM'
    },
    mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.7!2d-74.0059413!3d40.7589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzMyLjAiTiA3NMKwMDAnMjEuNCJX!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus'
  } = settings;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
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

  const renderContactInfo = () => {
    if (!showContactInfo) return null;

    return (
      <div className={`space-y-6 ${styles.contactInfo || ''}`}>
        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
        
        <div className="space-y-4">
          {contactInfo.email && (
            <div className="flex items-start space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: buttonColor + '20' }}
              >
                <Mail className="w-5 h-5" style={{ color: buttonColor }} />
              </div>
              <div>
                <h4 className="font-medium">Email</h4>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: buttonColor }}
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          )}

          {contactInfo.phone && (
            <div className="flex items-start space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: buttonColor + '20' }}
              >
                <Phone className="w-5 h-5" style={{ color: buttonColor }} />
              </div>
              <div>
                <h4 className="font-medium">Phone</h4>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: buttonColor }}
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          )}

          {contactInfo.address && (
            <div className="flex items-start space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: buttonColor + '20' }}
              >
                <MapPin className="w-5 h-5" style={{ color: buttonColor }} />
              </div>
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-sm opacity-80">{contactInfo.address}</p>
              </div>
            </div>
          )}

          {contactInfo.hours && (
            <div className="flex items-start space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: buttonColor + '20' }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: buttonColor }} />
              </div>
              <div>
                <h4 className="font-medium">Business Hours</h4>
                <p className="text-sm opacity-80">{contactInfo.hours}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className={`space-y-6 ${styles.form || ''}`}>
      {/* Name and Email Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${styles.input || ''}`}
              style={{
                borderColor: status === 'error' && !formData.name ? '#EF4444' : inputBorderColor,
                backgroundColor: '#FFFFFF'
              }}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${styles.input || ''}`}
              style={{
                borderColor: status === 'error' && !formData.email ? '#EF4444' : inputBorderColor,
                backgroundColor: '#FFFFFF'
              }}
              required
            />
          </div>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="What's this about?"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${styles.input || ''}`}
          style={{
            borderColor: inputBorderColor,
            backgroundColor: '#FFFFFF'
          }}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us what's on your mind..."
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${styles.textarea || ''}`}
          style={{
            borderColor: status === 'error' && !formData.message ? '#EF4444' : inputBorderColor,
            backgroundColor: '#FFFFFF'
          }}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${styles.button || ''}`}
        style={{
          backgroundColor: status === 'success' ? '#10B981' : buttonColor,
          color: '#FFFFFF'
        }}
      >
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
        )}
        {status === 'success' && <CheckCircle className="w-4 h-4 mr-2 inline-block" />}
        {status === 'idle' && <Send className="w-4 h-4 mr-2 inline-block" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 mr-2 inline-block" />}
        
        {status === 'loading' ? 'Sending...' :
         status === 'success' ? 'Message Sent!' :
         status === 'error' ? 'Try Again' :
         'Send Message'}
      </button>

      {/* Status Messages */}
      {status === 'success' && (
        <p className="text-green-600 text-sm text-center flex items-center justify-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Thank you! We'll get back to you soon.
        </p>
      )}

      {status === 'error' && errorMessage && (
        <p className="text-red-600 text-sm text-center flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errorMessage}
        </p>
      )}
    </form>
  );

  const renderMap = () => {
    if (!showMap) return null;

    return (
      <div className={`${styles.map || ''}`}>
        <h3 className="text-xl font-semibold mb-4">Find Us</h3>
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          {isEditing ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm opacity-60">Interactive Map</p>
              </div>
            </div>
          ) : (
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          )}
        </div>
      </div>
    );
  };

  if (layout === 'minimal') {
    return (
      <section
        className={`${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding: '3rem 1rem',
          margin
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className={`text-center mb-8 ${styles.content || ''}`}>
            <h2 className={`text-3xl font-bold mb-4 ${styles.title || ''}`}>
              {title}
            </h2>
            {description && (
              <p className="text-lg opacity-80">{description}</p>
            )}
          </div>
          {renderForm()}
        </div>
      </section>
    );
  }

  if (layout === 'centered') {
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
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 ${styles.content || ''}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
              {title}
            </h2>
            {subtitle && (
              <h3 className={`text-xl mb-4 opacity-80 ${styles.subtitle || ''}`}>
                {subtitle}
              </h3>
            )}
            {description && (
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {renderForm()}
            </div>
            <div>
              {renderContactInfo()}
            </div>
          </div>

          {showMap && (
            <div className="mt-12">
              {renderMap()}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Split layout (default)
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
        <div className={`text-center mb-12 ${styles.content || ''}`}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
            {title}
          </h2>
          {subtitle && (
            <h3 className={`text-xl mb-4 opacity-80 ${styles.subtitle || ''}`}>
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl">
            {renderForm()}
          </div>

          {/* Contact Info and Map */}
          <div className="space-y-8">
            {renderContactInfo()}
            {renderMap()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;