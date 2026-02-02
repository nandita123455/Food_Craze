import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import ProductManagement from './pages/admin/ProductManagement';
import RiderManagement from './pages/admin/RiderManagement';
import './App.css';

function App() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('adminToken');

    if (adminData && adminToken) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        if (parsedAdmin.isAdmin === true) {
          setAdmin(parsedAdmin);
        }
      } catch (error) {
        console.error('Error parsing admin data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAdmin(null);
    window.location.reload();
  };

  if (!admin) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin setAdmin={setAdmin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div style={styles.app}>
        {/* Top Navigation */}
        <nav style={styles.navbar}>
          <div style={styles.navBrand}>
            <h2 style={styles.brandTitle}>Quixo</h2>
            <span style={styles.brandSubtitle}>ADMIN</span>
          </div>

          <div style={styles.navLinks}>
            <Link
              to="/"
              style={activeTab === 'dashboard' ? styles.navLinkActive : styles.navLink}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </Link>

            <Link
              to="/orders"
              style={activeTab === 'orders' ? styles.navLinkActive : styles.navLink}
              onClick={() => setActiveTab('orders')}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              Orders
            </Link>

            <Link
              to="/products"
              style={activeTab === 'products' ? styles.navLinkActive : styles.navLink}
              onClick={() => setActiveTab('products')}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Products
            </Link>

            <Link
              to="/riders"
              style={activeTab === 'riders' ? styles.navLinkActive : styles.navLink}
              onClick={() => setActiveTab('riders')}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                <polygon points="12 15 17 21 7 21 12 15"></polygon>
              </svg>
              Riders
            </Link>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </nav>

        {/* Main Content */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/riders" element={<RiderManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#F8F7F5'
  },
  navbar: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2A2A2A',
    height: '60px'
  },
  navBrand: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem'
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '400',
    letterSpacing: '0.5px'
  },
  brandSubtitle: {
    fontSize: '0.6875rem',
    color: '#8B8B8B',
    fontWeight: '500',
    letterSpacing: '1px'
  },
  navLinks: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    color: '#8B8B8B',
    textDecoration: 'none',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    borderRadius: '4px'
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#2A2A2A',
    borderRadius: '4px'
  },
  icon: {
    width: '16px',
    height: '16px',
    strokeWidth: '2px'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: '1px solid #2A2A2A',
    color: '#8B8B8B',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  content: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  }
};

export default App;
