import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config/config';
function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [filter, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // ✅ Validate token
      if (!token) {
        console.error('❌ No authentication token');
        navigate('/login');
        return;
      }

      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;

      console.log('📤 Fetching orders:', params);

      const { data } = await axios.get(`${config.API_BASE_URL}/order-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log('✅ Orders loaded:', data.orders.length);

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const reorder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/order-history/${orderId}/reorder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ ${data.itemsAdded} items added to cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Reorder error:', error);

      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }

      alert(error.response?.data?.error || 'Failed to reorder');
    }
  };

  const cancelOrder = async (orderId) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/order-history/${orderId}/cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Order cancelled successfully');
      loadOrders();
    } catch (error) {
      console.error('Cancel error:', error);

      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }

      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      preparing: '#f59e0b',
      shipped: '#06b6d4',
      out_for_delivery: '#10b981',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>⚠️</div>
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button
            onClick={loadOrders}
            style={styles.shopBtn}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      {/* Filter Tabs */}
      <div style={styles.filters}>
        {['all', 'delivered', 'shipped', 'processing', 'cancelled'].map(status => (
          <button
            key={status}
            style={{
              ...styles.filterBtn,
              ...(filter === status ? styles.activeFilter : {})
            }}
            onClick={() => {
              setFilter(status);
              setPage(1); // ✅ Reset to page 1 when changing filter
            }}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📦</div>
          <h3>No orders found</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" style={styles.shopBtn}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {orders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.orderId}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(order.orderStatus)
                    }}
                  >
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <div key={index} style={styles.item}>
                    <img
                      src={item.image || item.product?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                    />
                    <div style={styles.itemDetails}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemPrice}>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* OTP Display for Out for Delivery */}
              {order.orderStatus === 'out_for_delivery' && order.deliveryOTP && (
                <div style={styles.otpCard}>
                  <div style={styles.otpIcon}>🔐</div>
                  <div style={styles.otpContent}>
                    <h4 style={styles.otpLabel}>Delivery OTP</h4>
                    <div style={styles.otpCode}>{order.deliveryOTP}</div>
                    <p style={styles.otpInstruction}>
                      Share this code with the delivery person
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.deliveryOTP);
                      alert('OTP copied to clipboard!');
                    }}
                    style={styles.copyBtn}
                  >
                    📋 Copy
                  </button>
                </div>
              )}

              {/* Order Footer */}
              <div style={styles.orderFooter}>
                <div style={styles.orderTotal}>
                  <span>Total Amount:</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>
                <div style={styles.orderActions}>
                  <Link
                    to={`/order-details/${order._id}`}
                    style={styles.actionBtn}
                  >
                    View Details
                  </Link>

                  {order.orderStatus === 'delivered' && (
                    <button
                      style={{ ...styles.actionBtn, ...styles.reorderBtn }}
                      onClick={() => reorder(order._id)}
                    >
                      🔄 Reorder
                    </button>
                  )}

                  {['pending', 'confirmed', 'processing'].includes(order.orderStatus) && (
                    <button
                      style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                      onClick={() => cancelOrder(order._id)}
                    >
                      ❌ Cancel
                    </button>
                  )}

                  {['shipped', 'out_for_delivery'].includes(order.orderStatus) && (
                    <Link
                      to={`/track-order/${order._id}`}
                      style={{ ...styles.actionBtn, ...styles.trackBtn }}
                    >
                      📍 Track Order
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{
                  ...styles.pageBtn,
                  ...(page === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                style={{
                  ...styles.pageBtn,
                  ...(page === pagination.pages ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}




const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loading: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    marginBottom: '2rem'
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem'
  },
  filterBtn: {
    padding: '0.75rem 1.5rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  activeFilter: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    borderColor: '#1A1A1A'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F7F5'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  shopBtn: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '1rem 2rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  orderCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    marginBottom: '1.5rem'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #F0EDE8'
  },
  orderId: {
    fontSize: '1.125rem',
    fontWeight: '400',
    margin: 0
  },
  orderDate: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    margin: '0.25rem 0 0'
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  orderItems: {
    padding: '1.5rem'
  },
  item: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid #E5E2DD'
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: '1rem',
    fontWeight: '400',
    margin: '0 0 0.5rem'
  },
  itemPrice: {
    fontSize: '0.875rem',
    color: '#5A5A5A',
    margin: 0
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderTop: '1px solid #F0EDE8',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  orderTotal: {
    fontSize: '1.125rem'
  },
  orderActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '0.75rem 1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    color: '#1A1A1A',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  reorderBtn: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    borderColor: '#1A1A1A'
  },
  cancelBtn: {
    borderColor: '#ef4444',
    color: '#ef4444'
  },
  trackBtn: {
    borderColor: '#10b981',
    color: '#10b981'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem'
  },
  pageBtn: {
    padding: '0.75rem 1.5rem',
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: '#5A5A5A'
  },
  otpCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '8px',
    margin: '1rem 1.5rem',
    color: 'white',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  otpIcon: {
    fontSize: '2.5rem'
  },
  otpContent: {
    flex: 1
  },
  otpLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.9
  },
  otpCode: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '0.5rem',
    margin: '0.5rem 0',
    fontFamily: 'monospace'
  },
  otpInstruction: {
    fontSize: '0.75rem',
    margin: '0.5rem 0 0',
    opacity: 0.9
  },
  copyBtn: {
    padding: '0.75rem 1.25rem',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  }
};

// Add animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  button[style*="copyBtn"]:hover {
    background: rgba(255,255,255,0.3) !important;
    transform: translateY(-2px);
  }
`;
document.head.appendChild(styleSheet);

export default OrderHistory;
