// Cookie Management Utility for E-commerce Site
export const cookieManager = {
  
  // Set a cookie with options
  setCookie(name, value, options = {}) {
    const defaults = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
    
    const config = { ...defaults, ...options };
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (config.maxAge) cookieString += `; Max-Age=${config.maxAge}`;
    if (config.expires) cookieString += `; Expires=${config.expires.toUTCString()}`;
    if (config.path) cookieString += `; Path=${config.path}`;
    if (config.domain) cookieString += `; Domain=${config.domain}`;
    if (config.secure) cookieString += `; Secure`;
    if (config.httpOnly) cookieString += `; HttpOnly`;
    if (config.sameSite) cookieString += `; SameSite=${config.sameSite}`;
    
    document.cookie = cookieString;
  },
  
  // Get a cookie value
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  },
  
  // Delete a cookie
  deleteCookie(name, path = '/') {
    document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  },
  
  // Check if a cookie exists
  hasCookie(name) {
    return this.getCookie(name) !== null;
  },
  
  // User Preferences
  setTheme(theme) {
    this.setCookie('theme', theme, { maxAge: 31536000 }); // 1 year
  },
  
  getTheme() {
    return this.getCookie('theme') || 'light';
  },
  
  setLanguage(language) {
    this.setCookie('language', language, { maxAge: 31536000 });
  },
  
  getLanguage() {
    return this.getCookie('language') || 'en';
  },
  
  setCurrency(currency) {
    this.setCookie('currency', currency, { maxAge: 31536000 });
  },
  
  getCurrency() {
    return this.getCookie('currency') || 'BDT';
  },
  
  // Authentication
  setAuthToken(token) {
    this.setCookie('authToken', token, { 
      httpOnly: false, // Can't set HttpOnly from JS, handle server-side
      secure: true,
      sameSite: 'Strict',
      maxAge: 86400 // 24 hours
    });
  },
  
  getAuthToken() {
    return this.getCookie('authToken');
  },
  
  clearAuthToken() {
    this.deleteCookie('authToken');
  },
  
  // Remember Me
  setRememberMe(remember) {
    if (remember) {
      this.setCookie('rememberMe', 'true', { maxAge: 2592000 }); // 30 days
    } else {
      this.deleteCookie('rememberMe');
    }
  },
  
  shouldRemember() {
    return this.getCookie('rememberMe') === 'true';
  },
  
  // Shopping Experience
  setCartId(cartId) {
    this.setCookie('cartId', cartId, { maxAge: 604800 }); // 7 days
  },
  
  getCartId() {
    return this.getCookie('cartId');
  },
  
  setWishlistId(wishlistId) {
    this.setCookie('wishlistId', wishlistId, { maxAge: 2592000 }); // 30 days
  },
  
  getWishlistId() {
    return this.getCookie('wishlistId');
  },
  
  // Recently viewed products
  addRecentlyViewed(productId) {
    const recent = this.getRecentlyViewed();
    const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, 10);
    this.setCookie('recentlyViewed', updated.join(','), { maxAge: 604800 });
  },
  
  getRecentlyViewed() {
    const recent = this.getCookie('recentlyViewed');
    return recent ? recent.split(',') : [];
  },
  
  // Admin Preferences
  setAdminLayout(layout) {
    this.setCookie('adminLayout', layout, { maxAge: 31536000 });
  },
  
  getAdminLayout() {
    return this.getCookie('adminLayout') || 'grid';
  },
  
  setAdminSidebarCollapsed(collapsed) {
    this.setCookie('adminSidebarCollapsed', collapsed.toString(), { maxAge: 31536000 });
  },
  
  isAdminSidebarCollapsed() {
    return this.getCookie('adminSidebarCollapsed') === 'true';
  },
  
  // Compliance
  setCookieConsent(accepted) {
    this.setCookie('cookieConsent', accepted ? 'accepted' : 'rejected', { maxAge: 31536000 });
  },
  
  getCookieConsent() {
    return this.getCookie('cookieConsent');
  },
  
  setGDPRConsent(consented) {
    this.setCookie('gdprConsent', consented.toString(), { maxAge: 31536000 });
  },
  
  hasGDPRConsent() {
    return this.getCookie('gdprConsent') === 'true';
  },
  
  // Analytics & Tracking
  setAnalyticsConsent(consented) {
    this.setCookie('analyticsConsent', consented.toString(), { maxAge: 31536000 });
  },
  
  hasAnalyticsConsent() {
    return this.getCookie('analyticsConsent') === 'true';
  },
  
  setPerformanceTracking(enabled) {
    this.setCookie('performanceTracking', enabled.toString(), { maxAge: 31536000 });
  },
  
  hasPerformanceTracking() {
    return this.getCookie('performanceTracking') === 'true';
  },
  
  // Customer Location
  setCustomerLocation(location) {
    this.setCookie('customerLocation', location, { maxAge: 86400 }); // 1 day
  },
  
  getCustomerLocation() {
    return this.getCookie('customerLocation');
  },
  
  // Clear all site cookies (logout)
  clearAllCookies() {
    const cookies = ['authToken', 'rememberMe', 'cartId', 'wishlistId', 'customerLocation'];
    cookies.forEach(cookie => this.deleteCookie(cookie));
  },
  
  // Get all cookies for debugging
  getAllCookies() {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      if (name) cookies[name] = decodeURIComponent(value || '');
    });
    return cookies;
  }
};

export default cookieManager;