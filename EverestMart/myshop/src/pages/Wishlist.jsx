import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ FIXED: Proper URL syntax
      const { data } = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlist(data.wishlist || []);
    } catch (error) {  // ✅ FIXED: Changed _error to error
      console.error('Failed to load wishlist:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');

      // ✅ FIXED: Consistent API URL
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlist(wishlist.filter(item => item._id !== productId));
      window.dispatchEvent(new Event('wishlistUpdated'));
      alert('✅ Removed from wishlist');
    } catch (error) {  // ✅ FIXED: Changed _error to error
      console.error('Remove error:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const moveToCart = async (product) => {
    try {
      // ✅ Add directly to cart (no backend needed)
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex(item => item._id === product._id);

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          unitQuantity: product.unitQuantity || '1',
          unit: product.unit || 'piece',
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));

      // Remove from wishlist
      await removeFromWishlist(product._id);

      alert('✅ Moved to cart!');
    } catch (error) {
      console.error('Move to cart error:', error);
      alert('Failed to move to cart');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>My Wishlist</h1>
        <span style={styles.count}>({wishlist.length})</span>
      </div>

      {wishlist.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💖</div>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items to buy them later!</p>
          <button
            style={styles.shopBtn}
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {wishlist.map(item => (
            <div key={item._id} style={styles.card}>
              {/* Product Image */}
              <div style={styles.imageContainer}>
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  style={styles.image}
                  onClick={() => navigate(`/product/${item._id}`)}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
                {item.stock === 0 && (
                  <div style={styles.outOfStock}>Out of Stock</div>
                )}
              </div>

              {/* Product Info */}
              <div style={styles.info}>
                <h3
                  style={styles.productName}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {item.name}
                </h3>

                <div style={styles.priceRow}>
                  <span style={styles.price}>₹{item.price}</span>
                  {item.rating > 0 && (
                    <span style={styles.rating}>
                      ⭐ {item.rating}
                    </span>
                  )}
                </div>

                {item.addedAt && (
                  <p style={styles.addedDate}>
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button
                  style={{ ...styles.btn, ...styles.cartBtn }}
                  onClick={() => moveToCart(item)}
                  disabled={item.stock === 0}
                >
                  {item.stock === 0 ? '❌ Out of Stock' : '🛒 Move to Cart'}
                </button>
                <button
                  style={{ ...styles.btn, ...styles.removeBtn }}
                  onClick={() => removeFromWishlist(item._id)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '70vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #E8ECEF',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2C3E50',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0
  },
  count: {
    fontSize: '1.2rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  loading: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E8ECEF',
    borderTop: '4px solid #2C3E50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F9FA',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  shopBtn: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s',
    cursor: 'default'
  },
  imageContainer: {
    position: 'relative',
    paddingTop: '100%',
    overflow: 'hidden',
    background: '#F8F9FA'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.3s'
  },
  outOfStock: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(239, 68, 68, 0.95)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  info: {
    padding: '1rem'
  },
  productName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#2C3E50',
    margin: '0 0 0.75rem',
    cursor: 'pointer',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4',
    minHeight: '2.8em',
    transition: 'color 0.2s'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2563eb'
  },
  rating: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '600'
  },
  addedDate: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    margin: 0
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid #F0F1F3'
  },
  btn: {
    padding: '0.875rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cartBtn: {
    background: '#2C3E50',
    color: 'white'
  },
  removeBtn: {
    background: 'transparent',
    color: '#E74C3C',
    border: '1px solid #E74C3C'
  }
};

// Add spinner animation
if (!document.getElementById('wishlist-spinner')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'wishlist-spinner';
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Wishlist;
