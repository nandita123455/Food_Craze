import { useState } from 'react';
import axios from 'axios';
import config from '../../config/config';

function AdminLogin({ setAdmin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = config.API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Admin login attempt:', email);

      const { data } = await axios.post(`${API_URL}/auth/admin/login`, {
        email,
        password
      });

      console.log('✅ Login response:', data);

      if (!data.user || data.user.isAdmin !== true) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      // Store admin data and token
      localStorage.setItem('admin', JSON.stringify(data.user));
      localStorage.setItem('adminToken', data.token);

      setAdmin(data.user);
    } catch (err) {
      console.error('❌ Login error:', err.response || err);
      setError(err.response?.data?.error || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Graphic */}
      <div style={styles.bgGraphic}></div>

      <div style={styles.loginWrapper}>
        <div style={styles.brandSection}>
          <img src="/logo.svg" alt="Food Craze Admin" style={{ width: '250px', marginBottom: '1rem' }} />
          <p style={styles.brandSubtitle}>Enterprise Management Portal</p>
        </div>

        <form onSubmit={handleLogin} style={styles.formContainer}>
          <h2 style={styles.loginTitle}>Sign In</h2>

          {error && (
            <div style={styles.errorBanner}>
              <span style={{ marginRight: '8px' }}>🚫</span> {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@foodcraze.com"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.passwordInput}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeToggle}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard →'}
          </button>

          <div style={styles.footerLink}>
            <a href="#" style={styles.link}>Forgot Credentials?</a>
          </div>
        </form>
      </div>

      <div style={styles.footer}>
        <p>🔒 Secure 256-bit SSL Connection | Food Craze System v1.1.0</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F3F4F6',
    color: '#1F2937',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  bgGraphic: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 50%, rgba(12, 131, 31, 0.05) 0%, rgba(243, 244, 246, 0) 70%)',
    zIndex: 0
  },
  loginWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    maxWidth: '440px',
    width: '90%',
    zIndex: 1,
    border: '1px solid #E5E7EB'
  },
  brandSection: {
    padding: '3rem 2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  logoCircle: {
    fontSize: '3rem',
    background: '#ecfdf5',
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    color: '#0c831f'
  },
  brandTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1F2937',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.95rem',
    color: '#6B7280',
    fontWeight: '500'
  },
  formContainer: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column'
  },
  loginTitle: {
    display: 'none' // Hidden for cleaner look
  },
  inputGroup: {
    marginBottom: '1.25rem'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    background: '#F9FAFB',
    border: '1px solid #D1D5DB',
    borderRadius: '12px',
    color: '#1F2937',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '0.875rem',
    paddingRight: '4rem',
    background: '#F9FAFB',
    border: '1px solid #D1D5DB',
    borderRadius: '12px',
    color: '#1F2937',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  eyeToggle: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    padding: '0.25rem'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: '#0c831f',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(12, 131, 31, 0.2)',
    transition: 'all 0.2s'
  },
  footerLink: {
    textAlign: 'center'
  },
  link: {
    color: '#0c831f',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  errorBanner: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '0.85rem'
  }
};

// Insert styles for responsiveness
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @media (max-width: 768px) {
    div[style*="flex-direction: row"] {
      flex-direction: column !important;
    }
    div[style*="padding: 4rem"] {
      padding: 2rem !important;
    }
    div[style*="min-height: 500px"] {
      min-height: auto !important;
    }
  }
  input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
  }
  button[type="submit"]:hover:not(:disabled) {
    background: #2563eb !important;
  }
`;
document.head.appendChild(styleSheet);

export default AdminLogin;
