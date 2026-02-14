import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import BehaviorTracker from '../services/behaviorTracker';
import config from '../config/config';

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const handleCardClick = () => {
    // Track click before navigation
    BehaviorTracker.trackClick(product._id, {
      category: product.category,
      price: product.price
    })
    navigate(`/product/${product._id}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation() // Prevent navigation when clicking button
    addToCart(product)

    // Track add to cart behavior
    BehaviorTracker.trackAddToCart(product._id, 1, {
      category: product.category,
      price: product.price
    })

    // Toast notification
    const toast = document.createElement('div')
    toast.textContent = `✓ ${product.name} added to cart!`
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
    >
      <img
        src={config.getAssetUrl(product.image) || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
        alt={product.name}
        style={styles.image}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
        }}
      />
      <div style={styles.content}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.description}>{product.description}</p>
        <div style={styles.footer}>
          <button onClick={handleAddToCart} style={styles.button}>
            ADD
          </button>
        </div>
      </div>
    </div >
  )
}

const styles = {
  card: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    background: 'white',
    cursor: 'pointer'
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    transition: 'transform 0.3s'
  },
  content: {
    padding: '1.25rem'
  },
  category: {
    color: '#2563eb',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  title: {
    margin: '0.5rem 0',
    fontSize: '1.25rem',
    color: '#111827'
  },
  description: {
    color: '#6b7280',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    minHeight: '3rem'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: 0
  },
  button: {
    background: '#fff',
    color: '#2563eb',
    border: '1px solid #2563eb',
    padding: '0.4rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }
}

// CSS animations
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  div[style*="cursor: pointer"]:hover img {
    transform: scale(1.05);
  }
  div[style*="cursor: pointer"]:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  button:hover {
    background: #2563eb !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }
`
document.head.appendChild(styleSheet)

export default ProductCard
