import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.text}>Your order has been placed successfully.</p>
        <p style={styles.subtext}>Delivery in 10 minutes</p>
        <button style={styles.btn} onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F5' },
  card: { background: '#FFFFFF', padding: '3rem', borderRadius: '8px', textAlign: 'center', maxWidth: '400px' },
  icon: { fontSize: '4rem', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '400', color: '#1A1A1A', marginBottom: '1rem' },
  text: { fontSize: '1rem', color: '#5A5A5A', marginBottom: '0.5rem' },
  subtext: { fontSize: '0.875rem', color: '#8B8B8B', marginBottom: '2rem' },
  btn: { padding: '1rem 2rem', background: '#1A1A1A', color: '#FFFFFF', border: 'none', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', textTransform: 'uppercase' }
};

export default PaymentSuccess;
