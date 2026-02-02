import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import RecommendationService from '../services/recommendationService';
import RecommendationSection from '../components/RecommendationSection';

import config from '../config/config';

const api = {
  getProducts: () => axios.get(`${config.API_BASE_URL}/products`),
  getCategories: () => axios.get(`${config.API_BASE_URL}/categories`)
};

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProductIds, setTrendingProductIds] = useState([]);
  const [recommendedProductIds, setRecommendedProductIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);

      const productsData = productsRes.data?.products || productsRes.data || [];
      setProducts(productsData);
      setFeaturedProducts(productsData.slice(0, 8));
      setCategories(categoriesRes.data?.categories || categoriesRes.data || []);

      // Load ML recommendations
      loadRecommendations();
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Get trending products
      const trendingRes = await RecommendationService.getTrendingProducts(8);
      if (trendingRes.success && trendingRes.recommendations) {
        const ids = trendingRes.recommendations.map(r => r.product_id);
        setTrendingProductIds(ids);
      }

      // Get personalized recommendations if user is logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id || user.id) {
        const userRecs = await RecommendationService.getUserRecommendations(
          user._id || user.id,
          8
        );
        if (userRecs.success && userRecs.recommendations) {
          const ids = userRecs.recommendations.map(r => r.product_id);
          setRecommendedProductIds(ids);
        }
      }
    } catch (error) {
      console.log('Recommendations unavailable:', error.message);
      // Silently fail - recommendations are optional
    }
  };

  const addToCart = (product, e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    showToast(`${product.name} added to cart!`);
  };

  const showToast = (message) => {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* COMPACT HERO - Blinkit/Zepto Style */}
      <section className="hero-compact">
        <div className="hero-content-compact">
          <h1>Groceries delivered in <span>10 minutes</span></h1>
          <p>Fresh products • Best prices • Lightning-fast delivery</p>

          {/* Search Bar */}
          <div className="search-bar-hero">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search for fruits, vegetables, groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchQuery && navigate(`/products?search=${searchQuery}`)}
            />
            <button onClick={() => searchQuery && navigate(`/products?search=${searchQuery}`)}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* VALUE PROPS BAR */}
      <section className="value-props">
        <div className="value-props-container">
          <div className="value-prop">
            <div className="value-prop-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="value-prop-text">
              <span className="value-prop-title">10 Min Delivery</span>
              <span className="value-prop-subtitle">Fastest in the city</span>
            </div>
          </div>
          <div className="value-prop">
            <div className="value-prop-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="value-prop-text">
              <span className="value-prop-title">Fresh Products</span>
              <span className="value-prop-subtitle">Quality guaranteed</span>
            </div>
          </div>
          <div className="value-prop">
            <div className="value-prop-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div className="value-prop-text">
              <span className="value-prop-title">Best Prices</span>
              <span className="value-prop-subtitle">Unbeatable value</span>
            </div>
          </div>
          <div className="value-prop">
            <div className="value-prop-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="value-prop-text">
              <span className="value-prop-title">Secure Payments</span>
              <span className="value-prop-subtitle">100% safe checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-compact">
        <h2>Shop by Category</h2>
        <div className="categories-scroll">
          {categories.map((category) => (
            <div
              key={category._id}
              className="category-chip"
              onClick={() => navigate(`/products?category=${category.name}`)}
            >
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <div className="section-heading">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>

        <div className="products-grid-clean">
          {featuredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card-clean"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="product-img">
                <img
                  src={config.getAssetUrl(product.image)}
                  alt={product.name}
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                />
                {product.stock < 10 && product.stock > 0 && (
                  <span className="badge-stock">Low Stock</span>
                )}
                {product.stock === 0 && (
                  <div className="out-of-stock">Out of Stock</div>
                )}
              </div>

              <div className="product-details-clean">
                <h3>{product.name}</h3>
                <p className="product-brand-clean">{product.brand || product.category}</p>

                <div className="product-bottom">
                  <span className="product-price-clean">₹{product.price}</span>
                  <button
                    className="btn-add-clean"
                    disabled={product.stock === 0}
                    onClick={(e) => addToCart(product, e)}
                  >
                    {product.stock === 0 ? 'Sold Out' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS - ML Powered */}
      {trendingProductIds.length > 0 && (
        <section className="recommendations-section">
          <RecommendationSection
            title="🔥 Trending Now"
            productIds={trendingProductIds}
            type="trending"
          />
        </section>
      )}

      {/* PERSONALIZED RECOMMENDATIONS - ML Powered */}
      {recommendedProductIds.length > 0 && (
        <section className="recommendations-section">
          <RecommendationSection
            title="🎯 Recommended for You"
            productIds={recommendedProductIds}
            type="personalized"
          />
        </section>
      )}



      {/* Floating Cart */}
      {JSON.parse(localStorage.getItem('cart') || '[]').length > 0 && (
        <button
          className="floating-cart"
          onClick={() => navigate('/cart')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="cart-badge">
            {JSON.parse(localStorage.getItem('cart') || '[]').reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}
    </div>
  );
}

export default Home;
