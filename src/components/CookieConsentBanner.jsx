import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, X, Check, Shield, BarChart3, ShoppingCart } from 'lucide-react';
import cookieManager from '../utils/cookieManager';

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = cookieManager.getCookieConsent();
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load existing preferences
      setPreferences({
        essential: true,
        analytics: cookieManager.hasAnalyticsConsent(),
        marketing: cookieManager.getCookie('marketingConsent') === 'true',
        personalization: cookieManager.getCookie('personalizationConsent') === 'true'
      });
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs) => {
    // Save consent status
    cookieManager.setCookieConsent('accepted');
    
    // Save individual preferences
    cookieManager.setAnalyticsConsent(prefs.analytics);
    cookieManager.setCookie('marketingConsent', prefs.marketing.toString(), { maxAge: 31536000 });
    cookieManager.setCookie('personalizationConsent', prefs.personalization.toString(), { maxAge: 31536000 });
    
    // Set performance tracking based on analytics consent
    cookieManager.setPerformanceTracking(prefs.analytics);
    
    console.log('Cookie preferences saved:', prefs);
  };

  const togglePreference = (type) => {
    if (type === 'essential') return; // Can't disable essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const CookieCategory = ({ icon: Icon, title, description, required = false, enabled, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon size={16} className={`${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {required && (
              <span className="px-1 py-0.5 text-xs bg-red-100 text-red-600 rounded">Required</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => !required && onChange()}
          disabled={required}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
        />
      </label>
    </div>
  );

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="mx-4 mb-4 max-w-sm ml-auto bg-white rounded-xl shadow-lg border border-gray-200 pointer-events-auto"
        >
          {/* Compact Banner */}
          {!showSettings ? (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Cookie size={20} className="text-amber-600 flex-shrink-0" />
                <h3 className="text-sm font-medium text-gray-900">
                  🍪 Cookie Notice
                </h3>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-gray-400 hover:text-gray-600 ml-auto p-1"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                We use cookies to enhance your experience and improve our services.
              </p>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Accept All
                  </button>
                  
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Essential Only
                  </button>
                </div>
                
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
                >
                  Customize preferences
                </button>
              </div>
            </div>
          ) : (
            /* Compact Settings Panel */
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Cookie Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                <CookieCategory
                  icon={Shield}
                  title="Essential Cookies"
                  description="These cookies are necessary for the website to function and cannot be disabled. They enable core functionality such as security, network management, and accessibility."
                  required={true}
                  enabled={preferences.essential}
                  onChange={() => {}}
                />
                
                <CookieCategory
                  icon={BarChart3}
                  title="Analytics Cookies"
                  description="These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."
                  enabled={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                />
                
                <CookieCategory
                  icon={ShoppingCart}
                  title="Marketing Cookies"
                  description="These cookies are used to track visitors across websites to display relevant advertisements and marketing campaigns."
                  enabled={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                />
                
                <CookieCategory
                  icon={Settings}
                  title="Personalization Cookies"
                  description="These cookies enable enhanced functionality and personalization, such as remembering your preferences and customizing your experience."
                  enabled={preferences.personalization}
                  onChange={() => togglePreference('personalization')}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  Save
                </button>
                
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;