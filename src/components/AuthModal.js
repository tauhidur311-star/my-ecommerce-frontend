import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { EnhancedOTPForm } from './EnhancedOTPForm';

export default function AuthModal({ 
  showAuth,
  setShowAuth, 
  handleAuth,
  authMode, 
  setAuthMode,
  authForm,
  setAuthForm,
  onLoginSuccess,
  login
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'newPassword'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // The handleAuth function from Store.js needs to be awaited
      // and we need to check its return value or catch its errors.
      // For now, let's assume it throws on failure.
      await handleAuth(e);
    } catch (err) {
      // This will now show the actual error message from the backend if available
      const errorMessage = err.response?.data?.message || err.message || 'Authentication failed. Please try again.';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      
      toast.success('OTP sent to your email! Please check your inbox.');
      setForgotPasswordStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (otp) => {
    setIsLoading(true);
    setError(null);
    try {
      // Verify OTP with backend first
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP.');
      
      // If verification successful, store OTP and proceed
      setAuthForm({ ...authForm, otp });
      setForgotPasswordStep('newPassword');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, otp: authForm.otp, password: authForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      toast.success(data.message);
      setAuthMode('login');
      setForgotPasswordStep('email');
      setAuthForm({ name: '', email: '', password: '', otp: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Use the login function from useAuth hook to properly set user state
        const token = data.tokens?.accessToken || data.token;
        if (token && login) {
          login(data.user, token);
        } else {
          // Fallback to manual localStorage setting if login function not available
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.tokens?.accessToken || data.token);
        }

        // Store additional tokens for enhanced API service
        if (data.tokens) {
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
        }

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        // Show the specific error from the backend
        setError(data.error || 'Google login failed.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      // Provide a more helpful message for network errors
      setError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {authMode === 'login' ? 'Login' : 
             authMode === 'register' ? 'Sign Up' : 
             authMode === 'forgotPassword' ? (
               forgotPasswordStep === 'email' ? 'Forgot Password' :
               forgotPasswordStep === 'otp' ? 'Verify OTP' :
               'Set New Password'
             ) : 'Reset Password'}
          </h2>
          <button onClick={() => setShowAuth(false)}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {authMode === 'forgotPassword' ? (
          forgotPasswordStep === 'email' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your email address and we will send you an OTP to reset your password.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : forgotPasswordStep === 'otp' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {authForm.email}</p>
              <EnhancedOTPForm 
                onSubmit={handleOTPVerification}
                onResendOTP={handleForgotPassword}
                isLoading={isLoading}
                error={error}
                email={authForm.email}
              />
              <button 
                onClick={() => {
                  setForgotPasswordStep('email');
                  setError(null);
                }}
                className="w-full text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                ← Back to email entry
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your new password</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={authForm.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )
        ) : authMode === 'resetPassword' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={authForm.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                value={authForm.otp || ''}
                onChange={(e) => setAuthForm({ ...authForm, otp: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login and Register Forms */}
            {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Sign Up' }
          </button>
        </form>
        )}

        {authMode === 'login' && (
          <>
            <div className="text-sm text-right mt-2">
              <button
                onClick={() => setAuthMode('forgotPassword')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google login failed. Please try again.');
                }}
              />
            </div>
          </>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {authMode === 'login' ? "Don't have an account? Sign up" 
             : authMode === 'register' ? 'Already have an account? Login' 
             : <span onClick={() => setAuthMode('login')}>Back to Login</span>}
          </button>
        </div>
      </div>
    </div>
  );
}