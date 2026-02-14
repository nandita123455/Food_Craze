import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

function RecipeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [customQuantities, setCustomQuantities] = useState({});

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const loadRecipe = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/recipes/${id}`);
                setRecipe(data);

                // Initialize custom quantities with default recipe quantities
                const initialQuantities = {};
                data.ingredients.forEach(ing => {
                    if (ing.product) {
                        initialQuantities[ing.product._id] = ing.quantity;
                    }
                });
                setCustomQuantities(initialQuantities);
            } catch (error) {
                console.error('Failed to load recipe');
            } finally {
                setLoading(false);
            }
        };
        loadRecipe();
    }, [id]);

    const handleQuantityChange = (productId, change) => {
        setCustomQuantities(prev => {
            const current = prev[productId] || 0;
            const newValue = Math.max(0, current + change); // Prevent negative
            return { ...prev, [productId]: newValue };
        });
    };

    const handleBuyIngredients = () => {
        if (!recipe) return;
        setAddingToCart(true);

        let addedCount = 0;
        recipe.ingredients.forEach(ing => {
            if (ing.product && ing.product.stock > 0) {
                const qtyToAdd = customQuantities[ing.product._id] || 0;
                if (qtyToAdd > 0) {
                    addToCart({
                        ...ing.product,
                        quantity: qtyToAdd
                    });
                    addedCount++;
                }
            }
        });

        if (addedCount === 0) {
            setAddingToCart(false);
            alert("No ingredients selected to add.");
            return;
        }

        setTimeout(() => {
            setAddingToCart(false);
            alert(`✅ ${addedCount} ingredients added to cart!`);
            navigate('/cart');
        }, 500);
    };

    if (loading) return <div style={styles.loading}>Loading recipe...</div>;
    if (!recipe) return <div style={styles.error}>Recipe not found</div>;

    const totalCost = recipe.ingredients.reduce((sum, ing) => {
        const qty = customQuantities[ing.product?._id] || 0;
        return sum + (ing.product?.price || 0) * qty;
    }, 0);

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <img src={recipe.image} alt={recipe.name} style={styles.heroImage} />
                <div style={styles.heroOverlay}>
                    <div style={styles.heroContent}>
                        <span style={styles.difficultyBadge}>{recipe.difficulty}</span>
                        <h1 style={styles.title}>{recipe.name}</h1>
                        <p style={styles.meta}>
                            ⏱ {recipe.prepareTime} • {recipe.ingredients.length} Ingredients
                        </p>
                    </div>
                </div>
            </div>

            <div style={styles.contentGrid}>
                {/* Left Column: Ingredients */}
                <div style={styles.leftCol}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.sectionTitle}>Ingredients</h2>
                            <span style={styles.totalCost}>Est. Cost: ₹{totalCost.toFixed(2)}</span>
                        </div>

                        <ul style={styles.ingredientList}>
                            {recipe.ingredients.map((ing, i) => {
                                const productId = ing.product?._id;
                                const currentQty = customQuantities[productId] || 0;

                                return (
                                    <li key={i} style={styles.ingredientItem}>
                                        <img
                                            src={ing.product?.image || '/placeholder.png'}
                                            alt={ing.product?.name}
                                            style={styles.ingImage}
                                        />
                                        <div style={styles.ingInfo}>
                                            <p style={styles.ingName}>{ing.product?.name || 'Unknown Product'}</p>
                                            <div style={styles.unitInfo}>
                                                <span style={styles.recQty}>Recipe needs: {ing.quantity} {ing.unit}</span>
                                            </div>
                                        </div>

                                        {ing.product ? (
                                            <div style={styles.qtyControl}>
                                                <button
                                                    style={styles.qtyBtn}
                                                    onClick={() => handleQuantityChange(productId, -1)}
                                                    disabled={currentQty <= 0}
                                                >-</button>
                                                <span style={styles.qtyInfo}>{currentQty}</span>
                                                <button
                                                    style={styles.qtyBtn}
                                                    onClick={() => handleQuantityChange(productId, 1)}
                                                >+</button>
                                            </div>
                                        ) : (
                                            <span style={styles.unavailable}>Unavailable</span>
                                        )}

                                        <div style={styles.ingPrice}>
                                            {ing.product ? `₹${(ing.product.price * currentQty).toFixed(2)}` : 'N/A'}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        <button
                            style={{
                                ...styles.buyBtn,
                                opacity: totalCost > 0 ? 1 : 0.5,
                                cursor: totalCost > 0 ? 'pointer' : 'not-allowed'
                            }}
                            onClick={handleBuyIngredients}
                            disabled={addingToCart || totalCost === 0}
                        >
                            {addingToCart ? 'Adding...' : `Shop Selected Ingredients (₹${totalCost.toFixed(2)})`}
                        </button>
                    </div>
                </div>

                {/* Right Column: Instructions */}
                <div style={styles.rightCol}>
                    <div style={{ ...styles.card, padding: '2rem' }}>
                        <h2 style={styles.sectionTitle}>Instructions</h2>
                        <div style={styles.instructions}>
                            {recipe.instructions.map((step, i) => (
                                <div key={i} style={styles.step}>
                                    <div style={styles.stepNum}>{i + 1}</div>
                                    <p style={styles.stepText}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.descriptionCard}>
                        <h3>About this dish</h3>
                        <p>{recipe.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' },
    loading: { textAlign: 'center', padding: '4rem', color: '#888' },
    error: { textAlign: 'center', padding: '4rem', color: '#ef4444' },

    hero: { position: 'relative', height: '400px', borderRadius: '0 0 24px 24px', overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
    heroOverlay: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
    },
    heroContent: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '3rem', color: '#fff'
    },
    difficultyBadge: {
        background: '#10b981', color: '#fff', padding: '0.25rem 0.75rem',
        borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold',
        textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block'
    },
    title: { fontSize: '3rem', margin: '0 0 0.5rem 0', fontWeight: '800' },
    meta: { fontSize: '1.25rem', opacity: 0.9 },

    contentGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem',
        padding: '2rem 1.5rem', marginTop: '-2rem', position: 'relative', zIndex: 10
    },
    card: { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    descriptionCard: { marginTop: '2rem', padding: '1.5rem', color: '#4b5563', lineHeight: '1.6' },

    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    sectionTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '700' },
    totalCost: { fontSize: '1.1rem', fontWeight: '600', color: '#10b981' },

    ingredientList: { listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' },
    ingredientItem: {
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0',
        borderBottom: '1px solid #f3f4f6'
    },
    unitInfo: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    recQty: { fontSize: '0.8rem', color: '#666', fontStyle: 'italic' },

    qtyControl: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f8f9fa', borderRadius: '8px', padding: '4px'
    },
    qtyBtn: {
        width: '24px', height: '24px', borderRadius: '4px', border: 'none',
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
    },
    qtyInfo: { minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' },
    unavailable: { color: '#ef4444', fontStyle: 'italic', fontSize: '0.875rem' },

    ingImage: { width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' },
    ingInfo: { flex: 1, paddingRight: '1rem' },
    ingName: { margin: 0, fontWeight: '600', color: '#1f2937' },
    ingPrice: { fontWeight: '600', color: '#1f2937', minWidth: '60px', textAlign: 'right' },

    buyBtn: {
        width: '100%', padding: '1rem', background: '#1A1A1A', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600',
        cursor: 'pointer', transition: '0.2s', marginTop: '1rem'
    },

    instructions: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    step: { display: 'flex', gap: '1rem' },
    stepNum: {
        minWidth: '32px', height: '32px', background: '#f3f4f6', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', color: '#1A1A1A'
    },
    stepText: { margin: 0, lineHeight: '1.6', color: '#374151', paddingTop: '0.25rem' }
};

export default RecipeDetails;
