import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import ProductManagement from './pages/admin/ProductManagement';

import RiderManagement from './pages/admin/RiderManagement';
import RecipeManagement from './pages/admin/RecipeManagement';
import AddEditRecipe from './pages/admin/AddEditRecipe';
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
            <h2 style={styles.brandTitle}>Food Craze</h2>
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

            <Link
              to="/recipes"
              style={activeTab === 'recipes' ? styles.navLinkActive : styles.navLink}
              onClick={() => setActiveTab('recipes')}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Recipe Book
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
            <Route path="/recipes" element={<RecipeManagement />} />
            <Route path="/recipes/add" element={<AddEditRecipe />} />
            <Route path="/recipes/edit/:id" element={<AddEditRecipe />} />
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
    display: 'flex',
    background: '#F3F4F6'
  },
  navbar: {
    width: '260px',
    background: 'white',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    zIndex: 100
  },
  navBrand: {
    padding: '1.5rem',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0c831f',
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.7rem',
    color: '#6B7280',
    fontWeight: '600',
    background: '#F3F4F6',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em'
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1.5rem 1rem',
    flex: 1
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#4B5563',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderRadius: '8px'
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#0c831f',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    background: '#ecfdf5',
    borderRadius: '8px'
  },
  icon: {
    width: '20px',
    height: '20px',
    strokeWidth: '2px'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid #F3F4F6',
    color: '#EF4444',
    padding: '1.5rem',
    width: '100%',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'background 0.2s',
    textAlign: 'left'
  },
  content: {
    flex: 1,
    marginLeft: '260px',
    padding: '2rem',
    maxWidth: '100%'
  }
};

export default App;
