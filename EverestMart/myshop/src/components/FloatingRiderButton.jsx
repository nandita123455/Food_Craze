import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function FloatingRiderButton() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on rider pages
  if (location.pathname.includes('/rider')) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <button
      style={styles.fab}
      onClick={() => navigate('/rider/register')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(5, 150, 105, 0.4)';
        e.currentTarget.style.background = '#047857';  // Dark Everest green
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.3)';
        e.currentTarget.style.background = '#059669';  // Everest green
      }}
      title="Become a Delivery Rider"
    >
      <div style={styles.content}>
        <span style={styles.icon}>🚴</span>
        <span style={styles.text}>Join as Rider</span>
      </div>
    </button>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    padding: '1rem 1.5rem',
    borderRadius: '50px',
    background: '#059669',  // Everest green
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '0.9375rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem'
  },
  icon: {
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1
  },
  text: {
    whiteSpace: 'nowrap',
    letterSpacing: '0.2px'
  }
};

export default FloatingRiderButton;
