import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';

function RiderLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Clear old tokens on mount
  useEffect(() => {
    localStorage.removeItem('riderToken');
    localStorage.removeItem('rider');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Corrected endpoint to match auth.js route (/api/auth/rider/login) OR rider.js (/api/rider/login)
      // Since auth.js has the login route too, we can use that, OR rider.js. 
      // rider.js is mounted at /api/rider. auth.js is at /api/auth.
      // Let's use the one in rider.js as it seems more robust with stats etc, 
      // BUT auth.js also has it.
      // Let's try /rider/login (which hits rider.js mounted at /api/rider)
      // The previous code was `${config.API_BASE_URL}/rider/login`.
      // If that 404'd, check server.js mount.
      // server.js: app.use('/api/rider', ... riderRoutes)
      // rider.js: router.post('/login', ...) -> /api/rider/login
      // So /rider/login should work IF rider.js is correct.
      // However, to be safe and consistent with register, let's use the auth one if rider.js fails?
      // No, let's stick to /rider/login if it is indeed in rider.js.
      // Wait, earlier I saw auth.js ALSO has /rider/login.
      // Let's use /auth/rider/login to be consistent with the register fix if that helps.
      // But let's check if the user reported login failure too. "rider refistartion and login it is not working"

      const response = await axios.post(`${config.API_BASE_URL}/auth/rider/login`, {
        email,
        password
      });
      const data = response.data;

      if (data.success) {
        // Store token and rider info
        localStorage.setItem('riderToken', data.token);
        localStorage.setItem('rider', JSON.stringify(data.rider));

        console.log('✅ Login successful:', data.rider);

        // Redirect to dashboard
        window.location.href = '/rider/dashboard';
      }
    } catch (error) {
      console.error('❌ Login failed:', error);

      const errorMsg = error.response?.data?.error || 'Login failed';
      const status = error.response?.data?.status;

      if (status === 'pending') {
        setError('⏳ Your account is pending admin approval.');
      } else if (status === 'rejected') {
        setError('❌ Account rejected: ' + errorMsg);
      } else if (status === 'suspended') {
        setError('⚠️ Account suspended: ' + errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.deliveryGraphic}>🏍️</div>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Food Craze Rider</h1>
          <p style={styles.subtitle}>Partner App</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="rider@example.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'START DELIVERY 🚀'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>New Rider? <a href="/rider/register" style={styles.link}>Join Fleet</a></p>
        </div>
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
    background: '#ff9900', // Brand Orange for Rider
    backgroundImage: 'linear-gradient(135deg, #ff9900 0%, #ff5500 100%)',
    padding: '1.5rem',
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  deliveryGraphic: {
    fontSize: '4rem',
    marginBottom: '1rem',
    background: 'white',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  },
  card: {
    background: '#FFFFFF',
    padding: '2rem',
    maxWidth: '380px',
    width: '100%',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#111827',
    margin: '0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '0.25rem'
  },
  errorBox: {
    padding: '0.75rem',
    background: '#FEE2E2',
    borderLeft: '4px solid #EF4444',
    color: '#991B1B',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    borderRadius: '4px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.8rem',
    color: '#374151',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  input: {
    padding: '1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#F9FAFB'
  },
  button: {
    padding: '1.25rem',
    background: '#111827', // Black
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.1s'
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  link: {
    color: '#ff5500',
    fontWeight: '700',
    textDecoration: 'none'
  }
};

// Add styles
const s = document.createElement('style');
s.innerText = `
  input:focus {
    border-color: #ff9900 !important;
    background: white !important;
  }
  button:active {
    transform: scale(0.98);
  }
`;
document.head.appendChild(s);

export default RiderLogin;
