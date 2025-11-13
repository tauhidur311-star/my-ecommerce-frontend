import React from 'react';

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: '🏠',
      label: 'Address',
      value: '123 Business Street\nSuite 456\nNew York, NY 10001\nUnited States',
      link: null
    },
    {
      icon: '📞',
      label: 'Phone',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: '✉️',
      label: 'Email',
      value: 'contact@yourstore.com',
      link: 'mailto:contact@yourstore.com'
    },
    {
      icon: '💬',
      label: 'Live Chat',
      value: 'Available Mon-Fri 9AM-6PM EST',
      link: null
    }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/yourstore',
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: 'https://twitter.com/yourstore',
      color: 'text-blue-400 hover:text-blue-500'
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/yourstore',
      color: 'text-pink-600 hover:text-pink-700'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/company/yourstore',
      color: 'text-blue-700 hover:text-blue-800'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Contact Information
      </h2>
      
      {/* Contact Details */}
      <div className="space-y-6 mb-8">
        {contactDetails.map((detail, index) => (
          <div key={index} className="flex items-start space-x-4 group">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
              <span className="text-xl text-indigo-600">{detail.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {detail.label}
              </h3>
              {detail.link ? (
                <a
                  href={detail.link}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="text-gray-700 whitespace-pre-line">
                  {detail.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Social Media Links */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Follow Us
        </h3>
        <div className="flex space-x-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-110 ${social.color}`}
              title={`Follow us on ${social.name}`}
            >
              <span className="text-lg">{social.icon}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-red-600 text-lg">🚨</span>
          <h3 className="text-sm font-semibold text-red-800">
            Emergency Support
          </h3>
        </div>
        <p className="text-sm text-red-700">
          For urgent technical issues affecting your business, call our emergency hotline:
        </p>
        <a
          href="tel:+15551239999"
          className="text-red-800 font-bold hover:text-red-900 transition-colors duration-200"
        >
          +1 (555) 123-9999
        </a>
      </div>
    </div>
  );
};

export default ContactInfo;