import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import config from '../config/config';

const API_URL = config.API_BASE_URL;
const SOCKET_URL = config.SOCKET_URL;

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchMyOrders();

    // Setup socket connection
    const socket = io(SOCKET_URL);

    socket.on('order:statusUpdate', (update) => {
      console.log('📡 Order update:', update);
      setOrders(prev => prev.map(order =>
        order._id === update.orderId
          ? { ...order, orderStatus: update.status }
          : order
      ));
    });

    return () => {
      socket.off('order:statusUpdate');
      socket.disconnect();
    };
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Orders loaded:', response.data);
      const ordersData = response.data.orders || response.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);

      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        { reason: 'Customer requested cancellation' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      alert('✅ Order cancelled successfully');
      fetchMyOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReorder = (order) => {
    const cartItems = order.items.map(item => ({
      _id: item.product?._id || item.productId,
      name: item.product?.name || item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.product?.image || item.image
    }));

    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));

    alert('✅ Items added to cart!');
    navigate('/cart');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: '#f8cb46', bg: '#fef9e7', icon: '○', text: 'Pending' },
      confirmed: { color: '#0c831f', bg: '#e8f5e9', icon: '◉', text: 'Confirmed' },
      preparing: { color: '#0c831f', bg: '#e8f5e9', icon: '◎', text: 'Preparing' },
      out_for_delivery: { color: '#0ea5e9', bg: '#e0f2fe', icon: '➤', text: 'Out for Delivery' },
      delivered: { color: '#0c831f', bg: '#e8f5e9', icon: '✓', text: 'Delivered' },
      cancelled: { color: '#e53935', bg: '#ffebee', icon: '✕', text: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorText}>{error}</p>
        <button onClick={fetchMyOrders} style={styles.retryBtn}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/products')} style={styles.continueBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
            <path d="M20 7H4a1 1 0 00-1 1v11a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1z" />
            <path d="M16 7V5a4 4 0 00-8 0v2" />
          </svg>
          <h2 style={styles.emptyTitle}>No orders yet</h2>
          <p style={styles.emptyText}>When you place an order, it will appear here</p>
          <button onClick={() => navigate('/products')} style={styles.shopBtn}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map(order => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const canCancel = ['pending', 'confirmed', 'preparing'].includes(order.orderStatus);
            const showOTP = order.orderStatus === 'out_for_delivery';
            const isExpanded = expandedOrderId === order._id;
            const itemCount = order.items?.length || 0;

            return (
              <div key={order._id} style={styles.orderCard}>
                {/* Order Header */}
                <div style={styles.orderHeader} onClick={() => toggleExpand(order._id)}>
                  <div style={styles.orderMain}>
                    <div style={styles.orderTop}>
                      <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                      <span style={{
                        ...styles.statusBadge,
                        background: statusConfig.bg,
                        color: statusConfig.color
                      }}>
                        {statusConfig.icon} {statusConfig.text}
                      </span>
                    </div>
                    <div style={styles.orderMeta}>
                      <span style={styles.metaText}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span style={styles.metaDot}>·</span>
                      <span style={styles.metaText}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      <span style={styles.metaDot}>·</span>
                      <span style={styles.metaPrice}>₹{order.totalAmount}</span>
                    </div>
                  </div>
                  <button style={styles.expandBtn}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* OTP Banner */}
                {showOTP && order.deliveryOTP && (
                  <div style={styles.otpBanner}>
                    <div style={styles.otpContent}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <div>
                        <span style={styles.otpLabel}>Delivery OTP</span>
                        <span style={styles.otpCode}>{order.deliveryOTP}</span>
                      </div>
                    </div>
                    <span style={styles.otpHint}>Share with rider</span>
                  </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={styles.expandedContent}>
                    {/* Items */}
                    <div style={styles.section}>
                      <h3 style={styles.sectionTitle}>Items</h3>
                      <div style={styles.itemsList}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <img
                              src={
                                (item.product?.image || item.image || '').startsWith('http') || (item.product?.image || item.image || '').startsWith('data:')
                                  ? (item.product?.image || item.image)
                                  : `${API_URL.replace('/api', '')}${item.product?.image || item.image}`
                              }
                              alt={item.product?.name || item.name}
                              style={styles.itemImage}
                              onError={(e) => e.target.src = '/placeholder.png'}
                            />
                            <div style={styles.itemDetails}>
                              <p style={styles.itemName}>{item.product?.name || item.name}</p>
                              <p style={styles.itemQty}>Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <span style={styles.itemTotal}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    {order.shippingAddress && (
                      <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Delivery Address</h3>
                        <div style={styles.addressBox}>
                          <p style={styles.addressName}>
                            {order.shippingAddress.name || order.shippingAddress.fullName}
                          </p>
                          <p style={styles.addressText}>
                            {order.shippingAddress.street || order.shippingAddress.addressLine1}
                            {order.shippingAddress.area && `, ${order.shippingAddress.area}`}
                          </p>
                          <p style={styles.addressText}>
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode || order.shippingAddress.pincode}
                          </p>
                          <p style={styles.addressPhone}>{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div style={styles.section}>
                      <h3 style={styles.sectionTitle}>Summary</h3>
                      <div style={styles.summaryBox}>
                        <div style={styles.summaryRow}>
                          <span>Subtotal</span>
                          <span>₹{order.totalAmount - (order.deliveryCharges || 0)}</span>
                        </div>
                        <div style={styles.summaryRow}>
                          <span>Delivery</span>
                          <span style={order.deliveryCharges === 0 ? { color: '#10b981' } : {}}>
                            {order.deliveryCharges === 0 ? 'FREE' : `₹${order.deliveryCharges || 40}`}
                          </span>
                        </div>
                        <div style={styles.summaryDivider}></div>
                        <div style={styles.summaryTotal}>
                          <span>Total</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                        <div style={styles.paymentBadge}>
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                      {canCancel && (
                        <button onClick={() => cancelOrder(order._id)} style={styles.cancelBtn}>
                          Cancel Order
                        </button>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <button onClick={() => handleReorder(order)} style={styles.reorderBtn}>
                          Reorder
                        </button>
                      )}
                      <button onClick={() => navigate(`/order/${order._id}`)} style={styles.trackBtn}>
                        Track Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    minHeight: 'calc(100vh - 200px)'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  continueBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },

  // Loading
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #0c831f',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '0.875rem',
    color: '#64748b'
  },

  // Error
  errorContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem'
  },
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: '1rem',
    marginBottom: '0.5rem'
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '1.5rem'
  },
  retryBtn: {
    padding: '0.75rem 1.5rem',
    background: '#0c831f',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: '1.5rem',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '0.9375rem',
    color: '#64748b',
    marginBottom: '1.5rem'
  },
  shopBtn: {
    padding: '0.75rem 2rem',
    background: '#0c831f',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px'
  },

  // Orders List
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  orderCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden'
  },

  // Order Header
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'background 0.15s'
  },
  orderMain: {
    flex: 1
  },
  orderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  orderId: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'monospace'
  },
  statusBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#64748b'
  },
  metaText: {},
  metaDot: {
    color: '#cbd5e1'
  },
  metaPrice: {
    fontWeight: '600',
    color: '#0f172a'
  },
  expandBtn: {
    width: '36px',
    height: '36px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },

  // OTP Banner
  otpBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1.25rem',
    background: '#fef3c7',
    borderTop: '1px solid #fde68a'
  },
  otpContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#92400e'
  },
  otpLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.125rem'
  },
  otpCode: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '0.25em',
    fontFamily: 'monospace'
  },
  otpHint: {
    fontSize: '0.75rem',
    color: '#92400e'
  },

  // Expanded Content
  expandedContent: {
    padding: '1.25rem',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0'
  },

  // Sections
  section: {
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem'
  },

  // Items
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  itemImage: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '6px',
    background: '#f1f5f9'
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#0f172a',
    margin: 0,
    marginBottom: '0.125rem'
  },
  itemQty: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0
  },
  itemTotal: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#0f172a'
  },

  // Address
  addressBox: {
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  addressName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
    marginBottom: '0.5rem'
  },
  addressText: {
    fontSize: '0.8125rem',
    color: '#475569',
    margin: 0,
    marginBottom: '0.25rem',
    lineHeight: '1.5'
  },
  addressPhone: {
    fontSize: '0.8125rem',
    color: '#0f172a',
    fontWeight: '500',
    margin: 0,
    marginTop: '0.5rem'
  },

  // Summary
  summaryBox: {
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#475569',
    marginBottom: '0.5rem'
  },
  summaryDivider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '0.75rem 0'
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.75rem'
  },
  paymentBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    textAlign: 'center',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0'
  },

  // Actions
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  cancelBtn: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: '1px solid #fecaca',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px'
  },
  reorderBtn: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1rem',
    background: '#0c831f',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px'
  },
  trackBtn: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px'
  }
};

// Animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  button:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

if (!document.querySelector('style[data-orders-styles]')) {
  styleSheet.setAttribute('data-orders-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default MyOrders;
