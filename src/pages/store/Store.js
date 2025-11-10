import { useState, useEffect, Suspense, lazy } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SearchFilters from '../../components/SearchFilters';
import ProductSkeleton from '../../components/ProductSkeleton';
import ZoomableImage from '../../components/ZoomableImage';
import Silk from '../../components/Silk';
import Navbar from '../../components/Navbar'; // Import the new Navbar

const ProductModal = lazy(() => import('../../components/ProductModal'));
const CartSidebar = lazy(() => import('../../components/CartSidebar'));
const AuthModal = lazy(() => import('../../components/AuthModal'));

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc'
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuth(false);
    toast.success(`Welcome, ${loggedInUser.name}!`);
  };

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Update the loadProducts function
  const loadProducts = async () => {
    try {
      // First try to load from local storage
      const localProducts = localStorage.getItem('admin-products');
      if (localProducts) {
        const parsedProducts = JSON.parse(localProducts);
        setProducts(parsedProducts);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
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

      setCart(prevCart => {
        const existingItem = prevCart.find(
          item => item.id === product.id && item.selectedSize === size
        );

        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id && item.selectedSize === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...prevCart, { ...product, quantity: 1, selectedSize: size }];
      });

      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

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
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('You have been logged out.');
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
        await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({
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

  // Add token restoration on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const handleAuth = () => {
    setShowAuth(true);
    setAuthMode('login');
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
        cartCount={cart.length}
        onLogout={() => setShowLogoutConfirm(true)}
        onLogin={handleAuth}
        onCartClick={() => setShowCart(true)}
      />

      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        products={products}
      />

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 pt-28">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products
              .filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                return matchesSearch && matchesCategory;
              })
              .sort((a, b) => {
                if (sortBy === 'price-asc') return a.price - b.price;
                if (sortBy === 'price-desc') return b.price - a.price;
                return 0;
              })
              .map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => setSelectedProduct(product)}
              >
                <ZoomableImage
                  src={(product.images && product.images[0]) || 'https://via.placeholder.com/300'}
                  alt={product.name}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold">৳{product.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wrap lazy-loaded components with Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            addToCart={addToCart}
            isAddingToCart={isAddingToCart}
          />
        )}
      </Suspense>

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
          handleAuth={() => {}} // This can be expanded later
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