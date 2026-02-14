import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import config from '../config/config'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [categories, setCategories] = useState(['All'])

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch categories on mount
    const fetchCategories = async () => {
      try {
        // Use the centralized categories endpoint for consistency
        const response = await fetch(`${config.API_BASE_URL}/categories`)
        const data = await response.json()

        // Handle array response from /api/categories
        const categoryNames = Array.isArray(data)
          ? data.map(c => c.name)
          : (data.categories || [])

        setCategories(['All', ...categoryNames])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Sync filter with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    const searchParam = params.get('search')

    if (categoryParam) {
      setFilter(categoryParam)
    } else {
      setFilter('All')
    }

    if (searchParam) {
      setSearch(searchParam)
    }
  }, [location.search])

  useEffect(() => {
    fetchProducts()
  }, [filter, search, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}

      if (filter !== 'All') params.category = filter
      if (search) params.search = search

      // Fix sort params to match backend expectation
      if (sortBy === 'price-low') {
        params.sortBy = 'price'
        params.sortOrder = 'asc'
      } else if (sortBy === 'price-high') {
        params.sortBy = 'price'
        params.sortOrder = 'desc'
      } else if (sortBy === 'name') {
        params.sortBy = 'name'
        params.sortOrder = 'asc'
      } else {
        params.sortBy = 'createdAt'
        params.sortOrder = 'desc'
      }

      const data = await getProducts(params)
      setProducts(data.products || data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category) => {
    setFilter(category)
    // Update URL without reloading
    const params = new URLSearchParams(location.search)
    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    navigate({ search: params.toString() })
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    // Optional: Update URL for search too
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
          onChange={handleSearchChange}
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
            onClick={() => handleCategoryClick(category)}
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
          <button onClick={() => { setSearch(''); handleCategoryClick('All') }} style={styles.clearButton}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem 1rem',
    maxWidth: '1280px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)',
    background: '#F3F4F6'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6B7280',
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
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#9CA3AF'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    fontSize: '1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    background: 'white',
    color: '#1F2937'
  },
  clearBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#F3F4F6',
    color: '#6B7280',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollbarWidth: 'none'
  },
  categoryTab: {
    padding: '0.5rem 1.25rem',
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '9999px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4B5563',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  categoryTabActive: {
    background: '#ecfdf5',
    color: '#0c831f',
    borderColor: '#0c831f'
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1.5rem'
  },
  sortSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'white',
    color: '#374151',
    outline: 'none'
  },
  results: {
    color: '#6B7280',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#6B7280'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '3rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB'
  },
  emptyText: {
    fontSize: '1.2rem',
    color: '#6B7280',
    marginBottom: '1.5rem'
  },
  clearButton: {
    padding: '0.75rem 1.5rem',
    background: '#0c831f',
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
