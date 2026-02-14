import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import ProductManagement from './pages/admin/ProductManagement';
import AIChat from './components/AIChat';
import './App.css';

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check admin authentication
  useEffect(() => {
    // Prevent search engine indexing
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    // Check admin session
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('adminToken');

    if (adminData && adminToken) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        if (parsedAdmin.isAdmin === true) {
          setAdmin(parsedAdmin);
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Invalid admin data:', error);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // Session timeout management
  useEffect(() => {
    let timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert('⏰ Session expired. Please login again.');
        handleLogout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    events.forEach(event => document.addEventListener(event, resetTimeout, true));
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, resetTimeout, true));
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    setAdmin(null);
    window.location.href = '/login';
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {admin ? (
        <div className="admin-app">
          {/* Enhanced Navigation */}
          <header className="admin-header">
            <div className="nav-brand">
              <img src="/logo.svg" alt="Food Craze Admin" style={{ height: '50px' }} />
            </div>

            <nav className="admin-nav">
              <a href="/" className="nav-link">Dashboard</a>
              <a href="/orders" className="nav-link">Orders</a>
              <a href="/products" className="nav-link">Products</a>
              <a href="/products/manage" className="nav-link">Manage Products</a>

              <div className="nav-actions">
                <span className="admin-name">{admin.name || 'Admin'}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="admin-content">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/products" element={<AdminProducts />} />
              <Route path="/products/manage" element={<ProductManagement />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* AI Chat - Always available */}
          <AIChat />
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<AdminLogin setAdmin={setAdmin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
