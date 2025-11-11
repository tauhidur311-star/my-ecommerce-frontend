import React, { useState, useEffect } from 'react';
import { Shield, Lock, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TwoFactorAuth = ({ user }) => {
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [setupStep, setSetupStep] = useState('initial'); // initial, code-sent, verifying
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

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
        toast.success('Two-factor authentication enabled successfully!');
        setShowSetup(false);
        setSetupStep('initial');
        setVerificationCode('');
        await loadTwoFactorStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error verifying 2FA setup:', error);
      toast.error(error.message || 'Failed to verify code');
      setSetupStep('code-sent'); // Go back to code entry
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
        toast.success('Two-factor authentication disabled successfully');
        setShowDisable(false);
        setPassword('');
        await loadTwoFactorStatus(); // Refresh status
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
        toast.success('New verification code sent!');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error('Failed to resend code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Don't show 2FA options for social login users without passwords
  if (user?.authProvider === 'google' && !user?.password) {
    return (
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Two-Factor Authentication</h3>
        </div>
        <p className="text-blue-700 mb-4">
          Two-factor authentication is not available for Google sign-in accounts. 
          Your account is already protected by Google's security measures.
        </p>
        <p className="text-sm text-blue-600">
          If you'd like to use 2FA, you can set a password for your account first.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
      </div>

      {twoFactorStatus?.twoFactorEnabled ? (
        // 2FA is enabled
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Two-factor authentication is enabled</p>
              <p className="text-sm text-green-700">
                Your account is protected with an additional layer of security.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">
              You'll receive a verification code via email when signing in.
            </span>
          </div>

          <button
            onClick={() => setShowDisable(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Disable Two-Factor Authentication
          </button>
        </div>
      ) : (
        // 2FA is disabled
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Two-factor authentication is disabled</p>
              <p className="text-sm text-yellow-700">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                Protect your account from unauthorized access
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                Receive verification codes via email
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSetup(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Enable Two-Factor Authentication
            </h3>

            {setupStep === 'initial' && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  We'll send a verification code to your email address whenever you sign in.
                </p>
                <p className="text-sm text-gray-600">
                  Email: <strong>{user?.email}</strong>
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEnableTwoFactor}
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  <button
                    onClick={() => setShowSetup(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'code-sent' && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  We've sent a 6-digit verification code to your email. 
                  Please enter it below to complete the setup.
                </p>
                
                <form onSubmit={handleVerifySetup}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-wider"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={submitting || verificationCode.length !== 6}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSetup(false);
                          setSetupStep('initial');
                          setVerificationCode('');
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={submitting}
                        className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        Didn't receive the code? Resend
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {setupStep === 'verifying' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700">Verifying your code...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Disable Two-Factor Authentication
            </h3>

            <form onSubmit={handleDisableTwoFactor} className="space-y-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to disable two-factor authentication? 
                This will make your account less secure.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || !password}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Disabling...' : 'Disable 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDisable(false);
                    setPassword('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;