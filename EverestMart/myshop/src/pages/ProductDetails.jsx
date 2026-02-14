import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import BehaviorTracker from '../services/behaviorTracker';
import RecommendedProducts from '../components/RecommendedProducts';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);

      // ✅ Track product view
      BehaviorTracker.trackView(id, {
        category: data.category,
        price: data.price,
        name: data.name
      });

      // Fallback: Fetch related products (same category)
      const response = await getProducts({ category: data.category });
      const allProducts = response?.products || response || [];
      const related = allProducts.filter(p => p._id !== id).slice(0, 3);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error:', error);
      alert('Product not found!');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // ✅ Add product quantity times (each call adds 1)
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    // ✅ Track behavior
    BehaviorTracker.trackAddToCart(product._id, quantity, {
      category: product.category,
      price: product.price
    });

    // ✅ Show success message
    const totalInCart = getItemQuantity(product._id) + quantity;
    showToast(`✅ ${quantity} ${product.name} added!\n\nTotal in cart: ${totalInCart}`);

    // Reset quantity selector
    setQuantity(1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/cart'), 500);
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.innerHTML = message.replace(/\n/g, '<br>');
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      text-align: center;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading product...</p>
      </div>
    );
  }

  if (!product) return null;

  const currentCartQty = getItemQuantity(product._id);

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSeparator}>›</span>
        <Link to="/products" style={styles.breadcrumbLink}>Products</Link>
        <span style={styles.breadcrumbSeparator}>›</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      {/* Product Details */}
      <div style={styles.productContainer}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <img
            src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`}
            alt={product.name}
            style={styles.productImage}
            onError={(e) => {
              e.target.src = '/placeholder.png';
            }}
          />
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.productName}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>

          <div style={styles.priceSection}>
            <span style={styles.price}>₹{product.price?.toLocaleString() || '0'}</span>
            <span style={styles.stock}>
              {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          {/* Show current cart quantity */}
          {currentCartQty > 0 && (
            <div style={styles.cartInfo}>
              🛒 Already in cart: <strong>{currentCartQty} items</strong>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={styles.quantitySection}>
            <label style={styles.label}>Quantity:</label>
            <div style={styles.quantityControls}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyBtn}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span style={styles.qtyDisplay}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={styles.qtyBtn}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
            <span style={styles.qtyLimit}>Max: 10 per order</span>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={handleAddToCart}
              style={styles.addToCartBtn}
              disabled={product.stock === 0}
            >
              🛒 Add {quantity > 1 ? `${quantity} ` : ''}to Cart
            </button>
            <button
              onClick={handleBuyNow}
              style={styles.buyNowBtn}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Features */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🚚</span>
              <div>
                <strong>10 Minute Delivery</strong>
                <p style={styles.featureText}>Ultra-fast delivery to your door</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>↩️</span>
              <div>
                <strong>Easy Returns</strong>
                <p style={styles.featureText}>7-day return policy</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <div>
                <strong>Verified Quality</strong>
                <p style={styles.featureText}>100% authentic products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ML-Powered Similar Products */}
      <div style={{ marginTop: '3rem' }}>
        <RecommendedProducts
          title="🤖 AI Recommended Similar Products"
          type="similar"
          productId={product._id}
        />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>More from {product.category}</h2>
          <div style={styles.relatedGrid}>
            {relatedProducts.map(relatedProduct => (
              <div
                key={relatedProduct._id}
                style={styles.relatedCard}
                onClick={() => navigate(`/product/${relatedProduct._id}`)}
              >
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  style={styles.relatedImage}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
                <div style={styles.relatedInfo}>
                  <h4 style={styles.relatedName}>{relatedProduct.name}</h4>
                  <p style={styles.relatedPrice}>₹{relatedProduct.price.toLocaleString()}</p>
                  <button
                    style={styles.quickAddBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(relatedProduct);
                      showToast(`✅ ${relatedProduct.name} added to cart!`);
                    }}
                  >
                    Quick Add +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 80px)'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0c831f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#6B7280',
    fontSize: '1rem'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#6B7280'
  },
  breadcrumbLink: {
    color: '#0c831f',
    textDecoration: 'none',
    fontWeight: '500'
  },
  breadcrumbSeparator: {
    color: '#9CA3AF'
  },
  breadcrumbCurrent: {
    color: '#374151'
  },
  productContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #E5E7EB'
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'white',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #F3F4F6'
  },
  productImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  category: {
    color: '#6B7280',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  productName: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1F2937',
    margin: 0,
    lineHeight: '1.2'
  },
  description: {
    fontSize: '1rem',
    color: '#4B5563',
    lineHeight: '1.6'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #F3F4F6'
  },
  price: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1F2937'
  },
  stock: {
    color: '#0c831f',
    fontWeight: '600',
    fontSize: '0.85rem',
    padding: '4px 8px',
    background: '#ecfdf5',
    borderRadius: '4px'
  },
  cartInfo: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  label: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#374151'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#F9FAFB',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  },
  qtyBtn: {
    background: '#0c831f',
    color: 'white',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  },
  qtyDisplay: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    minWidth: '40px',
    textAlign: 'center',
    color: '#1F2937'
  },
  qtyLimit: {
    fontSize: '0.8rem',
    color: '#9CA3AF'
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  addToCartBtn: {
    flex: 1,
    background: 'white',
    color: '#0c831f',
    border: '1px solid #0c831f',
    padding: '0.85rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buyNowBtn: {
    flex: 1,
    background: '#0c831f',
    color: 'white',
    border: 'none',
    padding: '0.85rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #F3F4F6'
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  featureIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
    color: '#0c831f'
  },
  featureText: {
    color: '#6B7280',
    fontSize: '0.85rem',
    margin: '2px 0 0 0'
  },
  relatedSection: {
    marginTop: '3rem'
  },
  relatedTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    color: '#1F2937'
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  relatedCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #E5E7EB'
  },
  relatedImage: {
    width: '100%',
    height: '160px',
    objectFit: 'contain',
    background: '#F9FAFB',
    padding: '1rem'
  },
  relatedInfo: {
    padding: '1rem'
  },
  relatedName: {
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
    color: '#1F2937',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  relatedPrice: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0 0 0.75rem 0'
  },
  quickAddBtn: {
    width: '100%',
    padding: '0.5rem',
    background: 'white',
    border: '1px solid #0c831f',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0c831f',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

// Add animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { 
      transform: translateX(400px);
      opacity: 0;
    }
    to { 
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from { 
      transform: translateX(0);
      opacity: 1;
    }
    to { 
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
  
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: '1fr 1fr'"] {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ProductDetails;
