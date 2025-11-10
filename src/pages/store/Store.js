import { useState, useEffect, Suspense, lazy } from 'react';
import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import SearchFilters from '../../components/SearchFilters';
import ProductSkeleton from '../../components/ProductSkeleton';
import ZoomableImage from '../../components/ZoomableImage';

const ProductModal = lazy(() => import('../../components/ProductModal'));
const CartSidebar = lazy(() => import('../../components/CartSidebar'));

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [user, setUser] = useState(null);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc'

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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

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

  // Wrap lazy-loaded components with Suspense
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Fashion Store</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Heart size={24} />
              </button>
              <div 
                className="relative"
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
              >
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                {isCartHovered && cart.length > 0 && (
                  <CartHoverPreview cart={cart} cartTotal={cartTotal} />
                )}
              </div>
              {user && (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full" title="My Dashboard">
                    <User size={24} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              {!user && (
                <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full">
                  <User size={24} />
                </Link>)}
            </div>
          </div>
        </div>
      </nav>

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
      <div className="container mx-auto px-4 py-8">
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
                  src={product.image || 'https://via.placeholder.com/300'}
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

// Add this new component for the cart hover preview
const CartHoverPreview = ({ cart, cartTotal }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Cart Summary</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {cart.map(item => (
          <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center text-sm">
            <div className="flex-grow pr-2">
              <p className="font-medium text-gray-700 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-gray-800">x{item.quantity}</p>
              <p className="font-semibold">৳{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t mt-3 pt-3 flex justify-between items-center font-bold text-lg">
        <span>Total:</span>
        <span>৳{cartTotal}</span>
      </div>
    </div>
  );
};