import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ============================================
// CONTEXT SETUP
// ============================================
const CartContext = createContext();

// ============================================
// CUSTOM HOOK TO USE CART
// ============================================
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// ============================================
// CART PROVIDER COMPONENT
// ============================================
export function CartProvider({ children }) {
  // ============================================
  // STATE
  // ============================================
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // HELPER: Check User Type
  // ============================================
  const getUserType = () => {
    // Check for rider
    const riderStr = localStorage.getItem('rider');
    if (riderStr) {
      try {
        const rider = JSON.parse(riderStr);
        return { type: 'rider', data: rider };
      } catch (e) {
        console.error('Error parsing rider data:', e);
      }
    }

    // Check for user (customer or admin)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin || user.role === 'admin') {
          return { type: 'admin', data: user };
        }
        return { type: 'customer', data: user };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    return { type: 'guest', data: null };
  };

  // ============================================
  // HELPER: Check if Rider or Admin
  // ============================================
  const isRiderOrAdmin = () => {
    const { type } = getUserType();
    return type === 'rider' || type === 'admin';
  };

  // ============================================
  // HELPER: Check if Customer
  // ============================================
  const isCustomer = () => {
    const { type } = getUserType();
    return type === 'customer';
  };

  // ============================================
  // HELPER: Get Auth Token
  // ============================================
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // ============================================
  // LOAD CART (from backend or localStorage)
  // ============================================
  const loadCart = async () => {
    // Don't load cart for riders/admins
    if (isRiderOrAdmin()) {
      console.log('⚠️ Skipping cart load - user is rider/admin');
      setCart([]);
      return;
    }

    try {
      const token = getToken();

      // If not logged in, use localStorage
      if (!token) {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('📦 Loaded cart from localStorage:', localCart.length, 'items');
        setCart(localCart);
        return;
      }

      // If logged in as customer, fetch from backend
      console.log('📡 Fetching cart from backend...');
      const { data } = await axios.get(`http://localhost:5000`http://localhost:5000'}/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

    console.log('✅ Cart loaded from backend:', data.cart?.length || 0, 'items');
    setCart(data.cart || []);
    setError(null);

  } catch (err) {
    console.error('❌ Load cart error:', err.response?.status, err.message);

    // If forbidden (rider/admin trying to access cart)
    if (err.response?.status === 403) {
      console.warn('⚠️ Cart access forbidden - user is rider/admin');
      setCart([]);
      return;
    }

    // For other errors, fallback to localStorage
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('⚠️ Using localStorage fallback:', localCart.length, 'items');
    setCart(localCart);
    setError('Failed to load cart from server');
  }
};

// ============================================
// ADD TO CART
// ============================================
const addToCart = async (product, quantity = 1) => {
  // Block riders/admins from adding to cart
  if (isRiderOrAdmin()) {
    console.warn('⚠️ Riders and admins cannot add items to cart');
    return {
      success: false,
      error: 'Cart is only available for customers'
    };
  }

  try {
    setLoading(true);
    setError(null);
    const token = getToken();

    // ============================================
    // GUEST USER - Use localStorage
    // ============================================
    if (!token) {
      console.log('📦 Adding to localStorage cart:', product.name);

      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = localCart.findIndex(
        item => item.productId === product._id
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        localCart[existingItemIndex].quantity += quantity;
        console.log('✅ Updated quantity for:', product.name);
      } else {
        // Add new item
        localCart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image || '/placeholder.png',
          quantity
        });
        console.log('✅ Added new item:', product.name);
      }

      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart);

      // Notify other components
      window.dispatchEvent(new Event('cartUpdated'));

      return { success: true };
    }

    // ============================================
    // LOGGED IN CUSTOMER - Use backend
    // ============================================
    console.log('📡 Adding to backend cart:', product.name);

    const { data } = await axios.post(
      `http://localhost:5000`http://localhost:5000'}/api/cart/add',
      {
        productId: product._id,
        quantity
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Added to backend cart');
    setCart(data.cart || []);

    // Notify other components
    window.dispatchEvent(new Event('cartUpdated'));

    return { success: true };

  } catch (err) {
    console.error('❌ Add to cart error:', err);
    const errorMessage = err.response?.data?.error || 'Failed to add to cart';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ============================================
// REMOVE FROM CART
// ============================================
const removeFromCart = async (productId) => {
  // Block riders/admins
  if (isRiderOrAdmin()) {
    console.warn('⚠️ Riders and admins cannot modify cart');
    return;
  }

  try {
    setError(null);
    const token = getToken();

    // ============================================
    // GUEST USER - Remove from localStorage
    // ============================================
    if (!token) {
      console.log('📦 Removing from localStorage cart');

      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const newCart = localCart.filter(item => item.productId !== productId);

      localStorage.setItem('cart', JSON.stringify(newCart));
      setCart(newCart);

      window.dispatchEvent(new Event('cartUpdated'));
      console.log('✅ Removed from localStorage');
      return;
    }

    // ============================================
    // LOGGED IN CUSTOMER - Remove from backend
    // ============================================
    console.log('📡 Removing from backend cart');

    const { data } = await axios.delete(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Removed from backend cart');
    setCart(data.cart || []);

    window.dispatchEvent(new Event('cartUpdated'));

  } catch (err) {
    console.error('❌ Remove from cart error:', err);
    setError('Failed to remove from cart');
  }
};

// ============================================
// UPDATE QUANTITY
// ============================================
const updateQuantity = async (productId, quantity) => {
  // Block riders/admins
  if (isRiderOrAdmin()) {
    console.warn('⚠️ Riders and admins cannot modify cart');
    return;
  }

  // Validate quantity
  if (quantity < 1) {
    console.warn('⚠️ Quantity must be at least 1');
    return;
  }

  try {
    setError(null);
    const token = getToken();

    // ============================================
    // GUEST USER - Update in localStorage
    // ============================================
    if (!token) {
      console.log('📦 Updating quantity in localStorage');

      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = localCart.find(i => i.productId === productId);

      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCart(localCart);
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('✅ Updated quantity in localStorage');
      }
      return;
    }

    // ============================================
    // LOGGED IN CUSTOMER - Update in backend
    // ============================================
    console.log('📡 Updating quantity in backend');

    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${productId}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Updated quantity in backend');
    setCart(data.cart || []);

    window.dispatchEvent(new Event('cartUpdated'));

  } catch (err) {
    console.error('❌ Update quantity error:', err);
    setError('Failed to update quantity');
  }
};

// ============================================
// CLEAR CART
// ============================================
const clearCart = async () => {
  // Block riders/admins
  if (isRiderOrAdmin()) {
    console.warn('⚠️ Riders and admins cannot modify cart');
    return;
  }

  try {
    setError(null);
    const token = getToken();

    // ============================================
    // GUEST USER - Clear localStorage
    // ============================================
    if (!token) {
      console.log('📦 Clearing localStorage cart');
      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));
      console.log('✅ Cleared localStorage cart');
      return;
    }

    // ============================================
    // LOGGED IN CUSTOMER - Clear backend cart
    // ============================================
    console.log('📡 Clearing backend cart');

    await axios.delete(`http://localhost:5000`http://localhost:5000'}/api/cart/clear', {
      headers: { Authorization: `Bearer ${token}` }
      });

  console.log('✅ Cleared backend cart');
  setCart([]);

  window.dispatchEvent(new Event('cartUpdated'));

} catch (err) {
  console.error('❌ Clear cart error:', err);
  setError('Failed to clear cart');
}
  };

// ============================================
// GET CART COUNT (total items)
// ============================================
const getCartCount = () => {
  return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

// ============================================
// GET CART TOTAL (total price)
// ============================================
const getCartTotal = () => {
  return cart.reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
};

// ============================================
// SYNC GUEST CART TO BACKEND (after login)
// ============================================
const syncGuestCart = async () => {
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (localCart.length === 0) {
    console.log('⚠️ No local cart to sync');
    return;
  }

  console.log('🔄 Syncing', localCart.length, 'items from localStorage to backend');

  try {
    const token = getToken();
    if (!token) return;

    // Add each item to backend cart
    for (const item of localCart) {
      await axios.post(
        `http://localhost:5000`http://localhost:5000'}/api/cart/add',
        {
          productId: item.productId,
          quantity: item.quantity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // Clear localStorage cart after sync
    localStorage.removeItem('cart');
    console.log('✅ Cart synced and localStorage cleared');

    // Reload cart from backend
    await loadCart();

  } catch (err) {
    console.error('❌ Cart sync error:', err);
  }
};

// ============================================
// LOAD CART ON MOUNT
// ============================================
useEffect(() => {
  const userType = getUserType();
  console.log('🎯 User type detected:', userType.type);

  // Only load cart for customers and guests
  if (userType.type === 'customer' || userType.type === 'guest') {
    loadCart();
  } else {
    console.log('⚠️ Cart disabled for', userType.type);
    setCart([]);
  }
}, []); // Run once on mount

// ============================================
// CONTEXT VALUE
// ============================================
const value = {
  // State
  cart,
  loading,
  error,

  // Actions
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  refreshCart: loadCart,
  syncGuestCart,

  // Computed values
  getCartCount,
  getCartTotal,

  // User type checks
  isRiderOrAdmin: isRiderOrAdmin(),
  isCustomer: isCustomer(),
  getUserType
};

return (
  <CartContext.Provider value={value}>
    {children}
  </CartContext.Provider>
);
}
