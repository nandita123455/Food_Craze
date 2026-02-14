import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function AddEditRecipe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        prepareTime: '',
        difficulty: 'Medium',
        instructions: [''],
        ingredients: []
    });

    const [ingredientSearch, setIngredientSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState('pcs');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadProducts();
        if (id) {
            loadRecipe();
        }
    }, [id]);

    const loadProducts = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/products`);
            setProducts(data.products || data || []);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    const loadRecipe = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/recipes/${id}`);
            setFormData({
                name: data.name,
                description: data.description,
                image: data.image,
                prepareTime: data.prepareTime,
                difficulty: data.difficulty,
                instructions: data.instructions,
                ingredients: data.ingredients.map(ing => ({
                    product: ing.product._id, // Store ID only for submission
                    productName: ing.product.name, // Display helper
                    productImage: ing.product.image, // Display helper
                    quantity: ing.quantity,
                    unit: ing.unit
                }))
            });
        } catch (error) {
            console.error('Failed to load recipe');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Instruction Handlers
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = value;
        setFormData({ ...formData, instructions: newInstructions });
    };

    const addInstruction = () => {
        setFormData({ ...formData, instructions: [...formData.instructions, ''] });
    };

    const removeInstruction = (index) => {
        const newInstructions = formData.instructions.filter((_, i) => i !== index);
        setFormData({ ...formData, instructions: newInstructions });
    };

    // Ingredient Handlers
    const addIngredient = () => {
        if (!selectedProduct) return;

        const product = products.find(p => p._id === selectedProduct);
        if (!product) return;

        // Check if already added
        if (formData.ingredients.some(ing => ing.product === product._id)) {
            alert('Ingredient already added!');
            return;
        }

        const newIngredient = {
            product: product._id,
            productName: product.name,
            productImage: product.image,
            quantity: selectedQty,
            unit: selectedUnit
        };

        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, newIngredient]
        });

        // Reset selection
        setSelectedProduct('');
        setSelectedQty(1);
        setIngredientSearch('');
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const payload = {
                ...formData,
                // Ensure we send valid MongoIDs
                ingredients: formData.ingredients.map(ing => ({
                    product: ing.product,
                    quantity: ing.quantity,
                    unit: ing.unit
                })),
                instructions: formData.instructions.filter(i => i.trim() !== '')
            };

            if (id) {
                await axios.put(`${API_URL}/recipes/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('✅ Recipe updated!');
            } else {
                await axios.post(`${API_URL}/recipes`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('✅ Recipe created!');
            }
            navigate('/recipes');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save recipe');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>{id ? 'Edit Recipe' : 'Add New Recipe'}</h1>
                <button style={styles.cancelBtn} onClick={() => navigate('/recipes')}>Cancel</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Basic Info */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Basic Information</h3>
                    <div style={styles.row}>
                        <div style={styles.group}>
                            <label style={styles.label}>Recipe Name</label>
                            <input
                                style={styles.input}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.label}>Image URL</label>
                            <input
                                style={styles.input}
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://..."
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.group}>
                            <label style={styles.label}>Preparation Time</label>
                            <input
                                style={styles.input}
                                name="prepareTime"
                                value={formData.prepareTime}
                                onChange={handleChange}
                                placeholder="e.g., 30 mins"
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.label}>Difficulty</label>
                            <select
                                style={styles.input}
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.group}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={styles.textarea}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Ingredients */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Ingredients</h3>
                    <div style={styles.ingredientSelector}>
                        <div style={styles.group}>
                            <label style={styles.label}>Search Product</label>
                            <select
                                style={styles.input}
                                value={selectedProduct}
                                onChange={(e) => {
                                    setSelectedProduct(e.target.value);
                                    const p = products.find(prod => prod._id === e.target.value);
                                    if (p) setSelectedUnit(p.unit || 'pcs');
                                }}
                            >
                                <option value="">-- Select Product --</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock)</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ ...styles.group, maxWidth: '100px' }}>
                            <label style={styles.label}>Qty</label>
                            <input
                                type="number"
                                style={styles.input}
                                value={selectedQty}
                                onChange={(e) => setSelectedQty(e.target.value)}
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                        <div style={{ ...styles.group, maxWidth: '100px' }}>
                            <label style={styles.label}>Unit</label>
                            <input
                                style={styles.input}
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            style={styles.addIngredientBtn}
                            onClick={addIngredient}
                        >
                            Add
                        </button>
                    </div>

                    <div style={styles.ingredientList}>
                        {formData.ingredients.map((ing, i) => (
                            <div key={i} style={styles.ingredientItem}>
                                <img src={ing.productImage || '/placeholder.png'} style={styles.miniImg} alt="" />
                                <div style={{ flex: 1 }}>
                                    <strong>{ing.productName}</strong>
                                    <br />
                                    <small>{ing.quantity} {ing.unit}</small>
                                </div>
                                <button
                                    type="button"
                                    style={styles.removeBtn}
                                    onClick={() => removeIngredient(i)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {formData.ingredients.length === 0 && (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No ingredients added yet.</p>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Instructions</h3>
                    {formData.instructions.map((step, i) => (
                        <div key={i} style={styles.instructionRow}>
                            <span style={styles.stepNum}>{i + 1}.</span>
                            <textarea
                                style={styles.stepInput}
                                value={step}
                                onChange={(e) => handleInstructionChange(i, e.target.value)}
                                placeholder={`Step ${i + 1} description...`}
                                rows="2"
                            />
                            <button
                                type="button"
                                style={styles.removeBtn}
                                onClick={() => removeInstruction(i)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        style={styles.addStepBtn}
                        onClick={addInstruction}
                    >
                        + Add Step
                    </button>
                </div>

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Recipe'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', fontFamily: 'inherit' },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: '-0.02em',
        margin: 0
    },
    cancelBtn: {
        background: '#FFFFFF',
        border: '1px solid #D1D5DB',
        padding: '0.6rem 1.2rem',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151',
        transition: 'all 0.2s'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    section: {
        background: '#FFFFFF',
        padding: '2rem',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
    },
    sectionTitle: {
        margin: '0 0 1.5rem 0',
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1F2937',
        borderBottom: '1px solid #F3F4F6',
        paddingBottom: '1rem'
    },
    row: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    group: { display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem', minWidth: '200px' },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151'
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border 0.2s',
        background: '#F9FAFB'
    },
    textarea: {
        padding: '0.75rem',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '100px',
        outline: 'none',
        background: '#F9FAFB'
    },

    ingredientSelector: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
        background: '#F9FAFB',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #F3F4F6',
        flexWrap: 'wrap'
    },
    addIngredientBtn: {
        padding: '0.75rem 1.5rem',
        background: '#0c831f',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        height: '42px',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'background 0.2s'
    },
    ingredientList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    ingredientItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        padding: '1rem',
        borderRadius: '8px',
        transition: 'box-shadow 0.2s'
    },
    miniImg: {
        width: '48px',
        height: '48px',
        objectFit: 'cover',
        borderRadius: '6px',
        background: '#F3F4F6'
    },
    removeBtn: {
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#DC2626',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: 1,
        transition: 'all 0.2s',
        marginLeft: 'auto'
    },

    instructionRow: { display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' },
    stepNum: {
        fontWeight: '700',
        paddingTop: '0.75rem',
        color: '#0c831f',
        minWidth: '24px'
    },
    stepInput: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        background: '#F9FAFB',
        fontFamily: 'inherit'
    },
    addStepBtn: {
        background: '#F9FAFB',
        border: '2px dashed #D1D5DB',
        color: '#6B7280',
        padding: '1rem',
        width: '100%',
        cursor: 'pointer',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        marginTop: '1rem'
    },
    submitBtn: {
        padding: '1rem',
        background: '#0c831f',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'background 0.2s'
    }
};

export default AddEditRecipe;
