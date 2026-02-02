import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';

function Register() {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const API_URL = config.API_BASE_URL;

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '#e5e7eb' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: 'Very Weak', color: '#ef4444' },
      { text: 'Weak', color: '#f97316' },
      { text: 'Fair', color: '#eab308' },
      { text: 'Good', color: '#22c55e' },
      { text: 'Strong', color: '#10b981' }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Start countdown timer for resend OTP
  const startResendTimer = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/send-otp`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        setStep(2);
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: otp
      });

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show success message
        alert('🎉 Registration successful! Welcome to Quixo!');
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/resend-otp`, {
        email: formData.email
      });
      startResendTimer();
      setError(''); // Clear any previous error
      alert('✅ New OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignup = () => {
    window.location.href = `${config.API_URL}/api/auth/google`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        {step === 1 ? (
          <>
            <h1 style={styles.title}>📝 Create Account</h1>
            <p style={styles.subtitle}>Join Quixo for lightning-fast deliveries</p>

            {/* Google Signup Button */}
            <button onClick={handleGoogleSignup} style={styles.googleBtn}>
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>

            {error && <div style={styles.error}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="John Doe"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="your@email.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="••••••••"
                  minLength={6}
                />
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthBar}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          style={{
                            ...styles.strengthSegment,
                            backgroundColor: level <= passwordStrength.strength ? passwordStrength.color : '#e5e7eb'
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{
                    ...styles.input,
                    borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : '#e5e7eb'
                  }}
                  placeholder="••••••••"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <small style={styles.errorHint}>Passwords do not match</small>
                )}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Sending OTP...
                  </span>
                ) : (
                  'Continue →'
                )}
              </button>
            </form>

            <p style={styles.switchText}>
              Already have an account?
              <Link to="/login" style={styles.link}> Login here</Link>
            </p>
          </>
        ) : (
          <>
            {/* OTP Verification Step */}
            <div style={styles.otpHeader}>
              <button onClick={() => setStep(1)} style={styles.backBtn}>
                ← Back
              </button>
              <h1 style={styles.title}>🔐 Verify Email</h1>
            </div>

            <p style={styles.otpInfo}>
              We've sent a 6-digit OTP to<br />
              <strong style={styles.emailHighlight}>{formData.email}</strong>
            </p>

            {error && <div style={styles.error}>⚠️ {error}</div>}

            <form onSubmit={handleVerifyOTP}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading || otp.length !== 6 ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Create Account'
                )}
              </button>
            </form>

            <div style={styles.resendSection}>
              <p style={styles.resendText}>Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                style={{
                  ...styles.resendBtn,
                  opacity: countdown > 0 ? 0.5 : 1,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <div style={styles.timerHint}>
              ⏱️ OTP expires in 10 minutes
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  formCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#111827',
    fontSize: '2rem'
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '2rem',
    fontSize: '0.95rem'
  },
  googleBtn: {
    width: '100%',
    padding: '0.95rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s',
    color: '#374151',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    gap: '1rem'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb'
  },
  dividerText: {
    color: '#9ca3af',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#374151',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none'
  },
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  strengthBar: {
    display: 'flex',
    gap: '4px',
    flex: 1
  },
  strengthSegment: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.3s'
  },
  strengthText: {
    fontSize: '0.8rem',
    fontWeight: '600',
    minWidth: '80px',
    textAlign: 'right'
  },
  errorHint: {
    color: '#ef4444',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
    display: 'block'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#6b7280'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  },
  // OTP Step Styles
  otpHeader: {
    marginBottom: '1.5rem'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '1rem'
  },
  otpInfo: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  emailHighlight: {
    color: '#667eea',
    fontSize: '1.1rem'
  },
  otpInput: {
    width: '100%',
    padding: '1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
    boxSizing: 'border-box'
  },
  resendSection: {
    textAlign: 'center',
    marginTop: '1.5rem'
  },
  resendText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  timerHint: {
    textAlign: 'center',
    marginTop: '1.5rem',
    padding: '0.75rem',
    background: '#FEF3C7',
    color: '#92400E',
    borderRadius: '8px',
    fontSize: '0.875rem'
  }
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default Register;
