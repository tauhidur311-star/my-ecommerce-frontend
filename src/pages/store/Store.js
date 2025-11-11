import { useState, useEffect, Suspense, lazy } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut } from 'lucide-react';
import Silk from '../../components/Silk';
import Navbar from '../../components/Navbar';
import EnhancedProductCard from '../../components/EnhancedProductCard';
import QuickViewModal from '../../components/QuickViewModal';
import { ProductGridSkeleton } from '../../components/EnhancedProductSkeleton';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import Auth from '../../Auth';
import '../../styles/animations.css';

const ProductModal = lazy(() => import('../../components/ProductModal'));
const CartSidebar = lazy(() => import('../../components/CartSidebar'));
const AuthModal = lazy(() => import('../../components/AuthModal'));

export default function Store() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth hook
  const {
    user,
    showAuth, setShowAuth,
    authMode, setAuthMode,
    authForm, setAuthForm,
    handleAuthSubmit, handleLogout, handleLoginSuccess
  } = useAuth();
  
  // Enhanced store state
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [sortBy] = useState('featured');
  const [filters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    onSale: false
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Wishlist hook
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);


  // Enhanced product loading with filtering
  const loadProducts = async () => {
    try {
      setLoading(true);
      
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
        setFilteredProducts(enhancedProducts);
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
          setFilteredProducts(enhancedProducts);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to localStorage on network error
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
        setFilteredProducts(enhancedProducts);
      }
      setLoading(false);
    }
  };

  // Cart functions
  const addToCart = async (product, size) => {
    if (!size) {
      toast.error('Please select a size');
      return;
    }

    try {
      setIsAddingToCart(true);
      // Simulate a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      let updatedCart;
      setCart(prevCart => {
        const existingItem = prevCart.find(
          item => item.id === product.id && item.selectedSize === size
        );

        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id && item.selectedSize === size
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
        }

        updatedCart = [...prevCart, { ...product, quantity: 1, selectedSize: size }];
        return updatedCart;
      });

      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const removeFromCart = (productId, size) => {
    setCart(prevCart => 
      prevCart.filter(item => !(item.id === productId && item.selectedSize === size))
    );
  };

  const updateQuantity = (productId, size, change) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === productId && item.selectedSize === size) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const handleCheckout = async () => {
    // If the user is not logged in, redirect them to the login page first.
    if (!user) {
      navigate('/login');
      return;
    }

    // --- All logic that requires a user is now safely inside this block ---
    // First, validate that the user's profile is complete.
    const requiredFields = ['name', 'address', 'phone', 'province'];
    const missingFields = requiredFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
      toast.error('Please complete your profile before checking out.');
      navigate('/dashboard'); // Redirect to the dashboard to complete profile.
    } else {
      // If the profile is complete, proceed to create the order.
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }, body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.selectedSize,
          })),
          shippingAddress: {
            name: user.name,
            phone: user.phone,
            address: user.address,
            city: user.province, // Using province as the city
            zipCode: ''
          },
          paymentMethod: 'cod'
        })});
        
        // Clear cart after successful order
        setCart([]);
        localStorage.removeItem('cart');
        
        alert('Order placed successfully!');
        setShowCart(false);
      } catch (error) {
        console.error('Failed to place order', error);
        toast.error('There was an issue placing your order.');
      }
    }
  };

  const showAuthModal = () => {
    setShowAuth(true);
    setAuthMode('login');
  };

  // Enhanced filtering and sorting logic
  const applyFiltersAndSort = (products, searchQuery, filters, sortBy) => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => product.discount > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Featured - no sorting needed
        break;
    }

    return filtered;
  };

  // Update filtered products when products, search, filters, or sort change
  useEffect(() => {
    const filtered = applyFiltersAndSort(products, searchQuery, filters, sortBy);
    setFilteredProducts(filtered);
  }, [products, searchQuery, filters, sortBy]);

  // Enhanced handlers
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const handleWishlistToggle = (productId) => {
    toggleWishlist(productId);
    toast.success(
      isInWishlist(productId) 
        ? 'Removed from wishlist' 
        : 'Added to wishlist'
    );
  };


  // Wrap lazy-loaded components with Suspense
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Silk
          speed={6.5}
          scale={1}
          color="#3612c0"
          noiseIntensity={1.0}
          rotation={0.76}
        />
      </div>

      {/* Navigation */}
      <Navbar
        user={user}
        cart={cart}
        onLogout={() => setShowLogoutConfirm(true)}
        onLogin={showAuthModal}
        onCartClick={() => setShowCart(true)}
        onCheckout={handleCheckout}
        onSearch={setSearchQuery}
        products={products}
      />

      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">StyleShop</h1>
            
            <div className="flex items-center gap-4">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={24} />
              </button>

              {authUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm md:text-base">
                    Welcome, {authUser.name}
                  </span>
                  <button 
                    onClick={handleUserClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="User Dashboard"
                  >
                    <User size={24} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleUserClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  <User size={20} />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <Auth onClose={() => setShowAuth(false)} />
      )}

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our latest collection of premium products</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin">
              <ShoppingCart size={48} className="text-blue-600" />
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <p className="text-xl text-gray-600">No products available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ৳{product.price || 0}
                    </span>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      onClick={() => console.log('Add to cart:', product._id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Add this new component outside the Store function
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return isVisible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  ) : null;
};

// Add this new component for the logout confirmation dialog
const LogoutConfirmationDialog = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Logout</h2>
        <p className="text-gray-600 mb-8">Are you sure you want to log out?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};