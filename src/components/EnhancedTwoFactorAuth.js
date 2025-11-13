import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Smartphone, CheckCircle, AlertCircle, X, Mail, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const EnhancedTwoFactorAuth = ({ user }) => {
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [setupStep, setSetupStep] = useState('initial');
  const [submitting, setSubmitting] = useState(false);
  
  // Refs for modal management
  const setupModalRef = useRef(null);
  const disableModalRef = useRef(null);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  // Handle escape key and click outside to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    const handleClickOutside = (e) => {
      if (setupModalRef.current && !setupModalRef.current.contains(e.target)) {
        if (showSetup) closeSetupModal();
      }
      if (disableModalRef.current && !disableModalRef.current.contains(e.target)) {
        if (showDisable) closeDisableModal();
      }
    };

    if (showSetup || showDisable) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showSetup, showDisable]);

  const loadTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const response = await api.getTwoFactorStatus();
      if (response.success) {
        setTwoFactorStatus(response);
      }
    } catch (error) {
      console.error('Error loading 2FA status:', error);
      toast.error('Failed to load two-factor authentication status');
    } finally {
      setLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowSetup(false);
    setShowDisable(false);
    setSetupStep('initial');
    setVerificationCode('');
    setPassword('');
    setSubmitting(false);
  };

  const closeSetupModal = () => {
    setShowSetup(false);
    setSetupStep('initial');
    setVerificationCode('');
    setSubmitting(false);
  };

  const closeDisableModal = () => {
    setShowDisable(false);
    setPassword('');
    setSubmitting(false);
  };

  const handleEnableTwoFactor = async () => {
    try {
      setSubmitting(true);
      const response = await api.enableTwoFactor();
      
      if (response.success) {
        setSetupStep('code-sent');
        toast.success('Verification code sent to your email!');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Failed to enable two-factor authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setSubmitting(true);
      setSetupStep('verifying');
      const response = await api.verifyTwoFactorSetup(verificationCode);
      
      if (response.success) {
        toast.success('Two-factor authentication has been enabled successfully!');
        closeSetupModal();
        await loadTwoFactorStatus();
      }
    } catch (error) {
      console.error('Error verifying 2FA setup:', error);
      toast.error(error.message || 'Invalid verification code. Please try again.');
      setSetupStep('code-sent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.disableTwoFactor(password);
      
      if (response.success) {
        toast.success('Two-factor authentication has been disabled');
        closeDisableModal();
        await loadTwoFactorStatus();
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(error.message || 'Failed to disable two-factor authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setSubmitting(true);
      const response = await api.enableTwoFactor();
      if (response.success) {
        toast.success('New verification code sent to your email!');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error('Failed to resend verification code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show 2FA options for social login users without passwords
  if (user?.authProvider === 'google' || user?.googleId) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Two-Factor Authentication
        </h3>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-blue-600" />
            <h4 className="font-medium text-blue-800">Google Account Protection</h4>
          </div>
          <p className="text-blue-700 text-sm mb-3">
            Your account is already protected by Google's security measures.
          </p>
          <p className="text-blue-600 text-xs">
            If you'd like to use 2FA, you can set a password for your account first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main 2FA Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-green-600" />
          Two-Factor Authentication
        </h3>

        {twoFactorStatus?.enabled ? (
          // 2FA is enabled
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-green-800">Two-Factor Authentication Enabled</h4>
                <p className="text-green-700 text-sm">
                  Your account is protected with an additional layer of security.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisable(true)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        ) : (
          // 2FA is disabled
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle size={20} className="text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Two-Factor Authentication Disabled</h4>
                <p className="text-orange-700 text-sm">
                  Add an extra layer of security to your account.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSetup(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
            
            {/* Modal */}
            <div 
              ref={setupModalRef}
              className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              {/* Close Button */}
              <button
                onClick={closeSetupModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enable Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600">
                    Secure your account with 2FA
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              {setupStep === 'initial' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Email Verification</h4>
                        <p className="text-blue-800 text-sm">
                          We'll send a 6-digit verification code to your email address ({user?.email}) to complete the setup.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleEnableTwoFactor}
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {submitting ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                    <button
                      onClick={closeSetupModal}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {setupStep === 'code-sent' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-green-600" />
                    </div>
                    <p className="text-gray-700 mb-4">
                      We've sent a 6-digit verification code to your email. 
                      Please enter it below to complete the setup.
                    </p>
                  </div>
                  
                  <form onSubmit={handleVerifySetup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
                        maxLength={6}
                        autoComplete="one-time-code"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={submitting || verificationCode.length !== 6}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {submitting ? 'Verifying...' : 'Verify & Enable 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={submitting}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        Resend
                      </button>
                    </div>
                  </form>

                  <div className="text-center">
                    <button
                      onClick={closeSetupModal}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel Setup
                    </button>
                  </div>
                </div>
              )}

              {setupStep === 'verifying' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Verifying Your Code</h4>
                  <p className="text-gray-600">Please wait while we verify your code...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisable && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
            
            {/* Modal */}
            <div 
              ref={disableModalRef}
              className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              {/* Close Button */}
              <button
                onClick={closeDisableModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Disable Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600">
                    This will reduce your account security
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleDisableTwoFactor} className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 text-sm">
                      Are you sure you want to disable two-factor authentication? 
                      This will make your account less secure.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key size={16} className="inline mr-1" />
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting || !password}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {submitting ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                  <button
                    type="button"
                    onClick={closeDisableModal}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedTwoFactorAuth;