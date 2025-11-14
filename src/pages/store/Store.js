import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
// Error logging simplified for better performance
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Star, Package, TrendingUp } from 'lucide-react';
// WebGL animation disabled for performance
// import Silk from '../../components/Silk';
import Navbar from '../../components/Navbar';
// import { useWishlist } from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth.js';
import { publicAPI } from '../../services/themeAPI';
import useThemeUpdates from '../../hooks/useThemeUpdates.js';
import { usePublishedTheme } from '../../hooks/useThemeData.js';
import SafeSectionRenderer from '../../components/SafeSectionRenderer';

const AuthModal = lazy(() => import('../../components/AuthModal.js'));

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme integration with real-time updates
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewLayout, setPreviewLayout] = useState(null);
  
  // Use theme data hook with cache invalidation
  const { data: themeData, isLoading: themeLoading, error: themeError, refetch } = usePublishedTheme('home');
  
  // SSE connection for real-time theme updates
  useThemeUpdates({
    enabled: true,
    onUpdate: (data) => {
      console.log('Theme update received in storefront:', data);
      if (data.pageType === 'home') {
        toast.success('Page updated! 🚀');
        refetch(); // Refetch theme data
      }
    },
    onError: (error) => {
      console.error('Theme updates SSE error in storefront:', error);
    }
  });

  // Listen for preview updates from admin editor via postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'preview-update') {
        console.log('Received preview update:', event.data.layout);
        setIsPreviewMode(true);
        setPreviewLayout(event.data.layout);
      } else if (event.data.type === 'template-published') {
        console.log('Template published, refetching...');
        setIsPreviewMode(false);
        setPreviewLayout(null);
        refetch();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch]);

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
  }, [loadProducts]);


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

      {/* Theme-based Content */}
      <main className="relative z-10">
        {/* Preview mode indicator */}
        {isPreviewMode && (
          <div className="bg-orange-100 border border-orange-300 px-4 py-2 text-center text-sm font-medium text-orange-800">
            🔄 Preview Mode - Changes are not published yet
          </div>
        )}

        {/* Theme Loading State */}
        {themeLoading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading theme...</p>
            </div>
          </div>
        )}

        {/* Theme Error State */}
        {themeError && !isPreviewMode && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading theme: {themeError.message}</p>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Render Theme Sections */}
        {!themeLoading && !themeError && (
          <div className="theme-sections">
            {/* Use preview layout if in preview mode, otherwise use published theme data */}
            {(() => {
              const currentLayout = isPreviewMode ? previewLayout : themeData?.layout;
              const sections = currentLayout?.sections || [];

              if (sections.length === 0) {
                return (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Store</h1>
                      <p className="text-xl text-gray-600 mb-8">No theme sections configured yet</p>
                      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
                        {products.slice(0, 6).map(product => (
                          <div key={product._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="aspect-square bg-gray-200 rounded-md mb-4 overflow-hidden">
                              <img 
                                src={getImageUrl(product)} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                }}
                              />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-blue-600 font-bold">৳{product.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return sections.map((section, index) => (
                <SafeSectionRenderer
                  key={`${section.id || section.type}-${index}`}
                  section={section}
                  products={products}
                  onAddToCart={handleAddToCart}
                />
              ));
            })()}
          </div>
        )}
      </main>

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

      {/* Cart Sidebar and Modals */}
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

