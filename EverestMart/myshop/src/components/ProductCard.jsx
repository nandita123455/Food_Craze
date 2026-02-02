import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import BehaviorTracker from '../services/behaviorTracker'

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
        src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`}
        alt={product.name}
        style={styles.image}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image' }}
      />
      <div style={styles.content}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.description}>{product.description}</p>
        <div style={styles.footer}>
          <p style={styles.price}>₹{product.price.toLocaleString()}</p>
          <button onClick={handleAddToCart} style={styles.button}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    border: '1px solid #e5e7eb',
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
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background 0.2s'
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
    background: #1d4ed8 !important;
    transform: translateY(-1px);
  }
`
document.head.appendChild(styleSheet)

export default ProductCard
