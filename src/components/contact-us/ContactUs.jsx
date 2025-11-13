import React, { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import MapEmbed from './MapEmbed';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';

const ContactUs = () => {
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', or null
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleFormSubmission = (status, message) => {
    setSubmissionStatus(status);
    setSubmissionMessage(message);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setSubmissionStatus(null);
      setSubmissionMessage('');
    }, 5000);
  };

  return (
    <div className="py-12 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back to Store Button */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-5 h-5 mr-2" />
            Back to Store
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column - Contact Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-8 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">
              Send us a Message
            </h2>
            
            {/* Status Messages */}
            {submissionStatus === 'success' && (
              <SuccessMessage message={submissionMessage} />
            )}
            {submissionStatus === 'error' && (
              <ErrorMessage message={submissionMessage} />
            )}
            
            <ContactForm onSubmission={handleFormSubmission} />
          </div>

          {/* Right Column - Contact Info and Map */}
          <div className="space-y-6">
            <ContactInfo />
            <MapEmbed />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-2xl">🕒</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Business Hours</h3>
              <p className="text-white/70">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Response Time</h3>
              <p className="text-white/70">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Global Support</h3>
              <p className="text-white/70">
                We provide support to customers worldwide in multiple languages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;