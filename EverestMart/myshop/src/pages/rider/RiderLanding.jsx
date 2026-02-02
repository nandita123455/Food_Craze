import { useNavigate } from 'react-router-dom';

function RiderLanding() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.content}>
          <h1 style={styles.title}>🚴 Become a Delivery Partner</h1>
          <p style={styles.subtitle}>
            Earn money on your schedule. Deliver with MyShop.
          </p>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>10,000+</h3>
              <p style={styles.statLabel}>Active Riders</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>₹25,000</h3>
              <p style={styles.statLabel}>Avg. Monthly Earnings</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>24/7</h3>
              <p style={styles.statLabel}>Flexible Hours</p>
            </div>
          </div>

          <div style={styles.buttons}>
            <button 
              style={styles.loginBtn}
              onClick={() => navigate('/rider/login')}
            >
              Login to Dashboard
            </button>
            <button 
              style={styles.registerBtn}
              onClick={() => navigate('/rider/register')}
            >
              Register as Rider
            </button>
          </div>
        </div>

        <div style={styles.imageSection}>
          <img 
            src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600" 
            alt="Delivery Rider"
            style={styles.image}
          />
        </div>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Why Ride With Us?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.icon}>💰</div>
            <h3>Competitive Earnings</h3>
            <p>Earn more with our transparent pricing model</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.icon}>⏰</div>
            <h3>Flexible Schedule</h3>
            <p>Work when you want, as much as you want</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.icon}>📱</div>
            <h3>Easy to Use App</h3>
            <p>Simple interface with real-time notifications</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.icon}>🎁</div>
            <h3>Weekly Bonuses</h3>
            <p>Extra rewards for top performers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F8F9FA'
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4rem 2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  content: {
    maxWidth: '600px'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    marginBottom: '2rem'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    margin: '0.5rem 0 0 0'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  loginBtn: {
    padding: '1rem 2rem',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  registerBtn: {
    padding: '1rem 2rem',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  features: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '4rem 2rem'
  },
  featuresTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#2C3E50'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  }
};

export default RiderLanding;
