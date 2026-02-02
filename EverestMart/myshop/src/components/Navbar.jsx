import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadUserAndCart();

    window.addEventListener('cartUpdated', loadUserAndCart);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('cartUpdated', loadUserAndCart);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadUserAndCart = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    alert('Logged out successfully!');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={{
      ...styles.navbar,
      boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={styles.navContainer}>
        {/* Logo */}
        <div style={styles.brand} onClick={() => navigate('/')}>
          <img
            src="/assets/logo.png"
            alt="Quixo"
            style={styles.logoImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ ...styles.logoFallback, display: 'none' }}>
            <span style={styles.logoText}>QUIXO</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <button
            style={{
              ...styles.navBtn,
              ...(isActive('/') ? styles.navBtnActive : {})
            }}
            onClick={() => navigate('/')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Home
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(isActive('/products') ? styles.navBtnActive : {})
            }}
            onClick={() => navigate('/products')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M16 11V7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7V11M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Shop
          </button>

          <button
            style={{
              ...styles.cartBtn,
              ...(isActive('/cart') ? styles.cartBtnActive : {})
            }}
            onClick={() => navigate('/cart')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
              <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
              <path d="M1 1H5L7.68 14.39C7.77 14.83 8.02 15.22 8.38 15.5C8.74 15.78 9.18 15.93 9.64 15.93H19.36C19.82 15.93 20.26 15.78 20.62 15.5C20.98 15.22 21.23 14.83 21.32 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={styles.badge}>{cartCount}</span>
            )}
          </button>

          {user ? (
            <>
              {/* Orders Button */}
              <button
                style={{
                  ...styles.navBtn,
                  ...(isActive('/orders') ? styles.navBtnActive : {})
                }}
                onClick={() => navigate('/orders')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Orders
              </button>

              {/* User Profile Section */}
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <div style={styles.userAvatarPlaceholder}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span style={styles.userName}>{user.name?.split(' ')[0]}</span>
                </div>
                <button style={styles.logoutBtn} onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <button
              style={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: '#FFFFFF',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0.75rem 0',
    transition: 'box-shadow 0.3s'
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  logoImage: {
    height: '100px',
    width: 'auto'
  },
  logoFallback: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '0.02em'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  navBtn: {
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative'
  },
  navBtnActive: {
    background: '#e8f5e9',
    color: '#0c831f'
  },
  cartBtn: {
    padding: '0.625rem 1rem',
    background: '#0c831f',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative'
  },
  cartBtnActive: {
    background: '#0a6b18'
  },
  icon: {
    flexShrink: 0
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '10px',
    padding: '0.125rem 0.375rem',
    fontSize: '0.6875rem',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center',
    border: '2px solid white'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: '0.75rem',
    paddingLeft: '0.75rem',
    borderLeft: '1px solid #e5e7eb'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  userName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.9375rem'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #e8f5e9'
  },
  userAvatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#0c831f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.875rem'
  },
  loginBtn: {
    padding: '0.625rem 1.5rem',
    background: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  logoutBtn: {
    padding: '0.5rem',
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  nav button:hover:not([disabled]) {
    transform: translateY(-1px);
  }
  
  nav button[style*="background: transparent"]:hover {
    background: #f5f5f5 !important;
  }
  
  nav button[style*="0c831f"]:hover {
    background: #0a6b18 !important;
  }
  
  nav button[style*="0f172a"]:hover {
    background: #1e293b !important;
  }
  
  nav > div > div:last-child > div > button:last-child:hover {
    background: #fef2f2 !important;
    border-color: #fecaca !important;
    color: #e53935 !important;
  }
  
  @media (max-width: 768px) {
    nav > div {
      padding: 0 1rem !important;
    }
    
    nav button span:last-of-type:not([style*="badge"]) {
      display: none;
    }
    
    nav button {
      padding: 0.5rem !important;
    }
    
    nav > div > div:last-child {
      gap: 0.125rem !important;
    }
  }
`;

if (!document.querySelector('style[data-navbar-styles]')) {
  styleSheet.setAttribute('data-navbar-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default Navbar;
