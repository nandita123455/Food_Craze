import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../services/api';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';
import config from '../config/config';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMode, setLoginMode] = useState('phone'); // Default to phone like Blinkit
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      console.log('✅ Google login successful');
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);

      const user = JSON.parse(decodeURIComponent(userStr));
      window.history.replaceState({}, '', '/login');

      // ✅ Food Craze Welcome Message
      alert(`Welcome to Food Craze, ${user.name}! 🛒`);

      // ✅ Navigate after alert
      setTimeout(() => {
        navigate('/');
      }, 500);
    }

    const errorParam = params.get('error');
    if (errorParam === 'auth_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [location, navigate]);

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // alert('Login successful!'); // Removed for cleaner flow
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  // ✅ Google OAuth Login
  const handleGoogleLogin = () => {
    window.location.href = `${config.API_BASE_URL}/auth/google`;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!phoneNumber.startsWith('+')) {
      setError('Enter valid number with code (e.g., +91...)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) { }
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible', // Invisible captcha for cleaner UI
        'callback': (response) => {
          console.log('✅ reCAPTCHA solved');
        }
      });

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

      window.confirmationResult = confirmationResult;

      setOtpSent(true);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP.');
      setLoading(false);

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) { }
        window.recaptchaVerifier = null;
      }
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const token = await user.getIdToken();

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber
      }));

      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);
      setError('Invalid OTP.');
      setLoading(false);
    }
  };

  const resetPhoneLogin = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Left Side - Brand/Promo (Hidden on mobile) */}
        <div style={styles.promoSection}>
          <h1 style={styles.promoTitle}>India's last minute app</h1>
          <p style={styles.promoText}>Log in or Sign up</p>
          <div style={styles.promoIcon}>🛒</div>
        </div>

        {/* Right Side - Login Form */}
        <div style={styles.formSection}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              {otpSent ? 'Enter OTP' : loginMode === 'phone' ? 'Phone Number Verification' : 'Email Login'}
            </h2>
            <p style={styles.cardSubtitle}>
              {otpSent
                ? `We've sent a code to ${phoneNumber}`
                : loginMode === 'phone'
                  ? 'Enter your phone number to login/sign up'
                  : 'Enter your email and password'}
            </p>

            {error && <div style={styles.error}>{error}</div>}

            {/* Login Mode Toggle */}
            {!otpSent && (
              <div style={styles.toggleContainer}>
                <button
                  style={{ ...styles.toggleBtn, ...(loginMode === 'phone' ? styles.toggleBtnActive : {}) }}
                  onClick={() => { setLoginMode('phone'); setError(''); }}
                >Phone</button>
                <div style={styles.toggleDivider}></div>
                <button
                  style={{ ...styles.toggleBtn, ...(loginMode === 'email' ? styles.toggleBtnActive : {}) }}
                  onClick={() => { setLoginMode('email'); setError(''); }}
                >Email</button>
              </div>
            )}

            {/* Phone Login */}
            {loginMode === 'phone' && (
              <div style={styles.formGroup}>
                {!otpSent ? (
                  <>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputPrefix}>📞</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 90000 00000"
                        style={styles.input}
                      />
                    </div>
                    <div id="recaptcha-container"></div>
                    <button
                      onClick={sendOTP}
                      style={styles.ctaBtn}
                      disabled={loading || !phoneNumber}
                    >
                      {loading ? 'Sending...' : 'Next'}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px' }}
                      maxLength={6}
                      autoFocus
                    />
                    <button
                      onClick={verifyOTP}
                      style={styles.ctaBtn}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify & Proceed'}
                    </button>
                    <button onClick={resetPhoneLogin} style={styles.backBtn}>Back to number</button>
                  </>
                )}
              </div>
            )}

            {/* Email Login */}
            {loginMode === 'email' && (
              <form onSubmit={handleSubmit} style={styles.formGroup}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Address"
                  required
                  style={styles.input}
                />
                <div style={{ ...styles.inputWrapper, marginTop: '10px' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    required
                    style={{ ...styles.input, width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button
                  type="submit"
                  style={styles.ctaBtn}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {!otpSent && (
              <>
                <div style={styles.divider}>
                  <span>OR</span>
                </div>
                <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                  Continue with Google
                </button>
              </>
            )}

            <p style={styles.terms}>
              By continuing, you agree to our <a href="#" style={styles.termLink}>Terms of Service</a> & <a href="#" style={styles.termLink}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFFFF', // Minimalist White Background
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  contentWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    height: '100vh',
    maxHeight: '600px',
  },
  promoSection: {
    flex: 1,
    background: '#F8F8F8', // Very light grey
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    borderRight: '1px solid #E0E0E0',
    '@media (max-width: 768px)': {
      display: 'none', // Mobile hidden
    },
  },
  promoTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: '10px',
    textAlign: 'center',
  },
  promoText: {
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'center',
  },
  promoIcon: {
    fontSize: '5rem',
    marginTop: '20px',
  },
  formSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: '#FFFFFF',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#000',
    marginBottom: '8px',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: '0.9rem',
    color: '#777',
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: '1.4',
  },
  error: {
    background: '#fee2e2',
    color: '#ef4444',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    marginBottom: '16px',
    textAlign: 'center',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#888',
    cursor: 'pointer',
    fontWeight: '600',
    borderBottom: '2px solid transparent',
  },
  toggleBtnActive: {
    color: '#1A1A1A',
    borderBottom: '2px solid #0c831f', // Blinkit Green/Black
  },
  toggleDivider: {
    width: '1px',
    background: '#eee',
    height: '20px',
    alignSelf: 'center',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputPrefix: {
    position: 'absolute',
    left: '12px',
    zIndex: 1,
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '14px',
    paddingLeft: '14px', // Adjust based on prefix
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    background: '#fff',
  },
  ctaBtn: {
    width: '100%',
    padding: '14px',
    background: '#0c831f', // Blinkit Green
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#0c831f',
    marginTop: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
    color: '#aaa',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  googleBtn: {
    width: '100%',
    padding: '12px',
    background: '#FFFFFF',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  terms: {
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'center',
    marginTop: '24px',
    lineHeight: '1.4',
  },
  termLink: {
    color: '#0c831f',
    textDecoration: 'none',
  }
};

// Add responsiveness
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    div[style*="display: none"] { display: none !important; }
    div[style*="flex-direction: row"] { flex-direction: column !important; }
    div[style*="height: 100vh"] { height: auto !important; min-height: 100vh; }
  }
  input:focus { border-color: #0c831f !important; }
`;
document.head.appendChild(style);

export default Login;
