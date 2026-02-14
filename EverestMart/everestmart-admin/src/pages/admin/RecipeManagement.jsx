import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RecipeManagement() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/recipes`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setRecipes(data);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            await axios.delete(`${API_URL}/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Recipe deleted!');
            loadRecipes();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete recipe');
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Recipe Management</h1>
                    <p style={styles.subtitle}>Manage your recipe book and ingredients</p>
                </div>
                <button
                    style={styles.addBtn}
                    onClick={() => navigate('/recipes/add')}
                >
                    + Add Recipe
                </button>
            </div>

            {/* Search */}
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div style={styles.loading}>Loading...</div>
            ) : filteredRecipes.length === 0 ? (
                <div style={styles.empty}>No recipes found</div>
            ) : (
                <div style={styles.grid}>
                    {filteredRecipes.map(recipe => (
                        <div key={recipe._id} style={styles.card}>
                            <img
                                src={recipe.image || 'https://via.placeholder.com/300'}
                                alt={recipe.name}
                                style={styles.image}
                            />
                            <div style={styles.cardContent}>
                                <h3 style={styles.cardTitle}>{recipe.name}</h3>
                                <div style={styles.badges}>
                                    <span style={styles.badge}>{recipe.difficulty}</span>
                                    <span style={styles.badge}>{recipe.prepareTime}</span>
                                </div>
                                <p style={styles.cardDesc}>
                                    {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                                </p>

                                <div style={styles.actions}>
                                    <button
                                        style={styles.editBtn}
                                        onClick={() => navigate(`/recipes/edit/${recipe._id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleDelete(recipe._id)}
                                    >
                                        Delete
                                    </button>
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
        fontFamily: 'inherit',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#1F2937',
        margin: 0,
        letterSpacing: '-0.02em',
        lineHeight: '1.2'
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#6B7280',
        marginTop: '0.25rem',
        fontWeight: '500'
    },
    addBtn: {
        padding: '0.75rem 1.5rem',
        background: '#0c831f',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '700',
        transition: 'background 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
    },
    filters: {
        marginBottom: '2rem'
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        maxWidth: '400px',
        background: '#FFFFFF',
        transition: 'border 0.2s'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
    },
    card: {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderBottom: '1px solid #F3F4F6'
    },
    cardContent: {
        padding: '1.25rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    cardTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1F2937'
    },
    badges: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.75rem'
    },
    badge: {
        background: '#F3F4F6',
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#4B5563',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    cardDesc: {
        fontSize: '0.9rem',
        color: '#6B7280',
        margin: '0 0 1.25rem 0'
    },
    actions: {
        marginTop: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem'
    },
    editBtn: {
        padding: '0.6rem',
        background: '#FFFFFF',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#374151',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s'
    },
    deleteBtn: {
        padding: '0.6rem',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#DC2626',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s'
    },
    loading: {
        padding: '4rem',
        textAlign: 'center',
        color: '#6B7280'
    },
    empty: {
        padding: '4rem',
        textAlign: 'center',
        color: '#9CA3AF',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB'
    }
};

export default RecipeManagement;
