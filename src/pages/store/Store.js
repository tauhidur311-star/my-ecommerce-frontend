import { useState, useEffect, Suspense, lazy } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut } from 'lucide-react';
import Silk from '../../components/Silk';
import Navbar from '../../components/Navbar';
// import { useWishlist } from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth';

const AuthModal = lazy(() => import('../../components/AuthModal'));

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth hook
  const { user, logout } = useAuth();

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
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    // This will be handled by the AuthModal component
  };

  const handleLogout = () => {
    logout();
  };

  const handleLoginSuccess = (userData) => {
    // User data is already managed by useAuth hook
    setShowAuth(false);
  };
  
  // Enhanced store state
  const [sortBy] = useState('featured');
  const [filters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    onSale: false
  });
  
  // Wishlist hook (currently unused but may be needed later)
  // const { toggleWishlist, isInWishlist } = useWishlist();

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
      }
      setLoading(false);
    }
  };

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
      } catch (error) {
        console.error('Failed to place order', error);
        toast.error('There was an issue placing your order.');
      }
    }
  };

  // Enhanced filtering and sorting logic (currently unused but may be needed later)
  // const applyFiltersAndSort = (products, searchQuery, filters, sortBy) => { ... }

  // Update filtered products when products, search, filters, or sort change
  useEffect(() => {
    // Filter logic will be implemented when needed
    // const filtered = applyFiltersAndSort(products, searchQuery, filters, sortBy);
  }, [products, searchQuery, filters, sortBy]);



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
        onLogout={handleLogout}
        onLogin={() => setShowAuth(true)}
        onCartClick={() => console.log('Cart clicked')}
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

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm md:text-base">
                    Welcome, {user.name}
                  </span>
                  <button 
                    onClick={() => navigate('/dashboard')}
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
                  onClick={() => setShowAuth(true)}
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
      <Suspense>
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

