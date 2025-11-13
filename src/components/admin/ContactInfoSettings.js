import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const ContactInfoSettings = () => {
  const [contactInfo, setContactInfo] = useState({
    address: { value: '', isVisible: true },
    phoneNumber: { value: '', isVisible: true },
    email: { value: '', isVisible: true },
    liveChatAvailability: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    emergencyContact: {
      phone: '',
      description: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    social: false,
    hours: false,
    emergency: false
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/admin/contact-info');
      if (response.success && response.data) {
        setContactInfo({ ...contactInfo, ...response.data });
      }
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      showMessage('error', 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiService.request('/admin/contact-info', {
        method: 'PUT',
        body: JSON.stringify(contactInfo)
      });

      if (response.success) {
        showMessage('success', 'Contact information updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save contact info:', error);
      showMessage('error', 'Failed to save contact information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateField = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent, field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const updateBusinessHours = (day, field, value) => {
    setContactInfo(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information Settings</h2>
        <p className="text-gray-600">
          Manage the contact information displayed on your website's Contact Us page.
        </p>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg border animate-fadeIn ${
          message.type === 'success' 
            ? 'bg-green-100 border-green-200 text-green-800' 
            : 'bg-red-100 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            {message.text}
          </div>
        </div>
      )}

      {/* Basic Contact Information */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Basic Contact Information</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.basic && (
          <div className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Business Address</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={contactInfo.address?.isVisible !== false}
                      onChange={(e) => updateField('address', { 
                        ...contactInfo.address, 
                        isVisible: e.target.checked 
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Show on-site</span>
                  </label>
                </div>
                <textarea
                  value={contactInfo.address?.value || contactInfo.address || ''}
                  onChange={(e) => updateField('address', 
                    typeof contactInfo.address === 'object' 
                      ? { ...contactInfo.address, value: e.target.value }
                      : { value: e.target.value, isVisible: true }
                  )}
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={4}
                  placeholder="123 Business Street&#10;Suite 456&#10;City, State 12345&#10;Country"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={contactInfo.phoneNumber?.isVisible !== false}
                        onChange={(e) => updateField('phoneNumber', { 
                          ...contactInfo.phoneNumber, 
                          isVisible: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Show on-site</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={contactInfo.phoneNumber?.value || contactInfo.phoneNumber || ''}
                    onChange={(e) => updateField('phoneNumber', 
                      typeof contactInfo.phoneNumber === 'object' 
                        ? { ...contactInfo.phoneNumber, value: e.target.value }
                        : { value: e.target.value, isVisible: true }
                    )}
                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={contactInfo.email?.isVisible !== false}
                        onChange={(e) => updateField('email', { 
                          ...contactInfo.email, 
                          isVisible: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Show on-site</span>
                    </label>
                  </div>
                  <input
                    type="email"
                    value={contactInfo.email?.value || contactInfo.email || ''}
                    onChange={(e) => updateField('email', 
                      typeof contactInfo.email === 'object' 
                        ? { ...contactInfo.email, value: e.target.value }
                        : { value: e.target.value, isVisible: true }
                    )}
                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="contact@yourstore.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Live Chat Availability</label>
                  <input
                    type="text"
                    value={contactInfo.liveChatAvailability}
                    onChange={(e) => updateField('liveChatAvailability', e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Mon-Fri 9AM-6PM EST"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Media Links */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('social')}
          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.social ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.social && (
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contactInfo.socialLinks).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform} URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateNestedField('socialLinks', platform, e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder={`https://${platform}.com/yourstore`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Business Hours */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('hours')}
          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.hours ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.hours && (
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {Object.entries(contactInfo.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => updateBusinessHours(day, 'closed', !e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </>
                  )}
                  
                  {hours.closed && (
                    <span className="text-red-600 text-sm font-medium">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('emergency')}
          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.emergency ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.emergency && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
              <input
                type="tel"
                value={contactInfo.emergencyContact.phone}
                onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="+1 (555) 123-9999"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Description</label>
              <textarea
                value={contactInfo.emergencyContact.description}
                onChange={(e) => updateNestedField('emergencyContact', 'description', e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={3}
                placeholder="For urgent technical issues affecting your business..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-md ${
              saving ? 'opacity-50 cursor-not-allowed transform-none' : ''
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Contact Information'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSettings;