import React from 'react';

const FooterSection = ({ section, settings, isEditing }) => {
  const {
    companyName = 'Your Company',
    description = 'Short description of your company',
    links = [
      { text: 'About', url: '/about' },
      { text: 'Contact', url: '/contact' }
    ],
    socialLinks = {
      facebook: '',
      twitter: '',
      instagram: ''
    },
    backgroundColor = '#1f2937',
    textColor = '#ffffff'
  } = settings;

  const footerStyle = {
    backgroundColor,
    color: textColor
  };

  return (
    <footer className="py-12" style={footerStyle}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? (
                <span className="border-b border-dashed border-current pb-1">
                  {companyName}
                </span>
              ) : (
                companyName
              )}
            </h3>
            <p className="opacity-80">
              {isEditing ? (
                <span className="border-b border-dashed border-current pb-1">
                  {description}
                </span>
              ) : (
                description
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  {isEditing ? (
                    <span className="opacity-80 hover:opacity-100 border-b border-dashed border-current pb-1">
                      {link.text}
                    </span>
                  ) : (
                    <a 
                      href={link.url}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {link.text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              )}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-current border-opacity-20 mt-8 pt-8 text-center">
          <p className="opacity-80">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Editing indicators */}
      {isEditing && (
        <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium">
          Footer Section
        </div>
      )}
    </footer>
  );
};

export default FooterSection;