import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Heart
} from 'lucide-react';

interface FooterProps {
  settings?: {
    companyName?: string;
    tagline?: string;
    description?: string;
    showSocialLinks?: boolean;
    showNewsletter?: boolean;
    showContactInfo?: boolean;
    showQuickLinks?: boolean;
    backgroundColor?: string;
    textColor?: string;
    linkColor?: string;
    borderColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'simple' | 'detailed' | 'minimal';
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    quickLinks?: Array<{
      label: string;
      url: string;
    }>;
  };
  styles?: {
    container?: string;
    content?: string;
    section?: string;
    title?: string;
    link?: string;
    social?: string;
    bottom?: string;
  };
  onNewsletterSignup?: (email: string) => void;
  isEditing?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  settings = {},
  styles = {},
  onNewsletterSignup,
  isEditing = false
}) => {
  const {
    companyName = 'Your Store',
    tagline = 'Quality products for everyone',
    description = 'We are committed to providing the best products and exceptional customer service.',
    showSocialLinks = true,
    showNewsletter = true,
    showContactInfo = true,
    showQuickLinks = true,
    backgroundColor = '#1F2937',
    textColor = '#F9FAFB',
    linkColor = '#60A5FA',
    borderColor = '#374151',
    padding = '3rem 1rem 1rem',
    margin = '0',
    layout = 'detailed',
    socialLinks = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    },
    contactInfo = {
      email: 'info@yourstore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Store Street, City, State 12345'
    },
    quickLinks = [
      { label: 'About Us', url: '/about' },
      { label: 'Contact', url: '/contact' },
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Shipping Info', url: '/shipping' },
      { label: 'Returns', url: '/returns' }
    ]
  } = settings;

  const [email, setEmail] = React.useState('');
  const [newsletterStatus, setNewsletterStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || newsletterStatus === 'loading') return;

    setNewsletterStatus('loading');
    
    try {
      await onNewsletterSignup?.(email);
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  const socialIcons = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: socialLinks.facebook, 
      color: '#1877F2' 
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      url: socialLinks.twitter, 
      color: '#1DA1F2' 
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: socialLinks.instagram, 
      color: '#E4405F' 
    },
    { 
      name: 'Youtube', 
      icon: Youtube, 
      url: socialLinks.youtube, 
      color: '#FF0000' 
    }
  ];

  if (layout === 'minimal') {
    return (
      <footer
        className={`${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding: '2rem 1rem',
          margin
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                © {new Date().getFullYear()} {companyName}. All rights reserved.
              </p>
            </div>
            
            {showSocialLinks && (
              <div className="flex items-center space-x-4">
                {socialIcons.map(({ name, icon: Icon, url }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  if (layout === 'simple') {
    return (
      <footer
        className={`${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding: '3rem 1rem 1rem',
          margin
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">{companyName}</h3>
              <p className="text-sm mb-4 opacity-80">{description}</p>
              
              {showSocialLinks && (
                <div className="flex space-x-4">
                  {socialIcons.map(({ name, icon: Icon, url }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            {showQuickLinks && (
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  {quickLinks.slice(0, 6).map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                        style={{ color: linkColor }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newsletter */}
            {showNewsletter && (
              <div>
                <h4 className="font-semibold mb-4">Stay Updated</h4>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                  >
                    {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                
                {newsletterStatus === 'success' && (
                  <p className="text-green-400 text-sm mt-2">Successfully subscribed!</p>
                )}
                {newsletterStatus === 'error' && (
                  <p className="text-red-400 text-sm mt-2">Error subscribing. Please try again.</p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div 
            className="pt-8 border-t text-center text-sm opacity-80"
            style={{ borderColor }}
          >
            <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  // Detailed layout (default)
  return (
    <footer
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className={`lg:col-span-2 ${styles.section || ''}`}>
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${styles.title || ''}`}>
                  {companyName}
                </h3>
                {tagline && (
                  <p className="text-sm opacity-60 mb-4">{tagline}</p>
                )}
                <p className="opacity-80 leading-relaxed mb-6">{description}</p>
              </div>

              {/* Social Links */}
              {showSocialLinks && (
                <div className={`${styles.social || ''}`}>
                  <h4 className="font-semibold mb-3">Follow Us</h4>
                  <div className="flex space-x-4">
                    {socialIcons.map(({ name, icon: Icon, url, color }) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                        title={name}
                      >
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: linkColor }} 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            {showQuickLinks && (
              <div className={`${styles.section || ''}`}>
                <h4 className={`font-semibold mb-4 ${styles.title || ''}`}>
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className={`inline-flex items-center opacity-80 hover:opacity-100 transition-all duration-200 group ${styles.link || ''}`}
                        style={{ color: textColor }}
                      >
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact & Newsletter */}
            <div className={`${styles.section || ''}`}>
              {/* Contact Info */}
              {showContactInfo && (
                <div className="mb-8">
                  <h4 className={`font-semibold mb-4 ${styles.title || ''}`}>
                    Contact Info
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {contactInfo.email && (
                      <li className="flex items-start">
                        <Mail className="w-4 h-4 mr-3 mt-0.5 opacity-60" />
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                          style={{ color: linkColor }}
                        >
                          {contactInfo.email}
                        </a>
                      </li>
                    )}
                    
                    {contactInfo.phone && (
                      <li className="flex items-start">
                        <Phone className="w-4 h-4 mr-3 mt-0.5 opacity-60" />
                        <a 
                          href={`tel:${contactInfo.phone}`}
                          className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                          style={{ color: linkColor }}
                        >
                          {contactInfo.phone}
                        </a>
                      </li>
                    )}
                    
                    {contactInfo.address && (
                      <li className="flex items-start">
                        <MapPin className="w-4 h-4 mr-3 mt-0.5 opacity-60" />
                        <span className="opacity-80">{contactInfo.address}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Newsletter */}
              {showNewsletter && (
                <div>
                  <h4 className={`font-semibold mb-4 ${styles.title || ''}`}>
                    Newsletter
                  </h4>
                  <p className="text-sm opacity-80 mb-4">
                    Subscribe for updates and exclusive offers
                  </p>
                  
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="submit"
                      disabled={newsletterStatus === 'loading'}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {newsletterStatus === 'loading' ? (
                        'Subscribing...'
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                  
                  {newsletterStatus === 'success' && (
                    <p className="text-green-400 text-sm mt-2 flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      Thank you for subscribing!
                    </p>
                  )}
                  {newsletterStatus === 'error' && (
                    <p className="text-red-400 text-sm mt-2">
                      Oops! Something went wrong. Please try again.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div 
            className={`pt-8 border-t ${styles.bottom || ''}`}
            style={{ borderColor }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm opacity-80 mb-4 md:mb-0">
                © {new Date().getFullYear()} {companyName}. All rights reserved.
                {isEditing && ' Made with ❤️'}
              </p>
              
              <div className="flex items-center space-x-6 text-sm opacity-80">
                <a 
                  href="/privacy" 
                  className="hover:opacity-100 transition-opacity duration-200"
                  style={{ color: linkColor }}
                >
                  Privacy
                </a>
                <a 
                  href="/terms" 
                  className="hover:opacity-100 transition-opacity duration-200"
                  style={{ color: linkColor }}
                >
                  Terms
                </a>
                <a 
                  href="/cookies" 
                  className="hover:opacity-100 transition-opacity duration-200"
                  style={{ color: linkColor }}
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;