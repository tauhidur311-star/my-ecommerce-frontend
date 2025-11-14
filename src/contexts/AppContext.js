import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cookieManager from '../utils/cookieManager';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  theme: 'light',
  language: 'en',
  currency: 'BDT',
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  preferences: {
    showNotifications: true,
    autoSave: true,
    compactMode: false,
    layout: 'grid'
  },
  notifications: [],
  isLoading: false
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_CURRENCY: 'SET_CURRENCY',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  ADD_RECENTLY_VIEWED: 'ADD_RECENTLY_VIEWED',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  LOAD_FROM_COOKIES: 'LOAD_FROM_COOKIES'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
      
    case actionTypes.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
      
    case actionTypes.SET_THEME:
      cookieManager.setTheme(action.payload);
      return { ...state, theme: action.payload };
      
    case actionTypes.SET_LANGUAGE:
      cookieManager.setLanguage(action.payload);
      return { ...state, language: action.payload };
      
    case actionTypes.SET_CURRENCY:
      cookieManager.setCurrency(action.payload);
      return { ...state, currency: action.payload };
      
    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newCart = [...state.cart, action.payload];
      }
      
      localStorage.setItem(`cart_${cookieManager.getCartId()}`, JSON.stringify(newCart));
      return { ...state, cart: newCart };
      
    case actionTypes.REMOVE_FROM_CART:
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      localStorage.setItem(`cart_${cookieManager.getCartId()}`, JSON.stringify(filteredCart));
      return { ...state, cart: filteredCart };
      
    case actionTypes.UPDATE_CART_QUANTITY:
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      localStorage.setItem(`cart_${cookieManager.getCartId()}`, JSON.stringify(updatedCart));
      return { ...state, cart: updatedCart };
      
    case actionTypes.CLEAR_CART:
      localStorage.removeItem(`cart_${cookieManager.getCartId()}`);
      return { ...state, cart: [] };
      
    case actionTypes.ADD_TO_WISHLIST:
      const existsInWishlist = state.wishlist.find(item => item.id === action.payload.id);
      if (!existsInWishlist) {
        const newWishlist = [...state.wishlist, action.payload];
        localStorage.setItem(`wishlist_${cookieManager.getWishlistId()}`, JSON.stringify(newWishlist));
        return { ...state, wishlist: newWishlist };
      }
      return state;
      
    case actionTypes.REMOVE_FROM_WISHLIST:
      const filteredWishlist = state.wishlist.filter(item => item.id !== action.payload);
      localStorage.setItem(`wishlist_${cookieManager.getWishlistId()}`, JSON.stringify(filteredWishlist));
      return { ...state, wishlist: filteredWishlist };
      
    case actionTypes.ADD_RECENTLY_VIEWED:
      cookieManager.addRecentlyViewed(action.payload);
      const recentlyViewed = cookieManager.getRecentlyViewed();
      return { ...state, recentlyViewed };
      
    case actionTypes.UPDATE_PREFERENCES:
      const newPreferences = { ...state.preferences, ...action.payload };
      Object.keys(action.payload).forEach(key => {
        cookieManager.setCookie(`pref_${key}`, action.payload[key], { maxAge: 31536000 });
      });
      return { ...state, preferences: newPreferences };
      
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };
      
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
      
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case actionTypes.LOAD_FROM_COOKIES:
      return {
        ...state,
        theme: cookieManager.getTheme(),
        language: cookieManager.getLanguage(),
        currency: cookieManager.getCurrency(),
        recentlyViewed: cookieManager.getRecentlyViewed(),
        preferences: {
          showNotifications: cookieManager.getCookie('pref_showNotifications') !== 'false',
          autoSave: cookieManager.getCookie('pref_autoSave') !== 'false',
          compactMode: cookieManager.getCookie('pref_compactMode') === 'true',
          layout: cookieManager.getCookie('pref_layout') || 'grid'
        }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from cookies on mount
  useEffect(() => {
    dispatch({ type: actionTypes.LOAD_FROM_COOKIES });
    
    // Load cart and wishlist
    const cartId = cookieManager.getCartId();
    const wishlistId = cookieManager.getWishlistId();
    
    if (cartId) {
      const savedCart = localStorage.getItem(`cart_${cartId}`);
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        cart.forEach(item => {
          dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
        });
      }
    }
    
    if (wishlistId) {
      const savedWishlist = localStorage.getItem(`wishlist_${wishlistId}`);
      if (savedWishlist) {
        const wishlist = JSON.parse(savedWishlist);
        wishlist.forEach(item => {
          dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: item });
        });
      }
    }

    // Load user data
    const savedUser = localStorage.getItem('user');
    const authToken = cookieManager.getAuthToken() || localStorage.getItem('token');
    
    if (savedUser && authToken) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: actionTypes.SET_USER, payload: user });
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Actions
  const actions = {
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    setAuthenticated: (isAuth) => dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: isAuth }),
    setTheme: (theme) => dispatch({ type: actionTypes.SET_THEME, payload: theme }),
    setLanguage: (language) => dispatch({ type: actionTypes.SET_LANGUAGE, payload: language }),
    setCurrency: (currency) => dispatch({ type: actionTypes.SET_CURRENCY, payload: currency }),
    addToCart: (item) => dispatch({ type: actionTypes.ADD_TO_CART, payload: item }),
    removeFromCart: (itemId) => dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId }),
    updateCartQuantity: (itemId, quantity) => dispatch({ 
      type: actionTypes.UPDATE_CART_QUANTITY, 
      payload: { id: itemId, quantity } 
    }),
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),
    addToWishlist: (item) => dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: item }),
    removeFromWishlist: (itemId) => dispatch({ type: actionTypes.REMOVE_FROM_WISHLIST, payload: itemId }),
    addRecentlyViewed: (productId) => dispatch({ type: actionTypes.ADD_RECENTLY_VIEWED, payload: productId }),
    updatePreferences: (prefs) => dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: prefs }),
    addNotification: (notification) => dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification }),
    removeNotification: (id) => dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id }),
    setLoading: (isLoading) => dispatch({ type: actionTypes.SET_LOADING, payload: isLoading })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export default AppContext;