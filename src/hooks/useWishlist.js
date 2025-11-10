/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${baseURL}/api/wishlist${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  };

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated()) {
        // Load from backend
        const data = await apiRequest('/');
        setWishlist(data.wishlist.itemIds);
        setWishlistItems(data.wishlist.items);
      } else {
        // Load from localStorage for non-authenticated users
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const localWishlist = JSON.parse(savedWishlist);
          setWishlist(localWishlist);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (parseError) {
          console.error('Error parsing local wishlist:', parseError);
          setWishlist([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const syncWithBackend = async (localWishlistIds) => {
    if (!isAuthenticated() || syncing) return;
    
    try {
      setSyncing(true);
      const products = JSON.parse(localStorage.getItem('admin-products') || '[]');
      
      await apiRequest('/sync', {
        method: 'POST',
        body: JSON.stringify({
          localWishlistIds,
          products
        })
      });
      
      // Reload wishlist after sync
      await loadWishlist();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const saveToLocalStorage = (newWishlist) => {
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  const addToWishlist = async (productId, productData = null) => {
    try {
      if (wishlist.includes(productId)) {
        return; // Already in wishlist
      }

      const newWishlist = [...wishlist, productId];

      if (isAuthenticated()) {
        // Add to backend
        const data = await apiRequest('/add', {
          method: 'POST',
          body: JSON.stringify({
            productId,
            productData
          })
        });
        
        setWishlist(data.wishlist.itemIds);
        setWishlistItems(data.wishlist.items);
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
      } else {
        // Add to localStorage for non-authenticated users
        saveToLocalStorage(newWishlist);
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const newWishlist = wishlist.filter(id => id !== productId);

      if (isAuthenticated()) {
        // Remove from backend
        const data = await apiRequest(`/remove/${productId}`, {
          method: 'DELETE'
        });
        
        setWishlist(data.wishlist.itemIds);
        setWishlistItems(data.wishlist.items);
      } else {
        // Remove from localStorage for non-authenticated users
        saveToLocalStorage(newWishlist);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const toggleWishlist = async (productId, productData = null) => {
    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, productData);
    }
  };

  const clearWishlist = async () => {
    try {
      if (isAuthenticated()) {
        // Clear backend wishlist
        await apiRequest('/clear', {
          method: 'DELETE'
        });
        
        setWishlist([]);
        setWishlistItems([]);
      } else {
        // Clear localStorage for non-authenticated users
        localStorage.removeItem('wishlist');
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const getWishlistStats = async () => {
    if (!isAuthenticated()) return null;
    
    try {
      const data = await apiRequest('/stats');
      return data.stats;
    } catch (error) {
      console.error('Error getting wishlist stats:', error);
      return null;
    }
  };

  // Auto-sync when user logs in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !syncing) {
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (localWishlist.length > 0) {
        syncWithBackend(localWishlist);
      }
    }
  }, [syncing]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, loading]);

  return {
    wishlist,
    wishlistItems,
    loading,
    syncing,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistStats,
    syncWithBackend,
    loadWishlist,
    wishlistCount: wishlist.length
  };
};