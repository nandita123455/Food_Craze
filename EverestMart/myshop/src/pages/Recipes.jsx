import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/recipes`);
                setRecipes(data);
            } catch (error) {
                console.error('Failed to load recipes');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Recipe Book</h1>
                <p style={styles.subtitle}>Discover delicious meals and shop ingredients in one click.</p>
            </header>

            {loading ? (
                <div style={styles.loading}>Loading recipes...</div>
            ) : recipes.length === 0 ? (
                <div style={styles.empty}>No recipes found. Check back later!</div>
            ) : (
                <div style={styles.grid}>
                    {recipes.map(recipe => (
                        <div
                            key={recipe._id}
                            style={styles.card}
                            onClick={() => navigate(`/recipe/${recipe._id}`)}
                        >
                            <div style={styles.imageContainer}>
                                <img src={recipe.image} alt={recipe.name} style={styles.image} />
                                <span style={styles.difficulty}>{recipe.difficulty}</span>
                            </div>
                            <div style={styles.content}>
                                <h3 style={styles.cardTitle}>{recipe.name}</h3>
                                <div style={styles.meta}>
                                    <span>⏱ {recipe.prepareTime}</span>
                                    <span>🥘 {recipe.ingredients.length} Ingredients</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        minHeight: '80vh'
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em'
    },
    subtitle: {
        fontSize: '1.125rem',
        color: '#6B7280',
        maxWidth: '600px',
        margin: '0 auto'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
    },
    card: {
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid #F3F4F6'
    },
    cardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    imageContainer: {
        position: 'relative',
        height: '220px'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    difficulty: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    content: {
        padding: '1.5rem'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: '0.75rem'
    },
    meta: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        color: '#6B7280',
        fontWeight: '500'
    },
    loading: { textAlign: 'center', padding: '4rem', color: '#9CA3AF' },
    empty: { textAlign: 'center', padding: '4rem', color: '#9CA3AF' }
};

export default Recipes;
