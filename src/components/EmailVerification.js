import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const EmailVerification = ({ user, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Auto-show verification if user is not verified
  useEffect(() => {
    if (user && !user.isEmailVerified) {
      setShowCodeInput(true);
    }
  }, [user]);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Verification email sent successfully!');
        setShowCodeInput(true);
      } else {
        throw new Error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: verificationCode,
          email: user.email 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Email verified successfully!');
        setShowCodeInput(false);
        if (onVerificationComplete) {
          onVerificationComplete();
        }
        // Refresh page to update user state
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to verify email');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error(error.message || 'Failed to verify email');
    } finally {
      setVerifying(false);
    }
  };

  // Don't show if user is already verified
  if (user && user.isEmailVerified) {
    return null;
  }

  // Don't show for social login users
  if (user && user.authProvider !== 'local') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-yellow-800 font-medium mb-1">Email Verification Required</h4>
          <p className="text-yellow-700 text-sm mb-3">
            Please verify your email address to access all features. 
            {user?.email && ` Verification email sent to ${user.email}`}
          </p>

          {!showCodeInput ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition text-sm"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Email</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowCodeInput(true)}
                className="text-yellow-700 hover:text-yellow-800 text-sm underline"
              >
                Already have a code?
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-yellow-800 mb-1">
                  Enter Verification Code
                </label>
                <input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center text-lg tracking-wider"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={verifying || verificationCode.length !== 6}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify Email</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="text-yellow-700 hover:text-yellow-800 text-sm underline disabled:opacity-50"
                >
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeInput(false);
                    setVerificationCode('');
                  }}
                  className="text-yellow-700 hover:text-yellow-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;