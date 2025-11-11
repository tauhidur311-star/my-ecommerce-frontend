import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, ShoppingCart, X, Menu, LogIn, LogOut, User, Info, Mail, Shield } from 'lucide-react';
import NavbarDropdown from './NavbarDropdown';

// Mock configuration - in a real app, this would be fetched from an API
const mockNavbarConfig = {
  logoUrl: 'https://raw.githubusercontent.com/user-attachments/assets/5363c127-4f63-421c-a283-1b39332ae28c/react-bits-logo.svg',
  brandName: 'StyleShop',
  links: [
    { text: 'Products', href: '/' },
    { text: 'Cart', href: '/cart' }
  ],
  settingsMenu: {
    about: { text: 'About Us', href: '/about' },
    contact: { text: 'Contact Us', href: '/contact' }
  }
};

const CartHoverPreview = ({ cart, cartTotal, onCheckout }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full right-0 mt-3 w-80 origin-top-right rounded-xl border border-white/10 bg-black/30 p-4 shadow-lg backdrop-blur-xl"
    >
      <h3 className="mb-3 border-b border-white/20 pb-2 text-lg font-semibold text-white">Cart Summary</h3>
      <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
        {cart.map(item => (
          <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between text-sm">
            <div className="flex-grow pr-2">
              <p className="font-medium text-gray-200 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">Size: {item.selectedSize} x{item.quantity}</p>
            </div>
            <p className="flex-shrink-0 font-semibold text-white">৳{item.price * item.quantity}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-white/20 pt-4">
        <div className="mb-4 flex items-center justify-between font-bold text-lg text-white">
          <span>Total:</span>
          <span>৳{cartTotal}</span>
        </div>
        <button onClick={onCheckout} className="w-full rounded-lg bg-purple-600 py-2 font-semibold text-white transition-colors hover:bg-purple-700">
          Checkout
        </button>
      </div>
    </motion.div>
  );
};

const Navbar = ({ user, cart, onLogout, onLogin, onCartClick, onSearch, onCheckout }) => {
  const [config, setConfig] = useState(mockNavbarConfig);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartHovered, setCartHovered] = useState(false);
  let hoverTimeout;

  // Load settings from local storage
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('store-settings');
      if (savedSettings) {
        try {
          setConfig(JSON.parse(savedSettings));
        } catch (e) {
          console.error("Failed to parse store settings", e);
          setConfig(mockNavbarConfig);
        }
      }
    };
    loadSettings();

    const handleStorageChange = (e) => {
      if (e.key === 'store-settings') {
        loadSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const settingsDropdownItems = (
    <>
      <Link to={config.settingsMenu.about.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
        <Info size={16} /> {config.settingsMenu.about.text}
      </Link>
      <Link to={config.settingsMenu.contact.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
        <Mail size={16} /> {config.settingsMenu.contact.text}
      </Link>
      <div className="my-1 h-px bg-white/10" />
      {user ? (
        <>
          <Link to="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
            <User size={16} /> Dashboard
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
              <Shield size={16} /> Admin Dashboard
            </Link>
          )}
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-white/10">
            <LogOut size={16} /> Logout
          </button>
        </>
      ) : (
        <button onClick={onLogin} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
          <LogIn size={16} /> Login / Sign Up
        </button>
      )}
    </>
  );

  const searchDropdown = (
    <div className="p-2 text-gray-200">
      <h4 className="px-2 pb-2 text-sm font-medium">Filter Products</h4>
      {/* Your Search/Filter component can go here */}
      <input 
        type="text" 
        placeholder="Search..." 
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-md border-none bg-white/10 px-3 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500" 
      />
    </div>
  );

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2">
      <nav className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-black/40 to-black/20 p-3 shadow-[0_0_20px_rgba(128,0,255,0.3)] backdrop-blur-lg">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo and Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img src={config.logoUrl} alt="Logo" className="h-7 w-7" />
            <span className="hidden text-xl font-semibold text-white sm:inline">{config.brandName}</span>
          </Link>

          {/* Right Side: Desktop Menu */}
          <div className="hidden items-center gap-6 text-white md:flex">
            {config.links.filter(l => l.text !== 'Cart').map(link => (
              <Link key={link.text} to={link.href} className="rounded-full px-3 py-2 transition-colors hover:bg-white/10">
                {link.text}
              </Link>
            ))}
            
            <div 
              className="relative" 
              onMouseEnter={() => {
                clearTimeout(hoverTimeout);
                setCartHovered(true);
              }} 
              onMouseLeave={() => {
                hoverTimeout = setTimeout(() => setCartHovered(false), 300);
              }}>
              <button onClick={onCartClick} className="relative rounded-full p-2 transition-colors hover:bg-white/10">
                  <ShoppingCart size={20} />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
                    {cart.length}
                    </span>
                  )}
                </button>
              {isCartHovered && cart.length > 0 && (
                <CartHoverPreview cart={cart} cartTotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} onCheckout={onCheckout} />
              )}
            </div>
            
            <div className="relative">
              <button onClick={() => setSearchOpen(!isSearchOpen)} className="rounded-full p-2 transition-colors hover:bg-white/10">
                <Search size={20} />
              </button>
              <NavbarDropdown isOpen={isSearchOpen}>{searchDropdown}</NavbarDropdown>
            </div>

            <div className="relative">
              <button onClick={() => setSettingsOpen(!isSettingsOpen)} className="rounded-full p-2 transition-colors hover:bg-white/10">
                <Settings size={20} />
              </button>
              <NavbarDropdown isOpen={isSettingsOpen}>{settingsDropdownItems}</NavbarDropdown>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={onCartClick} className="relative rounded-full p-2 text-white transition-colors hover:bg-white/10">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full p-2 text-white transition-colors hover:bg-white/10">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4">
                {config.links.filter(l => l.text !== 'Cart').map(link => (
                  <Link key={link.text} to={link.href} className="rounded-md px-3 py-2 text-gray-200 hover:bg-white/10">
                    {link.text}
                  </Link>
                ))}
                <div className="my-1 h-px bg-white/10" />
                {settingsDropdownItems}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Navbar;