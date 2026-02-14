import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationService from '../services/recommendationService';
import ProductCard from './ProductCard'; // Assuming you have a ProductCard component

const RecommendedProducts = ({ type = 'trending', productId = null, title = 'Recommended for You' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [algorithm, setAlgorithm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            let response;

            try {
                if (type === 'user') {
                    // Personalized for logged in users
                    response = await RecommendationService.getUserRecommendations();

                    // Fallback to trending if user recs are empty or failed (handled in service, but check length)
                    if (!response.recommendations || response.recommendations.length === 0) {
                        response = await RecommendationService.getTrendingProducts();
                    }
                } else if (type === 'similar' && productId) {
                    response = await RecommendationService.getSimilarProducts(productId);
                } else {
                    response = await RecommendationService.getTrendingProducts();
                }

                if (response.success && response.recommendations) {
                    setProducts(response.recommendations);
                    setAlgorithm(response.algorithm || 'trending');
                }
            } catch (error) {
                console.error("Failed to load recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [type, productId]);

    if (loading) return null; // Or a skeleton loader
    if (products.length === 0) return null;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {title}
                    {algorithm === 'collaborative_filtering' && (
                        <span style={styles.badge}>
                            ✨ Picked for You
                        </span>
                    )}
                </h2>
            </div>

            <div style={styles.grid}>
                {products.map((product, index) => (
                    // Adapt product data format if needed. 
                    // Recommendation service might return a slightly different shape.
                    <ProductCard
                        key={`${product._id || product.product_id}-${index}`}
                        product={{
                            ...product,
                            _id: product._id || product.product_id, // Ensure ID is consistent
                            price: product.price || 0,
                            rating: product.rating || 0
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

const styles = {
    section: {
        margin: '2rem 0',
        maxWidth: '1280px',
        width: '100%',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    badge: {
        fontSize: '0.75rem',
        backgroundColor: '#f3e8ff',
        color: '#7e22ce',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontWeight: '500',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
    }
};

export default RecommendedProducts;
