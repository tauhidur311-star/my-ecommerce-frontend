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
import '../../styles/animations.css';

const ProductModal = lazy(() => import('../../components/ProductModal'));
const CartSidebar = lazy(() => import('../../components/CartSidebar'));
const AuthModal = lazy(() => import('../../components/AuthModal'));

export default function Store() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(true);
      
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
      setIsLoading(false);
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
      setIsLoading(false);
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
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart size={24} />
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <button 
                    onClick={handleUserClick}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <User size={24} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleUserClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <User size={20} />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Store Content */}
      <div className="container mx-auto px-4 py-8 pt-28">
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
              <span>
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </span>
              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center w-full">
                  <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                </div>
              )}
            </div>

            {/* Enhanced Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <EnhancedProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onProductClick={handleQuickView}
                  onQuickView={handleQuickView}
                  onAddToWishlist={handleWishlistToggle}
                  isWishlisted={isInWishlist(product.id)}
                />
              ))}
            </div>

            {/* Load More / Pagination could go here */}
            {filteredProducts.length > 12 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Wrap lazy-loaded components with Suspense */}
      {/* Enhanced Modals */}
      <Suspense fallback={<div>Loading...</div>}>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            addToCart={addToCart}
            isAddingToCart={isAddingToCart}
          />
        )}
      </Suspense>

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setShowQuickView(false)}
          onAddToCart={(product, size, quantity) => addToCart(product, size)}
          onAddToWishlist={handleWishlistToggle}
          isAddingToCart={isAddingToCart}
          isWishlisted={isInWishlist(quickViewProduct.id)}
        />
      )}

      <Suspense fallback={<div>Loading...</div>}>
        {showCart && (
          <CartSidebar
            showCart={showCart}
            setShowCart={setShowCart}
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            cartTotal={cartTotal}
            handleCheckout={handleCheckout}
          />
        )}
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <AuthModal
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          handleAuth={handleAuthSubmit}
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>


      {showLogoutConfirm && (
        <LogoutConfirmationDialog
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      <BackToTop />
      <Toaster position="bottom-center" />
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