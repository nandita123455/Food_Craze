import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../services/api';

function RecommendationSection({
    title = "Recommended for You",
    productIds = [],
    type = "personalized" // 'personalized', 'similar', 'trending'
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productIds && productIds.length > 0) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [productIds]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // Fetch full product details for recommended product IDs
            const response = await getProducts();
            const allProducts = response.products || response || [];

            // Filter to only recommended products
            const recommendedProducts = allProducts.filter(product =>
                productIds.includes(product._id?.toString() || product.id?.toString())
            );

            // Sort by recommendation order
            const sortedProducts = recommendedProducts.sort((a, b) => {
                return productIds.indexOf(a._id?.toString() || a.id?.toString()) -
                    productIds.indexOf(b._id?.toString() || b.id?.toString());
            });

            setProducts(sortedProducts);
        } catch (error) {
            console.error('Error fetching recommended products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>{title}</h2>
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading recommendations...</p>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null; // Don't show section if no recommendations
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>{title}</h2>
                <div style={styles.badge}>{products.length} items</div>
            </div>

            <div style={styles.scrollContainer}>
                <div style={styles.productGrid}>
                    {products.map(product => (
                        <div key={product._id} style={styles.productWrapper}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem 0',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingLeft: '2rem'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#111827',
        margin: 0
    },
    badge: {
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '600'
    },
    scrollContainer: {
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9'
    },
    productGrid: {
        display: 'flex',
        gap: '1.5rem',
        padding: '0 2rem 1rem',
        minWidth: 'min-content'
    },
    productWrapper: {
        minWidth: '280px',
        maxWidth: '280px',
        flexShrink: 0
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    },
    spinner: {
        width: '40px',
        height: '40px',
        margin: '0 auto 1rem',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Scrollbar styles */
  .recommendation-section::-webkit-scrollbar {
    height: 8px;
  }
  
  .recommendation-section::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  .recommendation-section::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  .recommendation-section::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;
if (!document.head.querySelector('style[data-recommendation-styles]')) {
    styleSheet.setAttribute('data-recommendation-styles', 'true');
    document.head.appendChild(styleSheet);
}

export default RecommendationSection;
