import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Main Footer - Simplified */}
        <div style={styles.mainContent}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span style={styles.logoText}>QUIXO</span>
            </div>
            <p style={styles.tagline}>Groceries delivered in 10 minutes</p>
          </div>

          {/* Quick Links */}
          <div style={styles.linksGroup}>
            <h4 style={styles.linksTitle}>Shop</h4>
            <Link to="/products" style={styles.link}>All Products</Link>
            <Link to="/cart" style={styles.link}>Cart</Link>
            <Link to="/orders" style={styles.link}>My Orders</Link>
          </div>

          {/* Account */}
          <div style={styles.linksGroup}>
            <h4 style={styles.linksTitle}>Account</h4>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Sign Up</Link>
            <Link to="/addresses" style={styles.link}>Addresses</Link>
          </div>

          {/* Contact */}
          <div style={styles.linksGroup}>
            <h4 style={styles.linksTitle}>Support</h4>
            <a href="mailto:hello@quixo.com" style={styles.link}>hello@quixo.com</a>
            <span style={styles.linkText}>1800-QUIXO-10</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>© {currentYear} Quixo. All rights reserved.</p>
          <div style={styles.socialLinks}>
            <a href="#" style={styles.socialIcon} aria-label="Twitter">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" style={styles.socialIcon} aria-label="Instagram">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
              </svg>
            </a>
            <a href="#" style={styles.socialIcon} aria-label="Facebook">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#1e293b',
    color: '#94a3b8',
    marginTop: 'auto'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '3rem',
    padding: '3rem 0',
    borderBottom: '1px solid #334155'
  },
  brand: {
    paddingRight: '1rem'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#f8fafc',
    marginBottom: '0.75rem'
  },
  logoText: {
    fontSize: '1.375rem',
    fontWeight: '800',
    letterSpacing: '0.02em'
  },
  tagline: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: '1.5'
  },
  linksGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem'
  },
  linksTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.2s'
  },
  linkText: {
    color: '#94a3b8',
    fontSize: '0.875rem'
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 0',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  copyright: {
    fontSize: '0.8125rem',
    color: '#64748b',
    margin: 0
  },
  socialLinks: {
    display: 'flex',
    gap: '1rem'
  },
  socialIcon: {
    color: '#64748b',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  footer a:hover {
    color: #e2e8f0 !important;
  }
  
  @media (max-width: 768px) {
    footer > div > div:first-child {
      grid-template-columns: 1fr 1fr !important;
      gap: 2rem !important;
    }
  }
  
  @media (max-width: 480px) {
    footer > div > div:first-child {
      grid-template-columns: 1fr !important;
    }
    
    footer > div > div:last-child {
      flex-direction: column !important;
      text-align: center !important;
    }
  }
`;

if (!document.querySelector('style[data-footer-styles]')) {
  styleSheet.setAttribute('data-footer-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default Footer;
