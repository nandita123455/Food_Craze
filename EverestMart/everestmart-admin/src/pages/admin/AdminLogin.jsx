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
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🚀 Quixo</h1>
          <h2 style={styles.title}>Admin Portal</h2>
          <p style={styles.subtitle}>Authorized Access Only</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@quixo.com"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
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
                style={styles.toggleBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner}></span>
                Authenticating...
              </span>
            ) : (
              '🔐 Login to Admin Panel'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            🔒 Secure Connection • All activities are logged
          </p>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
        }
        
        button[type="submit"]:hover:not(:disabled) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        button[type="submit"]:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    fontFamily: 'system-ui, sans-serif'
  },
  loginBox: {
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '480px',
    width: '100%',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease'
  },
  header: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    padding: '3rem 2rem',
    textAlign: 'center'
  },
  logo: {
    fontSize: '2.5rem',
    margin: '0 0 1rem 0',
    fontWeight: '300'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '400',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#E5E2DD',
    margin: 0
  },
  form: {
    padding: '3rem 2rem'
  },
  error: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    border: '2px solid #FCA5A5',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box'
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '1rem',
    paddingRight: '3rem',
    fontSize: '1rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box'
  },
  toggleBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s'
  },
  submitBtn: {
    width: '100%',
    padding: '1.25rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
    marginTop: '1rem'
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  footer: {
    background: '#F8F7F5',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    borderTop: '1px solid #E5E2DD'
  },
  footerText: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    margin: 0
  }
};

export default AdminLogin;
