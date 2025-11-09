import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast, { Toaster } from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode from URL query params, default to 'login'
  const initialMode = new URLSearchParams(location.search).get('mode') || 'login';
  const [authMode, setAuthMode] = useState(initialMode);

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

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

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
      handleAuthSuccess(data);
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
      toast.success(data.message);
      setAuthMode('resetPassword');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
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
      setFormData({ name: '', email: '', password: '', otp: '' });
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
            <InputField name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} Icon={Lock} required showPasswordToggle={{ showPassword, setShowPassword }} />
            <InputField name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} Icon={Lock} required />
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
        );
      case 'forgotPassword':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600">Enter your email to receive a password reset OTP.</p>
            <InputField name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} Icon={Mail} required />
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        );
      case 'resetPassword':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField name="email" type="email" value={formData.email} Icon={Mail} readOnly />
            <InputField name="otp" type="text" placeholder="123456" value={formData.otp} onChange={handleInputChange} Icon={Lock} required />
            <InputField name="password" type="password" placeholder="New Password" value={formData.password} onChange={handleInputChange} Icon={Lock} required />
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        );
      default: // login
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Login fields */}
            <InputField name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} Icon={Mail} required />
            <InputField name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} Icon={Lock} required showPasswordToggle={{ showPassword, setShowPassword }} />
            <div className="text-sm text-right"><button type="button" onClick={() => setAuthMode('forgotPassword')} className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</button></div>
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Logging in...' : 'Login'}</button>
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
              {authMode === 'forgotPassword' && 'Forgot Password'}
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
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
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

```

### Step 2: Update Your App's Routing

Next, I'll update `App.js` to include the new `/auth` route and remove the old logic that passed authentication props to the `Store`.

```diff
--- a/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\App.js
+++ b/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\App.js
@@ -2,6 +2,7 @@
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import Store from './pages/store/Store';
 import AdminDashboard from './pages/admin/AdminDashboard';
+import AuthPage from './pages/auth/AuthPage';
 import ProtectedRoute from './components/ProtectedRoute';
 import './App.css';
 
@@ -18,13 +19,10 @@
       <Routes>
         <Route 
           path="/" 
-          element={
-            <Store 
-              isLoggedIn={isLoggedIn} 
-            />
-          } 
+          element={<Store />} 
         />
+        <Route path="/auth" element={<AuthPage />} />
         <Route 
           path="/admin" 
           element={

```

### Step 3: Update the `Store` Component

Now, I'll simplify the `Store.js` component by removing all the authentication state and logic. The login button will now be a simple link that navigates to our new `/auth` page.

```diff
--- a/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\pages\store\Store.js
+++ b/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\pages\store\Store.js
@@ -1,7 +1,7 @@
 import { useState, useEffect, Suspense, lazy } from 'react';
 import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
 import toast, { Toaster } from 'react-hot-toast';
-import { useNavigate } from 'react-router-dom';
+import { useNavigate, Link } from 'react-router-dom';
 import SearchFilters from '../../components/SearchFilters';
 import ProductSkeleton from '../../components/ProductSkeleton';
 import AuthModal from '../../components/AuthModal';
@@ -10,22 +10,13 @@
 const CartSidebar = lazy(() => import('../../components/CartSidebar'));
 
 export default function Store() {
-  const navigate = useNavigate();
   const [products, setProducts] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [cart, setCart] = useState([]);
   const [showCart, setShowCart] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState(null);
   const [selectedSize, setSelectedSize] = useState('');
   const [user, setUser] = useState(null);
-  const [showAuth, setShowAuth] = useState(false);
-  const [authMode, setAuthMode] = useState('login');
-  const [authForm, setAuthForm] = useState({
-    name: '',
-    email: '',
-    password: ''
-  });
-  const [authError, setAuthError] = useState(null);
-  const [isAuthLoading, setIsAuthLoading] = useState(false);
   const [isAddingToCart, setIsAddingToCart] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('all');
@@ -133,31 +124,6 @@
 
   const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 
-  // Authentication functions
-  const handleAuth = async (e) => {
-    e.preventDefault();
-    setAuthError(null);
-    setIsAuthLoading(true);
-
-    try {
-      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
-      const response = await fetch(`${process.env.REACT_APP_API_URL}/api${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) });
-      const data = await response.json();
-
-      if (!response.ok) {
-        // Throw an error to be caught by the modal's handleSubmit
-        throw new Error(data.error || `Failed to ${authMode}`);
-      }
-
-      localStorage.setItem('token', data.token);
-      localStorage.setItem('user', JSON.stringify(data.user));
-      
-      setUser(data.user);
-      setShowAuth(false);
-      setAuthForm({ name: '', email: '', password: '' });
-
-      if (authMode === 'register') {
-        toast.success('Welcome! Your account has been created.');
-        // Redirect to home page after registration
-        navigate('/'); 
-      } else {
-        toast.success('Successfully logged in!');
-      }
-    } catch (error) {
-      // Re-throw the error so the modal can display it
-      throw error;
-    } finally {
-      setIsAuthLoading(false);
-    }
-  };
-
   const handleLogout = () => {
     setUser(null);
     localStorage.removeItem('token');
@@ -168,7 +134,7 @@
   };
 
   const handleCheckout = async () => {
-    if (!user) {
-      setShowAuth(true);
-      return;
-    }
+    if (!user) { navigate('/auth'); return; }
 
     try {
       await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({
@@ -296,14 +262,11 @@
                 </div>
               )}
               {!user && (
-                <button
-                  onClick={() => {
-                    setShowAuth(true);
-                  }}
-                  className="p-2 hover:bg-gray-100 rounded-full"
-                >
+                <Link to="/auth" className="p-2 hover:bg-gray-100 rounded-full">
                   <User size={24} />
-                </button>)}
+                </Link>
+              )}
             </div>
           </div>
         </div>
@@ -400,26 +363,6 @@
         )}
       </Suspense>
 
-      {showAuth && (
-        <AuthModal
-          showAuth={showAuth}
-          setShowAuth={setShowAuth}
-          handleAuth={handleAuth}
-          authMode={authMode}
-          setAuthMode={setAuthMode}
-          authForm={authForm}
-          setAuthForm={setAuthForm}
-          isLoading={isAuthLoading}
-          error={authError}
-          onLoginSuccess={(user) => {
-            setUser(user);
-            setShowAuth(false);
-          }}
-        />
-      )}
-
       <BackToTop />
       <Toaster position="bottom-center" />
     </div>

```

### Step 4: Update the Protected Route

Finally, let's update `ProtectedRoute.js` to redirect unauthenticated users to our new `/auth` page instead of the home page.

```diff
--- a/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\components\ProtectedRoute.js
+++ b/c:\Users\Administrator\Desktop\my-ecommerce-site\frontend\src\components\ProtectedRoute.js
@@ -5,8 +5,8 @@
 
   // Check if user exists and if their role is 'admin'
   if (!user || user.role !== 'admin') {
-    // If not an admin, redirect to the home page
-    return <Navigate to="/" replace />;
+    // If not an admin, redirect to the auth page
+    return <Navigate to="/auth" replace />;
   }
 
   return children;

```

### How to Push These Changes

Here are the commands to get this major architectural improvement live on your website.

1.  **Open your terminal.**

2.  **Navigate to your frontend project directory:**
    ```bash
    cd c:\Users\Administrator\Desktop\my-ecommerce-site\frontend
    ```

3.  **Stage all the new and modified files:**
    ```bash
    git add .
    ```

4.  **Commit the changes:**
    ```bash
    git commit -m "Refactor: Create standalone authentication page"
    ```

5.  **Push the commit to GitHub:**
    ```bash
    git push
    ```

After you push these changes, Netlify will redeploy your site. Now, clicking the login icon will take you to a dedicated `/auth` page, completely separating your store's display logic from your authentication flow and making your application much more stable.