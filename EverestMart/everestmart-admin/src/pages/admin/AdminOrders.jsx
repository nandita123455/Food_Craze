import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAllOrders();
      const ordersData = data.orders || data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders. Check console for details.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, orderStatus: newStatus }
          : order
      ));

      alert(`✅ Order status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || order.orderStatus === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Order Management</h1>
        <div style={styles.stats}>
          <span style={styles.stat}>Total: {orders.length}</span>
          <span style={styles.stat}>Pending: {orders.filter(o => o.orderStatus === 'pending').length}</span>
          <span style={styles.stat}>Delivered: {orders.filter(o => o.orderStatus === 'delivered').length}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by Order ID, customer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.filterButtons}>
          <button
            onClick={() => setFilter('all')}
            style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={filter === 'pending' ? styles.filterBtnActive : styles.filterBtn}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            style={filter === 'confirmed' ? styles.filterBtnActive : styles.filterBtn}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('preparing')}
            style={filter === 'preparing' ? styles.filterBtnActive : styles.filterBtn}
          >
            Preparing
          </button>
          <button
            onClick={() => setFilter('shipped')}
            style={filter === 'shipped' ? styles.filterBtnActive : styles.filterBtn}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('delivered')}
            style={filter === 'delivered' ? styles.filterBtnActive : styles.filterBtn}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div style={styles.empty}>
          <p>No orders found</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            {searchQuery ? 'Try a different search term' : 'Orders will appear here when customers place them'}
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.customerInfo}>
                      <strong>{order.user?.name || 'Guest'}</strong>
                      <small style={styles.smallText}>{order.user?.email || 'N/A'}</small>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {order.items?.length || 0} items
                  </td>
                  <td style={styles.td}>
                    <strong>₹{order.totalAmount}</strong>
                    <br />
                    <span style={{
                      ...styles.paymentBadge,
                      background: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'
                    }}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.paymentBadge,
                      background: order.paymentStatus === 'paid' ? '#10b981' : '#6b7280'
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        background: getStatusColor(order.orderStatus),
                        color: '#FFFFFF'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    <br />
                    <small style={styles.smallText}>
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    shipped: '#06b6d4',
    out_for_delivery: '#6366f1',
    delivered: '#10b981',
    cancelled: '#ef4444'
  };
  return colors[status] || '#6b7280';
};

const styles = {
  container: {
    fontFamily: 'inherit',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    color: '#6B7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0c831f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1F2937',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  stats: {
    display: 'flex',
    gap: '1rem'
  },
  stat: {
    fontSize: '0.9rem',
    color: '#4B5563',
    fontWeight: '600',
    background: '#FFFFFF',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
  },
  filters: {
    marginBottom: '1.5rem',
    background: '#FFFFFF',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#F9FAFB'
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #E5E7EB',
    color: '#6B7280',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  filterBtnActive: {
    padding: '0.5rem 1rem',
    background: '#0c831f',
    border: '1px solid #0c831f',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '600',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: '#9CA3AF',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px'
  },
  tableContainer: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflowX: 'auto',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0'
  },
  tableHeader: {
    background: '#F9FAFB'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #E5E7EB'
  },
  tableRow: {
    transition: 'background 0.1s'
  },
  td: {
    padding: '1rem',
    fontSize: '0.95rem',
    color: '#1F2937',
    verticalAlign: 'top',
    borderBottom: '1px solid #F3F4F6'
  },
  customerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem'
  },
  smallText: {
    fontSize: '0.8rem',
    color: '#6B7280'
  },
  paymentBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '9999px',
    textTransform: 'capitalize'
  },
  statusSelect: {
    padding: '0.4rem 0.8rem',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    textTransform: 'capitalize'
  }
};

export default AdminOrders;
