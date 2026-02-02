import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import BehaviorTracker from '../services/behaviorTracker';
import RecommendationService from '../services/recommendationService';
import RecommendationSection from '../components/RecommendationSection';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProductIds, setSimilarProductIds] = useState([]);
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

      // Fetch ML-based similar products
      try {
        const similarResponse = await RecommendationService.getSimilarProducts(id, 6);
        if (similarResponse.success && similarResponse.recommendations) {
          const ids = similarResponse.recommendations.map(r => r.product_id);
          setSimilarProductIds(ids);
        }
      } catch (err) {
        console.log('ML recommendations unavailable, using category fallback');
      }

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
            <span style={styles.price}>₹{product.price.toLocaleString()}</span>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>You May Also Like</h2>
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

      {/* ML-Powered Similar Products */}
      {similarProductIds.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <RecommendationSection
            title="🤖 AI Recommended Similar Products"
            productIds={similarProductIds}
            type="similar"
          />
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
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1.1rem'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    fontSize: '0.9rem'
  },
  breadcrumbLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  breadcrumbSeparator: {
    color: '#9ca3af'
  },
  breadcrumbCurrent: {
    color: '#6b7280'
  },
  productContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '4rem',
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '2rem'
  },
  productImage: {
    width: '100%',
    maxWidth: '450px',
    height: 'auto',
    borderRadius: '12px',
    objectFit: 'contain'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  category: {
    color: '#2563eb',
    fontSize: '0.9rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  productName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
    lineHeight: '1.2'
  },
  description: {
    fontSize: '1.1rem',
    color: '#6b7280',
    lineHeight: '1.7'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  stock: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    background: '#d1fae5',
    borderRadius: '8px'
  },
  cartInfo: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
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
    fontSize: '1.1rem',
    color: '#374151'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#f3f4f6',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    border: '2px solid #e5e7eb'
  },
  qtyBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    fontSize: '1.3rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyDisplay: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    minWidth: '45px',
    textAlign: 'center',
    color: '#111827'
  },
  qtyLimit: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  addToCartBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  buyNowBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #e5e7eb'
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  featureIcon: {
    fontSize: '2rem',
    flexShrink: 0
  },
  featureText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: '0.25rem 0 0 0'
  },
  relatedSection: {
    marginTop: '4rem'
  },
  relatedTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#111827'
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem'
  },
  relatedCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid transparent'
  },
  relatedImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover'
  },
  relatedInfo: {
    padding: '1.25rem'
  },
  relatedName: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    color: '#111827',
    fontWeight: '600'
  },
  relatedPrice: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: '0 0 1rem 0'
  },
  quickAddBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#374151',
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
