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
          <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9Z" stroke="#E5E2DD" strokeWidth="2" />
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
                    src={
                      item.image.startsWith('http') || item.image.startsWith('data:')
                        ? item.image
                        : `${API_URL.replace('/api', '')}${item.image}`
                    }
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
    background: '#F3F4F6',
    padding: '2rem 1rem'
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    padding: '1.5rem',
    border: '1px solid #E5E7EB'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #F3F4F6'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: '-0.02em'
  },
  clearBtn: {
    padding: '0.4rem 0.8rem',
    background: '#fee2e2',
    border: 'none',
    color: '#dc2626',
    fontSize: '0.85rem',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontWeight: '600'
  },
  itemsContainer: {
    marginBottom: '2rem'
  },
  cartItem: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '1rem',
    padding: '1.25rem 0',
    borderBottom: '1px solid #F3F4F6',
    alignItems: 'center'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    background: '#F9FAFB',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E5E7EB'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '4px'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1F2937'
  },
  itemUnit: {
    fontSize: '0.8rem',
    color: '#6B7280'
  },
  itemPrice: {
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '600'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #E5E7EB',
    padding: '2px',
    borderRadius: '6px',
    background: '#F9FAFB'
  },
  quantityBtn: {
    width: '28px',
    height: '28px',
    background: 'white',
    border: '1px solid #E5E7EB',
    color: '#0c831f',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    borderRadius: '4px',
    fontWeight: '600'
  },
  quantity: {
    fontSize: '0.9rem',
    minWidth: '24px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#1F2937'
  },
  itemTotal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1F2937'
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#EF4444',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontWeight: '500'
  },
  summary: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem'
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  summaryValue: {
    fontSize: '0.9rem',
    color: '#1F2937',
    fontWeight: '600'
  },
  freeDelivery: {
    fontSize: '0.9rem',
    color: '#0c831f',
    fontWeight: '700'
  },
  deliveryHint: {
    background: '#FFFBEB',
    color: '#B45309',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    fontWeight: '500',
    textAlign: 'center',
    border: '1px solid #FEF3C7'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '1px solid #E5E7EB'
  },
  totalLabel: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937'
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1F2937'
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    marginTop: '1.5rem',
    background: '#0c831f',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  continueShoppingBtn: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    background: 'white',
    color: '#0c831f',
    border: '1px solid #0c831f',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
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
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0c831f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  // ✅ Empty cart
  emptyCart: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background: '#F3F4F6'
  },
  emptyIcon: {
    marginBottom: '1.5rem',
    opacity: 0.5,
    color: '#9CA3AF'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6B7280',
    marginBottom: '2rem'
  },
  continueBtn: {
    padding: '0.75rem 2rem',
    background: '#0c831f',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '8px',
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
