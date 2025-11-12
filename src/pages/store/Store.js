import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
// Error logging simplified for better performance
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Star, Package, TrendingUp } from 'lucide-react';
// WebGL animation disabled for performance
// import Silk from '../../components/Silk';
import Navbar from '../../components/Navbar';
// import { useWishlist } from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth';
import { publicAPI } from '../../services/themeAPI';

const AuthModal = lazy(() => import('../../components/AuthModal'));

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme integration
  const [publishedTheme, setPublishedTheme] = useState(null);
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  
  // Auth hook
  const { user, logout, login, validateSession } = useAuth();
  const [sessionStatus, setSessionStatus] = useState('secure'); // secure, checking, warning, invalid
  const [sessionWarnings, setSessionWarnings] = useState([]);

  // Auth modal state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    // Use the authForm state instead of FormData since AuthModal uses controlled inputs
    const data = {
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
      phone: authForm.phone,
    };

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Extract tokens and user data
        const accessToken = result.tokens?.accessToken || result.token;
        const refreshToken = result.tokens?.refreshToken;
        
        // Store tokens properly
        localStorage.setItem('token', accessToken);
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Use the login function from useAuth hook
        login(result.user, accessToken);
        
        toast.success(authMode === 'login' ? 'Login successful!' : 'Registration successful!');
        setShowAuth(false);
        
        // Clear form
        setAuthForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: ''
        });
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error; // Re-throw to let AuthModal handle the error display
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleLoginSuccess = () => {
    // User data is already managed by useAuth hook
    setShowAuth(false);
  };

  // Quick view handler
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || 'M');
    setShowQuickView(true);
  };

  // Helper function to fix image URLs
  const getImageUrl = (product) => {
    const imageFields = [
      product.images?.[0],  // Check full URL first
      product.image, 
      product.imageUrl, 
      product.photo, 
      product.thumbnail
    ];
    
    for (const imageField of imageFields) {
      if (imageField) {
        // If it's already a full URL (contains http), use as is
        if (imageField.includes('http')) {
          return imageField;
        }
        // If it's a relative URL starting with /, prepend the backend URL
        if (imageField.startsWith('/')) {
          return `${process.env.REACT_APP_API_URL}${imageField}`;
        }
        // If it's just a filename, prepend backend URL with /
        if (!imageField.includes('/')) {
          return `${process.env.REACT_APP_API_URL}/${imageField}`;
        }
        // Otherwise, treat as relative path
        return `${process.env.REACT_APP_API_URL}${imageField}`;
      }
    }
    
    return 'https://via.placeholder.com/200?text=No+Image';
  };

  // Simplified error handler to prevent infinite loops
  const handleError = useCallback((error, action) => {
    const context = `Store ${action}`;
    const userMessage = `Failed to ${action}. Please try again.`;
    
    // Simple error logging without heavy context
    console.error(`Error in ${action}:`, error);
    
    setError(`Failed to ${action}. Please try again.`);
    
    // Only log to console in development
    if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
      console.log(`Enhanced error logging disabled for performance`);
    }
  }, []);

  // Add to cart handler with duplicate prevention
  const handleAddToCart = (product, selectedSize = null) => {
    try {
      setCartLoading(true);
      
      if (!product._id || !product.name || !product.price) {
        throw new Error('Invalid product data');
      }

      const size = selectedSize || product.sizes?.[0] || 'M';
      const existingItemIndex = cart.findIndex(
        item => item.id === product._id && item.selectedSize === size
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += 1;
        toast.success(`Updated ${product.name} quantity in cart!`);
      } else {
        // New item, add to cart
        const newItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          image: getImageUrl(product),
          quantity: 1,
          selectedSize: size
        };
        updatedCart = [...cart, newItem];
        toast.success(`${product.name} added to cart!`);
      }
      
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      handleError(error, 'add item to cart');
    } finally {
      setCartLoading(false);
    }
  };

  // Remove from cart handler
  const removeFromCart = (productId, selectedSize) => {
    const updatedCart = cart.filter(
      item => !(item.id === productId && item.selectedSize === selectedSize)
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  // Update cart quantity
  const updateCartQuantity = (productId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    
    const updatedCart = cart.map(item => 
      (item.id === productId && item.selectedSize === selectedSize)
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared');
  };

  // Format price with discount calculation
  const formatPrice = (price, discount = 0) => {
    const finalPrice = discount ? price - (price * discount / 100) : price;
    return finalPrice;
  };

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"} 
      />
    ));
  };
  
  // Enhanced store state
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    onSale: false
  });
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Quick view modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  
  // Cart sidebar state
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  // Wishlist hook (currently unused but may be needed later)
  // const { toggleWishlist, isInWishlist } = useWishlist();

  // Simplified product loading to prevent infinite loops
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load products from backend API instead of localStorage
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.data || data;
        
        // Enhance products with additional properties
        const enhancedProducts = products.map(product => ({
          ...product,
          id: product._id || product.id, // Ensure we have an id field
          rating: product.rating || product.averageRating || null,
          sold: product.sold || product.totalSales || null,
          isNew: product.isNew || false,
          stock: product.stock || 0,
          discount: product.discount || 0,
          showSoldNumbers: product.showSoldNumbers !== false // Default to true unless explicitly disabled
        }));
        
        setProducts(enhancedProducts);
      } else {
        // Fallback to localStorage if API fails
        console.warn('Failed to load from API, falling back to localStorage');
        const localProducts = localStorage.getItem('admin-products');
        if (localProducts) {
          const parsedProducts = JSON.parse(localProducts);
          const enhancedProducts = parsedProducts.map(product => ({
            ...product,
            rating: product.rating || null,
            sold: product.sold || null,
            isNew: product.isNew || false,
            stock: product.stock || 0,
            discount: product.discount || null,
            showSoldNumbers: product.showSoldNumbers !== false
          }));
          setProducts(enhancedProducts);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please check your connection.');
      
      // Fallback to localStorage on network error
      const localProducts = localStorage.getItem('admin-products');
      if (localProducts) {
        try {
          const parsedProducts = JSON.parse(localProducts);
          const enhancedProducts = parsedProducts.map(product => ({
            ...product,
            rating: product.rating || null,
            sold: product.sold || null,
            isNew: product.isNew || false,
            stock: product.stock || 0,
            discount: product.discount || null,
            showSoldNumbers: product.showSoldNumbers !== false
          }));
          setProducts(enhancedProducts);
          setError(null); // Clear error if fallback works
          toast.success('Loaded products from local storage');
        } catch (localError) {
          console.error('Error parsing local products:', localError);
          handleError(localError, 'load products');
        }
      } else {
        handleError(error, 'load products');
      }
      setLoading(false);
    }
  }, [handleError]);

  // Load products
  useEffect(() => {
    loadProducts();
    loadPublishedTheme();
  }, [loadProducts]);

  // Load published theme
  const loadPublishedTheme = async () => {
    try {
      const data = await publicAPI.getPublishedTheme('home');
      if (data?.layout?.sections && data.layout.sections.length > 0) {
        setPublishedTheme(data);
        setShowThemeToggle(true);
        console.log('Store.js: Published theme loaded:', data.layout.sections.length, 'sections');
      }
    } catch (error) {
      console.log('Store.js: No published theme available');
    }
  };

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Simplified session status (no periodic validation to prevent performance issues)
  useEffect(() => {
    if (user) {
      setSessionStatus('secure');
    } else {
      setSessionStatus('invalid');
    }
  }, [user]);

  // Cart functions (currently unused but may be needed later)

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);


  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      setShowAuth(true);
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if user profile is complete - more flexible validation
    const hasName = user?.name && user.name.trim();
    
    // Check for address in multiple possible formats
    const hasAddress = user?.address && (
      (typeof user.address === 'string' && user.address.trim()) ||
      (typeof user.address === 'object' && (user.address.street || user.address.address)) ||
      false
    );
    
    const hasPhone = user?.phone && user.phone.trim();
    
    // Check for province/region in multiple possible formats
    const hasProvince = user?.province || user?.region || user?.city || user?.state;

    // More lenient validation - only require name and phone as essentials
    if (!hasName || !hasPhone) {
      const missingFields = [];
      if (!hasName) missingFields.push('name');
      if (!hasPhone) missingFields.push('phone');
      if (!hasAddress) missingFields.push('address');
      if (!hasProvince) missingFields.push('province/region');
      
      // Only show error for truly missing essential fields
      if (!hasName || !hasPhone) {
        toast.error(`Please complete your profile: ${missingFields.join(', ')}`);
        navigate('/dashboard?tab=profile');
        return;
      } else {
        // Just warn about optional fields but allow checkout
        console.warn('Optional profile fields missing:', missingFields);
      }
    }

    // Validate cart items stock
    const stockErrors = [];
    cart.forEach(item => {
      const product = products.find(p => p._id === item.id);
      if (!product || product.stock < item.quantity) {
        stockErrors.push(`${item.name} - insufficient stock`);
      }
    });

    if (stockErrors.length > 0) {
      toast.error(`Stock issues: ${stockErrors.join(', ')}`);
      return;
    }

    try {
      setCartLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` 
        }, 
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.selectedSize,
          })),
          shippingAddress: {
            name: user.name,
            phone: user.phone,
            address: typeof user.address === 'string' ? user.address : user.address?.street || user.address?.address || '',
            city: user.province,
            zipCode: user.address?.zipCode || ''
          },
          paymentMethod: 'cod',
          totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        })
      });

      const data = await response.json();
      console.log('Order response:', data);

      if (!response.ok) {
        console.error('Order failed:', response.status, data);
        throw new Error(data.message || data.error || data.details || 'Failed to place order');
      }

      if (data.success || data.order) {
        // Clear cart after successful order
        setCart([]);
        localStorage.removeItem('cart');
        
        toast.success('Order placed successfully! You will receive a confirmation shortly.');
        navigate('/dashboard');
      } else {
        throw new Error(data.message || data.error || 'Order placement failed');
      }
      
    } catch (error) {
      // Enhanced checkout error logging
      const context = 'Checkout Process Failed';
      const additionalData = {
        cartItems: cart.length,
        totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        userProfile: {
          hasAddress: !!user?.address,
          hasPhone: !!user?.phone,
          hasName: !!user?.name,
          hasProvince: !!user?.province
        },
        orderData: {
          itemCount: cart.length,
          paymentMethod: 'cod'
        },
        validationPassed: stockErrors.length === 0
      };

      // Error logging removed for performance
      
      console.error('Failed to place order', error);
      handleError(error, 'place order');
    } finally {
      setCartLoading(false);
    }
  };

  // Enhanced filtering and sorting logic (memoized to prevent infinite loops)
  const applyFiltersAndSort = useCallback((products, searchQuery, filters, sortBy) => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.price || 0;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Apply sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => 
        product.discount > 0 || product.onSale || product.discountPercentage > 0
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default:
        // Featured - prioritize featured products
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return filtered;
  }, []);

  // Update filtered products when products, search, filters, or sort change (with dependency fix)
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    const filtered = applyFiltersAndSort(products, searchQuery, filters, sortBy);
    setFilteredProducts(filtered);
  }, [products, searchQuery, filters, sortBy, applyFiltersAndSort]);



  // Wrap lazy-loaded components with Suspense
  // Simple theme section renderer
  const renderThemeSection = (section) => {
    if (section.type === 'hero') {
      const settings = section.settings || {};
      return (
        <section 
          key={section.id}
          className="py-20 px-4 text-center"
          style={{ 
            backgroundColor: settings.backgroundColor || '#1f2937',
            color: settings.textColor || '#ffffff'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">{settings.title || 'Welcome'}</h1>
            <p className="text-xl mb-8">{settings.subtitle || 'Subtitle'}</p>
            {settings.buttonText && (
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                {settings.buttonText}
              </button>
            )}
          </div>
        </section>
      );
    }
    return (
      <div key={section.id} className="py-8 px-4 bg-gray-100 text-center border-2 border-dashed border-gray-300">
        <h3 className="font-medium text-gray-700">{section.type.replace('-', ' ').toUpperCase()} Section</h3>
        <p className="text-sm text-gray-500 mt-2">Content from theme editor</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* WebGL background disabled for performance */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 to-purple-100">
        {/* Simple CSS gradient background instead of heavy WebGL animation */}
      </div>

      {/* Theme Toggle Button */}
      {showThemeToggle && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => setShowThemeToggle(!showThemeToggle)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 text-sm"
          >
            🎨 Theme Editor Active
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        cart={cart}
        onLogout={handleLogout}
        onLogin={() => setShowAuth(true)}
        onCartClick={() => setShowCartSidebar(true)}
        onCheckout={handleCheckout}
        onSearch={setSearchQuery}
        products={products}
      />

      {/* Session Security Status */}
      {user && (
        <div className="fixed top-20 right-4 z-40">
          <div className={`px-3 py-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
            sessionStatus === 'secure' ? 'bg-green-100 border border-green-300 hover:bg-green-200' :
            sessionStatus === 'checking' ? 'bg-yellow-100 border border-yellow-300 hover:bg-yellow-200' :
            sessionStatus === 'warning' ? 'bg-orange-100 border border-orange-300 hover:bg-orange-200' :
            'bg-red-100 border border-red-300 hover:bg-red-200'
          }`}
          onClick={() => navigate('/dashboard?tab=security')}
          title="Click to view session details"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                sessionStatus === 'secure' ? 'bg-green-500 animate-pulse' :
                sessionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                sessionStatus === 'warning' ? 'bg-orange-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`}></div>
              <span className={`text-xs font-medium ${
                sessionStatus === 'secure' ? 'text-green-800' :
                sessionStatus === 'checking' ? 'text-yellow-800' :
                sessionStatus === 'warning' ? 'text-orange-800' :
                'text-red-800'
              }`}>
                {sessionStatus === 'secure' ? 'Session Secure' :
                 sessionStatus === 'checking' ? 'Checking...' :
                 sessionStatus === 'warning' ? `Security Warning (${sessionWarnings.length})` :
                 'Session Invalid'}
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Auth Modal */}
      <Suspense>
        <AuthModal
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          handleAuth={handleAuth}
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          onLoginSuccess={handleLoginSuccess}
          login={login}
        />
      </Suspense>

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Published Theme Content */}
        {publishedTheme && publishedTheme.layout?.sections && (
          <div className="theme-content mb-12">
            <div className="bg-green-100 border border-green-500 text-green-800 px-4 py-2 text-center text-sm rounded-lg mb-6">
              <strong>🎉 THEME EDITOR CONTENT ACTIVE!</strong> Content from Design Editor
            </div>
            {publishedTheme.layout.sections.map((section) => {
              if (section.type === 'hero') {
                const settings = section.settings || {};
                return (
                  <section 
                    key={section.id}
                    className="py-20 px-4 text-center rounded-lg mb-6 shadow-lg"
                    style={{ 
                      backgroundColor: settings.backgroundColor || '#1f2937',
                      color: settings.textColor || '#ffffff'
                    }}
                  >
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-5xl font-bold mb-6">{settings.title || 'Welcome'}</h1>
                      <p className="text-xl mb-8 opacity-90">{settings.subtitle || 'Subtitle'}</p>
                      {settings.buttonText && (
                        <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                          {settings.buttonText}
                        </button>
                      )}
                    </div>
                  </section>
                );
              }
              return (
                <div key={section.id} className="py-8 px-4 bg-gray-100 text-center border border-gray-300 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">{section.type.replace('-', ' ').toUpperCase()} Section</h3>
                  <p className="text-sm text-gray-500">From theme editor</p>
                </div>
              );
            })}
            <div className="bg-blue-100 border border-blue-500 text-blue-800 px-4 py-2 text-center text-sm rounded-lg">
              <strong>⬇️ Original store content below ⬇️</strong>
            </div>
          </div>
        )}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our latest collection of premium products</p>
        </div>
        
        {/* Filters and Sort Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sportswear">Sportswear</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="bestseller">Best Sellers</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 10000 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Additional Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={filters.onSale}
                    onChange={(e) => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">On Sale</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin">
              <ShoppingCart size={48} className="text-blue-600" />
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <p className="text-xl text-gray-600">
              {searchQuery ? `No products found for "${searchQuery}"` : 'No products available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                <div 
                  className="relative w-full h-48 bg-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => handleQuickView(product)}
                >
                  {/* Sale Badge */}
                  {(product.discount > 0 || product.onSale || product.discountPercentage > 0) && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                      {product.discountPercentage || product.discount}% OFF
                    </div>
                  )}
                  
                  {/* New Badge */}
                  {product.newArrival && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                      NEW
                    </div>
                  )}
                  
                  {/* Stock Status */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                      <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                    </div>
                  )}
                  
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 hover:opacity-100 transition-opacity">
                      Quick View
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(product.averageRating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  {/* Price Section */}
                  <div className="mb-3">
                    {product.discount > 0 || product.discountPercentage > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ৳{formatPrice(product.price, product.discountPercentage || product.discount)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ৳{product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        ৳{product.price || 0}
                      </span>
                    )}
                  </div>
                  
                  {/* Stock and Sales Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Package size={12} />
                      <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                    </div>
                    {product.salesCount > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>{product.salesCount} sold</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    disabled={product.stock <= 0 || cartLoading}
                    className={`w-full px-4 py-2 rounded-lg transition font-medium ${
                      product.stock <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } ${cartLoading ? 'opacity-75 cursor-wait' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    {cartLoading ? 'Adding...' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button 
                  onClick={() => setShowCartSidebar(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <button 
                    onClick={() => setShowCartSidebar(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-gray-600 text-xs">Size: {item.selectedSize}</p>
                          <p className="font-bold text-blue-600">৳{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <LogOut size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ৳{cart.reduce((total, item) => total + (item.price * item.quantity), 0)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          handleCheckout();
                          setShowCartSidebar(false);
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Checkout
                      </button>
                      <button 
                        onClick={clearCart}
                        className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Backdrop */}
          <div 
            className="flex-1" 
            onClick={() => setShowCartSidebar(false)}
          ></div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <button 
                  onClick={() => setShowQuickView(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrl(selectedProduct)} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                </div>
                
                <div>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    ৳{selectedProduct.price || 0}
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    {selectedProduct.description || 'No description available'}
                  </p>
                  
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Available Sizes:</h4>
                      <div className="flex gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 border rounded-md text-sm transition-colors ${
                              selectedSize === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'hover:bg-gray-100 border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        handleAddToCart(selectedProduct, selectedSize);
                        setShowQuickView(false);
                      }}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => setShowQuickView(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

