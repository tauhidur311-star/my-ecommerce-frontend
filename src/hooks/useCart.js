import { useState, useEffect, useCallback } from 'react';
import cookieManager from '../utils/cookieManager';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate unique cart ID
  const generateCartId = () => {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Load cart from localStorage and cookies
  useEffect(() => {
    const loadCart = () => {
      try {
        // Get or create cart ID
        let currentCartId = cookieManager.getCartId();
        if (!currentCartId) {
          currentCartId = generateCartId();
          cookieManager.setCartId(currentCartId);
        }
        setCartId(currentCartId);

        // Load cart items from localStorage
        const savedCart = localStorage.getItem(`cart_${currentCartId}`);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cartId && !isLoading) {
      localStorage.setItem(`cart_${cartId}`, JSON.stringify(cart));
      
      // Update cart cookie expiration
      if (cart.length > 0) {
        cookieManager.setCartId(cartId);
      }
    }
  }, [cart, cartId, isLoading]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (cartId) {
      localStorage.removeItem(`cart_${cartId}`);
    }
  }, [cartId]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const isInCart = useCallback((productId) => {
    return cart.some(item => item.id === productId);
  }, [cart]);

  const getCartItemQuantity = useCallback((productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  return {
    cart,
    cartId,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItemQuantity,
    isEmpty: cart.length === 0,
    totalItems: getCartItemCount(),
    totalAmount: getCartTotal()
  };
};

export default useCart;