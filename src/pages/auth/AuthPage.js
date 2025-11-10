import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast, { Toaster } from 'react-hot-toast';
import { OTPForm } from '../../components/OTPForm';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState('login');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: ''
  });

  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'newPassword'

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // This is the key fix: Set the auth mode based on the URL path,
  // and only run this effect when the path changes. This prevents the infinite loop.
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/forgot-password') {
      setAuthMode('forgotPassword');
    } else {
      setAuthMode('login');
    }
  }, [location.pathname]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    toast.success('Login successful! Redirecting...');
    // Force a full page reload to update the app's state
    window.location.href = '/';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      handleAuthSuccess(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      handleAuthSuccess(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed.');
      handleAuthSuccess(data); // This was missing the redirect logic, now fixed in handleAuthSuccess
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      toast.success('OTP sent to your email! Please check your inbox.');
      setForgotPasswordStep('otp');
      setMessage({ type: 'success', text: 'OTP sent to your email! Please check your inbox.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (otp) => {
    setFormData({ ...formData, otp });
    setForgotPasswordStep('newPassword');
    setMessage({ type: 'success', text: 'OTP verified! Please enter your new password.' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      toast.success(data.message);
      setAuthMode('login');
      setForgotPasswordStep('email');
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '', otp: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (authMode) {
      case 'register':
        return (
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Signup fields */}
            <InputField name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleInputChange} Icon={User} required />
            <InputField name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} Icon={Mail} required />
            <InputField name="phone" type="tel" placeholder="+880 1XXX-XXXXXX" value={formData.phone} onChange={handleInputChange} Icon={Phone} />
            <InputField name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} Icon={Lock} required showPasswordToggle={{ showPassword, setShowPassword }}/>
            <InputField name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} Icon={Lock} required />
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300">{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
        );
      case 'forgotPassword':
        if (forgotPasswordStep === 'email') {
          return (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your email to receive a password reset OTP.</p>
              <InputField name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} Icon={Mail} required />
              <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300">{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          );
        } else if (forgotPasswordStep === 'otp') {
          return (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {formData.email}</p>
              <OTPForm 
                onSubmit={handleOTPVerification}
                isLoading={loading}
                error={message.type === 'error' ? message.text : null}
              />
              <button 
                onClick={() => {
                  setForgotPasswordStep('email');
                  setMessage({ type: '', text: '' });
                }}
                className="w-full text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                ← Back to email entry
              </button>
            </div>
          );
        } else if (forgotPasswordStep === 'newPassword') {
          return (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your new password</p>
              <InputField name="password" type="password" placeholder="New Password" value={formData.password} onChange={handleInputChange} Icon={Lock} required />
              <InputField name="confirmPassword" type="password" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleInputChange} Icon={Lock} required />
              <button type="submit" disabled={loading || formData.password !== formData.confirmPassword} className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300">{loading ? 'Resetting...' : 'Reset Password'}</button>
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </form>
          );
        }
      case 'resetPassword':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField name="email" type="email" value={formData.email} Icon={Mail} readOnly />
            <InputField name="otp" type="text" placeholder="123456" value={formData.otp} onChange={handleInputChange} Icon={Lock} required/>
            <InputField name="password" type="password" placeholder="New Password" value={formData.password} onChange={handleInputChange} Icon={Lock} required />
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        );
      default: // login
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Login fields */}
            <InputField name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} Icon={Mail} required />
            <InputField name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} Icon={Lock} required showPasswordToggle={{ showPassword, setShowPassword }}/>            <div className="text-sm text-right"><Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300">{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Toaster position="bottom-center" />
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white w-2/5">
          <h1 className="text-3xl font-bold mb-4">Welcome to StyleShop</h1>
          <p className="text-blue-100 mb-6">Your one-stop shop for the latest trends in fashion.</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><CheckCircle size={20} /><span>Exclusive deals & offers</span></div>
            <div className="flex items-center gap-3"><CheckCircle size={20} /><span>Track your orders</span></div>
            <div className="flex items-center gap-3"><CheckCircle size={20} /><span>Fast checkout process</span></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 w-full md:w-3/5">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {authMode === 'login' && 'Login'}
              {authMode === 'register' && 'Sign Up'}
              {authMode === 'forgotPassword' && (
                forgotPasswordStep === 'email' ? 'Forgot Password' :
                forgotPasswordStep === 'otp' ? 'Verify OTP' :
                'Set New Password'
              )}
              {authMode === 'resetPassword' && 'Reset Password'}
            </h2>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {renderForm()}

          {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && (
            <>
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage({ type: 'error', text: 'Google login failed. Please try again.' })}
                />
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {authMode === 'login' && "Don't have an account? "}
              {authMode === 'register' && 'Already have an account? '}
              {(authMode === 'forgotPassword' || authMode === 'resetPassword') && 'Remember your password? '}
              <Link
                to={authMode === 'login' ? '/register' : '/login'}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for input fields
const InputField = ({ name, type, placeholder, value, onChange, Icon, required, readOnly, showPasswordToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name.replace('Password', ' Password')}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-100' : ''}`}
        required={required}
        readOnly={readOnly}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => showPasswordToggle.setShowPassword(!showPasswordToggle.showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPasswordToggle.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  </div>
);