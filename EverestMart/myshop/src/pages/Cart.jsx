import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';

function Cart() {
  const navigate = useNavigate();
  const API_URL = config.API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load cart on mount and listen for updates
  useEffect(() => {
    loadCart();
    
    // ✅ Listen for cart updates from any component
    const handleCartUpdate = () => {
      console.log('🔄 Cart update event received');
      loadCart();
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'cart' || !e.key) {
        console.log('🔄 Storage change detected');
        loadCart();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listeners
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ Load cart from localStorage
  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
      console.log('📦 Cart loaded:', cart.length, 'items');
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    saveCart(updatedCart);
  };

  // ✅ Remove item with confirmation
  const removeItem = (productId) => {
    const item = cartItems.find(i => i._id === productId);
    if (!confirm(`Remove "${item?.name}" from cart?`)) return;
    
    const updatedCart = cartItems.filter(item => item._id !== productId);
    saveCart(updatedCart);
    console.log('🗑️ Item removed from cart');
  };

  // ✅ Clear cart with confirmation
  const clearCart = () => {
    if (cartItems.length === 0) return;
    
    if (!confirm(`Clear all ${cartItems.length} items from cart?`)) return;
    
    saveCart([]);
    console.log('🗑️ Cart cleared');
  };

  // ✅ Save cart to localStorage and dispatch events
  const saveCart = (updatedCart) => {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update state
    setCartItems(updatedCart);
    
    // Dispatch events to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
    
    console.log('💾 Cart saved:', updatedCart.length, 'items');
  };

  // ✅ Calculate totals
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your cart...</p>
      </div>
    );
  }

  // ✅ Empty cart state
  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={styles.emptyIcon}>
          <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9Z" stroke="#E5E2DD" strokeWidth="2"/>
        </svg>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Add products to get started</p>
        <button style={styles.continueBtn} onClick={() => navigate('/products')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  // ✅ Cart with items
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Shopping Cart ({getTotalItems()} items)</h1>
          <button style={styles.clearBtn} onClick={clearCart}>
            🗑️ Clear Cart
          </button>
        </div>

        <div style={styles.itemsContainer}>
          {cartItems.map((item) => (
            <div key={item._id} style={styles.cartItem}>
              <div style={styles.itemImage}>
                {item.image && (
                  <img 
                    src={item.image.startsWith('data:') ? item.image : `${API_URL.replace('/api', '')}${item.image}`}
                    alt={item.name}
                    style={styles.productImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = '#F0EDE8';
                    }}
                  />
                )}
              </div>

              <div style={styles.itemDetails}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemUnit}>{item.unitQuantity} {item.unit}</p>
                <p style={styles.itemPrice}>₹{item.price} each</p>
              </div>

              <div style={styles.itemActions}>
                <div style={styles.quantityControl}>
                  <button 
                    style={styles.quantityBtn}
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button 
                    style={styles.quantityBtn}
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p style={styles.itemTotal}>₹{item.price * item.quantity}</p>

                <button 
                  style={styles.removeBtn}
                  onClick={() => removeItem(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</span>
            <span style={styles.summaryValue}>₹{getTotalPrice()}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Delivery</span>
            {getTotalPrice() >= 250 ? (
              <span style={styles.freeDelivery}>FREE 🎉</span>
            ) : (
              <span style={styles.summaryValue}>₹40</span>
            )}
          </div>
          
          {/* ✅ Delivery hint */}
          {getTotalPrice() < 250 && (
            <div style={styles.deliveryHint}>
              💡 Add ₹{250 - getTotalPrice()} more for FREE delivery!
            </div>
          )}

          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalValue}>
              ₹{getTotalPrice() >= 250 ? getTotalPrice() : getTotalPrice() + 40}
            </span>
          </div>

          {/* ✅ Navigate to Checkout page */}
          <button 
            style={styles.checkoutBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
          
          <button 
            style={styles.continueShoppingBtn}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: '#FFFFFF', 
    padding: '2rem' 
  },
  content: { 
    maxWidth: '1000px', 
    margin: '0 auto' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '2rem', 
    paddingBottom: '1rem', 
    borderBottom: '1px solid #E5E2DD' 
  },
  title: { 
    fontSize: '2rem', 
    fontWeight: '300', 
    color: '#1A1A1A', 
    letterSpacing: '0.5px' 
  },
  clearBtn: { 
    padding: '0.5rem 1rem', 
    background: 'transparent', 
    border: '1px solid #E5E2DD', 
    color: '#ef4444', 
    fontSize: '0.875rem', 
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  itemsContainer: { 
    marginBottom: '2rem' 
  },
  cartItem: { 
    display: 'grid', 
    gridTemplateColumns: '100px 1fr auto', 
    gap: '1.5rem', 
    padding: '1.5rem 0', 
    borderBottom: '1px solid #F0EDE8', 
    alignItems: 'center' 
  },
  itemImage: { 
    width: '100px', 
    height: '100px', 
    background: '#F8F7F5',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productImage: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  itemDetails: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem' 
  },
  itemName: { 
    fontSize: '1rem', 
    fontWeight: '500', 
    color: '#1A1A1A' 
  },
  itemUnit: { 
    fontSize: '0.8125rem', 
    color: '#8B8B8B' 
  },
  itemPrice: { 
    fontSize: '0.875rem', 
    color: '#5A5A5A',
    fontWeight: '500'
  },
  itemActions: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-end', 
    gap: '1rem' 
  },
  quantityControl: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    border: '1px solid #E5E2DD', 
    padding: '0.25rem',
    borderRadius: '6px',
    background: '#FFFFFF'
  },
  quantityBtn: { 
    width: '32px', 
    height: '32px', 
    background: 'transparent', 
    border: 'none', 
    color: '#1A1A1A', 
    fontSize: '1.25rem', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    borderRadius: '4px',
    fontWeight: '600'
  },
  quantity: { 
    fontSize: '0.9375rem', 
    minWidth: '30px', 
    textAlign: 'center',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  itemTotal: { 
    fontSize: '1.25rem', 
    fontWeight: '600', 
    color: '#1A1A1A' 
  },
  removeBtn: { 
    background: 'transparent', 
    border: 'none', 
    color: '#ef4444', 
    fontSize: '0.8125rem', 
    cursor: 'pointer', 
    textDecoration: 'underline',
    transition: 'color 0.2s',
    fontWeight: '500'
  },
  summary: { 
    marginTop: '3rem', 
    padding: '2rem', 
    background: '#F8F7F5',
    borderRadius: '8px'
  },
  summaryRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '1rem' 
  },
  summaryLabel: { 
    fontSize: '0.9375rem', 
    color: '#5A5A5A' 
  },
  summaryValue: { 
    fontSize: '0.9375rem', 
    color: '#1A1A1A',
    fontWeight: '500'
  },
  freeDelivery: {
    fontSize: '0.9375rem',
    color: '#10b981',
    fontWeight: '700'
  },
  deliveryHint: {
    background: '#FFF3CD',
    color: '#856404',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    fontWeight: '500',
    textAlign: 'center'
  },
  totalRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    paddingTop: '1rem', 
    marginTop: '1rem', 
    borderTop: '1px solid #E5E2DD' 
  },
  totalLabel: { 
    fontSize: '1.25rem', 
    fontWeight: '500',
    color: '#1A1A1A'
  },
  totalValue: { 
    fontSize: '1.75rem', 
    fontWeight: '600',
    color: '#1A1A1A'
  },
  checkoutBtn: { 
    width: '100%', 
    padding: '1rem', 
    marginTop: '1.5rem', 
    background: '#1A1A1A', 
    color: '#FFFFFF', 
    border: 'none', 
    fontSize: '0.9375rem', 
    fontWeight: '600', 
    letterSpacing: '0.5px', 
    textTransform: 'uppercase', 
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  continueShoppingBtn: {
    width: '100%',
    padding: '1rem',
    marginTop: '0.75rem',
    background: 'transparent',
    color: '#1A1A1A',
    border: '1px solid #E5E2DD',
    fontSize: '0.9375rem',
    fontWeight: '500',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  // ✅ Loading state
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1rem',
    color: '#8B8B8B'
  },
  // ✅ Empty cart
  emptyCart: { 
    minHeight: '80vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    textAlign: 'center' 
  },
  emptyIcon: { 
    marginBottom: '2rem', 
    opacity: 0.3 
  },
  emptyTitle: { 
    fontSize: '1.5rem', 
    fontWeight: '300', 
    color: '#1A1A1A', 
    marginBottom: '0.5rem' 
  },
  emptyText: { 
    fontSize: '1rem', 
    color: '#8B8B8B', 
    marginBottom: '2rem' 
  },
  continueBtn: { 
    padding: '1rem 2rem', 
    background: '#1A1A1A', 
    color: '#FFFFFF', 
    border: 'none', 
    fontSize: '0.875rem', 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    cursor: 'pointer',
    borderRadius: '6px',
    letterSpacing: '0.5px',
    transition: 'background 0.2s'
  }
};

// ✅ Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  button:active {
    transform: scale(0.98);
  }
`;
document.head.appendChild(styleSheet);

export default Cart;
