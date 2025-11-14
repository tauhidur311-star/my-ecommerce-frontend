import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import apiService from '../services/api.js';

const PublicContactDisplay = ({ className = '' }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicContactInfo();
  }, []);

  const fetchPublicContactInfo = async () => {
    try {
      const response = await apiService.request('/admin/contact-info/public');
      if (response.success && response.data) {
        setContactInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch public contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBusinessHours = (hours) => {
    if (!hours) return '';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const formatted = days.map((day, index) => {
      const dayHours = hours[day];
      if (!dayHours) return null;
      
      if (dayHours.closed) {
        return `${dayNames[index]}: Closed`;
      }
      
      return `${dayNames[index]}: ${dayHours.open} - ${dayHours.close}`;
    }).filter(Boolean);
    
    return formatted;
  };

  const getSocialIcon = (platform) => {
    // You can replace these with actual social media icons
    const icons = {
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
      linkedin: '💼',
      youtube: '📺',
      tiktok: '🎵'
    };
    return icons[platform] || '🌐';
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!contactInfo) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contact Information */}
      <div className="space-y-4">
        {/* Address */}
        {contactInfo.address?.isVisible && contactInfo.address?.value && (
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Address</h4>
              <p className="text-gray-600 whitespace-pre-line">{contactInfo.address.value}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        {contactInfo.phoneNumber?.isVisible && contactInfo.phoneNumber?.value && (
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Phone</h4>
              <a 
                href={`tel:${contactInfo.phoneNumber.value}`}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {contactInfo.phoneNumber.value}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {contactInfo.email?.isVisible && contactInfo.email?.value && (
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Email</h4>
              <a 
                href={`mailto:${contactInfo.email.value}`}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {contactInfo.email.value}
              </a>
            </div>
          </div>
        )}

        {/* Live Chat Availability */}
        {contactInfo.liveChatAvailability && (
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Live Chat</h4>
              <p className="text-gray-600">{contactInfo.liveChatAvailability}</p>
            </div>
          </div>
        )}
      </div>

      {/* Business Hours */}
      {contactInfo.businessHours && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            Business Hours
          </h4>
          <div className="space-y-1 text-sm">
            {formatBusinessHours(contactInfo.businessHours).map((hours, index) => (
              <div key={index} className="text-gray-600">
                {hours}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {contactInfo.emergencyContact?.phone && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Emergency Contact</h4>
          <p className="text-red-700 font-medium">{contactInfo.emergencyContact.phone}</p>
          {contactInfo.emergencyContact.description && (
            <p className="text-red-600 text-sm mt-1">{contactInfo.emergencyContact.description}</p>
          )}
        </div>
      )}

      {/* Social Media Links */}
      {contactInfo.socialLinks && Object.values(contactInfo.socialLinks).some(link => link) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Follow Us</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(contactInfo.socialLinks)
              .filter(([platform, url]) => url)
              .map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <span className="text-lg">{getSocialIcon(platform)}</span>
                  <span className="capitalize">{platform}</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicContactDisplay;