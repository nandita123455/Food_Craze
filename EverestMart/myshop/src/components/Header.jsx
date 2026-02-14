import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { logout, getCurrentUser } from '../services/api';

function Header() {
  const { cart } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🏔️ Food Craze
        </Link>

        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/products" style={styles.link}>Products</Link>

          {user ? (
            <>
              <span style={styles.userName}>👤 {user.name}</span>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              Login
            </Link>
          )}

          <Link to="/cart" style={styles.cartBtn}>
            🛒 Cart {cartItemCount > 0 && <span style={styles.badge}>{cartItemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none'
  },
  nav: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  },
  link: {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  userName: {
    color: '#667eea',
    fontWeight: '600'
  },
  loginBtn: {
    background: '#667eea',
    color: 'white',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600'
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  cartBtn: {
    background: '#10b981',
    color: 'white',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    position: 'relative'
  },
  badge: {
    background: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '0.75rem',
    marginLeft: '0.5rem'
  }
};

export default Header;
