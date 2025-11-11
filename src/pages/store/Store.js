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
  const { user, logout, login } = useAuth();

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

  const handleLoginSuccess = () => {
    // User data is already managed by useAuth hook
    setShowAuth(false);
  };

  // Quick view handler
  const handleQuickView = (product) => {
    setSelectedProduct(product);
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

  // Add to cart handler
  const handleAddToCart = (product) => {
    const newItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product),
      quantity: 1,
      selectedSize: product.sizes?.[0] || 'M' // Default size
    };
    
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${product.name} added to cart!`);
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

  // Quick view modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
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
        const enhancedProducts = products.map(product => {
          // Debug: Log product structure to see image field names
          console.log('Product data:', product);
          return {
            ...product,
            id: product._id || product.id, // Ensure we have an id field
            rating: product.rating || product.averageRating || null,
            sold: product.sold || product.totalSales || null,
            isNew: product.isNew || false,
            stock: product.stock || 0,
            discount: product.discount || 0,
            showSoldNumbers: product.showSoldNumbers !== false // Default to true unless explicitly disabled
          };
        });
        
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
          login={login}
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
                <div 
                  className="relative w-full h-48 bg-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => handleQuickView(product)}
                >
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      console.log('Product data for failed image:', product);
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ৳{product.price || 0}
                    </span>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
                      console.log('Quick view image failed to load:', e.target.src);
                      console.log('Selected product data:', selectedProduct);
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
                          <span key={size} className="px-3 py-1 border rounded-md text-sm">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        handleAddToCart(selectedProduct);
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

