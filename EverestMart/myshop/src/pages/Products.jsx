import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  // ✅ Updated with actual categories from imported products
  const categories = ['All', 'Groceries', 'Dairy', 'Snacks']

  useEffect(() => {
    fetchProducts()
  }, [filter, search, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filter !== 'All') params.category = filter
      if (search) params.search = search
      if (sortBy !== 'default') params.sort = sortBy

      const data = await getProducts(params)
      setProducts(data.products || data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Discover Products</h1>
        <p style={styles.subtitle}>{products.length} products available</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {search && (
          <button onClick={() => setSearch('')} style={styles.clearBtn}>
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            style={{
              ...styles.categoryTab,
              ...(filter === category ? styles.categoryTabActive : {})
            }}
          >
            {category}
            {filter === category && <span style={styles.activeIndicator} />}
          </button>
        ))}
      </div>

      {/* Sort & Filters */}
      <div style={styles.filtersBar}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="default">Sort by: Default</option>
          <option value="price-low">Sort by: Price Low to High</option>
          <option value="price-high">Sort by: Price High to Low</option>
          <option value="name">Sort by: Name A to Z</option>
        </select>
      </div>

      {/* Results count */}
      <p style={styles.results}>
        {loading ? 'Loading...' : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`}
      </p>

      {/* Products Grid */}
      {loading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : (
        <div style={styles.grid}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No products found</p>
          <button onClick={() => { setSearch(''); setFilter('All') }} style={styles.clearButton}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)',
    background: '#f9fafb'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#111827',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
    margin: 0
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem'
  },
  searchIcon: {
    position: 'absolute',
    left: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1.5rem 1rem 3.5rem',
    fontSize: '1.1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    background: 'white'
  },
  clearBtn: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryTabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
    overflowX: 'auto',
    paddingBottom: '0.5rem'
  },
  categoryTab: {
    position: 'relative',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  categoryTabActive: {
    color: '#2563eb'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
    borderRadius: '3px 3px 0 0'
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1.5rem'
  },
  sortSelect: {
    padding: '0.75rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'white',
    transition: 'all 0.2s'
  },
  results: {
    color: '#6b7280',
    fontSize: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#6b7280'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  emptyText: {
    fontSize: '1.5rem',
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  clearButton: {
    padding: '0.75rem 2rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}

// Add CSS animations
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  input[style*="border: 2px solid"]:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
  }
  select[style*="cursor: pointer"]:hover {
    border-color: #2563eb !important;
  }
  button[style*="categoryTab"]:hover {
    color: #2563eb !important;
  }
  button[style*="clearButton"]:hover {
    background: #1d4ed8 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
`
document.head.appendChild(styleSheet)

export default Products
