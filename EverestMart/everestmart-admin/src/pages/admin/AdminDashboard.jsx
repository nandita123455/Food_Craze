import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import './AdminDashboard.css';
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRiders: 0,
    activeRiders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all orders
      const ordersResponse = await adminApi.getAllOrders();
      const ordersData = ordersResponse.data.orders || ordersResponse.data || [];

      // Get all products
      const productsResponse = await adminApi.getAllProducts();
      const productsData = productsResponse.data.products || productsResponse.data || [];

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = ordersData.filter(o => o.orderStatus === 'pending').length;
      const completedOrders = ordersData.filter(o => o.orderStatus === 'delivered').length;
      const lowStockProducts = productsData.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;

      setStats({
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        totalProducts: productsData.length,
        lowStockProducts: lowStockProducts,
        totalUsers: 0,
        totalRiders: 0
      });

      // Set recent orders (last 5)
      setRecentOrders(ordersData.slice(0, 5));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.welcomeSection}>
        <div>
          <h1 style={styles.welcomeTitle}>Dashboard Overview</h1>
          <p style={styles.welcomeSubtitle}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.totalOrders}</div>
            <div style={styles.statLabel}>Total Orders</div>
            <div style={styles.statChange}>
              <span style={{ color: '#10b981' }}>↑ {stats.completedOrders} completed</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{stats.totalRevenue.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statChange}>
              <span style={{ color: '#10b981' }}>From {stats.completedOrders} orders</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.pendingOrders}</div>
            <div style={styles.statLabel}>Pending Orders</div>
            <div style={styles.statChange}>
              <span style={{ color: stats.pendingOrders > 0 ? '#f59e0b' : '#6b7280' }}>
                Requires attention
              </span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.totalProducts}</div>
            <div style={styles.statLabel}>Total Products</div>
            <div style={styles.statChange}>
              <span style={{ color: stats.lowStockProducts > 0 ? '#ef4444' : '#10b981' }}>
                {stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All in stock'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          <a href="/orders" style={styles.viewAllLink}>View All →</a>
        </div>

        {recentOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <p style={styles.emptyText}>No orders yet</p>
            <p style={styles.emptySubtext}>Orders will appear here once customers start placing them</p>
          </div>
        ) : (
          <div style={styles.ordersTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Items</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <div style={styles.customerName}>{order.user?.name || 'Guest'}</div>
                        <div style={styles.customerEmail}>{order.user?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td style={styles.td}>{order.items?.length || 0} items</td>
                    <td style={styles.td}>
                      <strong style={styles.amount}>₹{order.totalAmount}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: getStatusColor(order.orderStatus)
                      }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateText}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div style={styles.timeText}>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <a href="/products" style={styles.actionCard}>
            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <div style={styles.actionText}>Add Product</div>
          </a>

          <a href="/orders" style={styles.actionCard}>
            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <div style={styles.actionText}>Manage Orders</div>
          </a>

          <a href="/riders" style={styles.actionCard}>
            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <div style={styles.actionText}>View Riders</div>
          </a>
        </div>
      </div>
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
  welcomeSection: {
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #E5E7EB'
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1F2937',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  welcomeSubtitle: {
    fontSize: '0.95rem',
    color: '#6B7280',
    marginTop: '0.5rem',
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem'
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    background: '#ecfdf5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#0c831f'
  },
  iconSvg: {
    width: '24px',
    height: '24px',
    strokeWidth: '2px',
    stroke: 'currentColor'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.25rem',
    lineHeight: '1'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  statChange: {
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  section: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #F3F4F6'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0
  },
  viewAllLink: {
    fontSize: '0.9rem',
    color: '#0c831f',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'opacity 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#9CA3AF'
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    strokeWidth: '1.5px',
    color: '#E5E7EB',
    margin: '0 auto 1rem'
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4B5563',
    margin: '0 0 0.5rem 0'
  },
  emptySubtext: {
    fontSize: '0.9rem',
    color: '#9CA3AF',
    margin: 0
  },
  ordersTable: {
    overflowX: 'auto'
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
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.8rem',
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
    fontSize: '0.9rem',
    color: '#1F2937',
    verticalAlign: 'top',
    borderBottom: '1px solid #F3F4F6'
  },
  customerName: {
    fontWeight: '600',
    color: '#1F2937'
  },
  customerEmail: {
    fontSize: '0.8rem',
    color: '#6B7280',
    marginTop: '0.25rem'
  },
  amount: {
    fontSize: '0.95rem',
    color: '#1F2937',
    fontWeight: '600'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '9999px',
    textTransform: 'capitalize'
  },
  dateText: {
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '500'
  },
  timeText: {
    fontSize: '0.8rem',
    color: '#9CA3AF',
    marginTop: '0.25rem'
  },
  quickActions: {
    marginTop: '2rem'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  actionCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  actionIcon: {
    width: '32px',
    height: '32px',
    strokeWidth: '2px',
    color: '#0c831f'
  },
  actionText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1F2937'
  }
};

export default AdminDashboard;
