import { useState, useEffect } from 'react';
import axios from 'axios';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    unit: 'pcs',
    unitQuantity: '1',
    lowStockThreshold: '10',
    image: null
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '📦'
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'g', label: 'Gram' },
    { value: 'ltr', label: 'Liter' },
    { value: 'ml', label: 'Milliliter' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'box', label: 'Box' },
    { value: 'packet', label: 'Packet' }
  ];

  useEffect(() => {
    const loadData = async () => {
      await loadProducts();
      await loadCategories();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setProducts(Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load categories error:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name || categoryFormData.name.trim() === '') {
      alert('❌ Please enter a category name!');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/categories`,
        {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          icon: categoryFormData.icon || '📦'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`✅ Category "${data.category.name}" created!`);
      setCategories([...categories, data.category]);
      setFormData({ ...formData, category: data.category.name });
      setShowCategoryForm(false);
      setCategoryFormData({ name: '', description: '', icon: '📦' });
    } catch (error) {
      alert('Failed to create category: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || formData.category.trim() === '') {
      alert('❌ Please select a category!');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('unitQuantity', formData.unitQuantity);
      formDataToSend.append('lowStockThreshold', formData.lowStockThreshold);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingProduct) {
        await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('✅ Product updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/products`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('✅ Product added successfully!');
      }

      resetForm();
      loadProducts();
    } catch (error) {
      alert('Failed to save product: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      unit: 'pcs',
      unitQuantity: '1',
      lowStockThreshold: '10',
      image: null
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      unit: product.unit || 'pcs',
      unitQuantity: product.unitQuantity || '1',
      lowStockThreshold: product.lowStockThreshold || '10',
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Product deleted!');
      loadProducts();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  const getStockStatus = (product) => {
    if (product.stock <= 0) return 'out';
    if (product.stock <= (product.lowStockThreshold || 10)) return 'low';
    return 'in';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > (p.lowStockThreshold || 10)).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length,
    outOfStock: products.filter(p => p.stock <= 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Product Management</h1>
          <div style={styles.statsRow}>
            <span style={styles.statItem}>Total: {stats.total}</span>
            <span style={{...styles.statItem, color: '#10b981'}}>In Stock: {stats.inStock}</span>
            <span style={{...styles.statItem, color: '#f59e0b'}}>Low: {stats.lowStock}</span>
            <span style={{...styles.statItem, color: '#ef4444'}}>Out: {stats.outOfStock}</span>
            <span style={styles.statItem}>Value: ₹{stats.totalValue.toFixed(2)}</span>
          </div>
        </div>
        <button 
          style={styles.addBtn} 
          onClick={() => {
            console.log('Add Product clicked');
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              brand: '',
              stock: '',
              unit: 'pcs',
              unitQuantity: '1',
              lowStockThreshold: '10',
              image: null
            });
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={styles.modal} onClick={resetForm}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button style={styles.closeBtn} onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="e.g., Basmati Rice"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="e.g., India Gate"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={styles.textarea}
                  placeholder="Product description..."
                  rows="3"
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.categoryHeader}>
                  <label style={styles.label}>Category *</label>
                  <button
                    type="button"
                    style={styles.newCategoryBtn}
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                  >
                    {showCategoryForm ? '× Cancel' : '+ New Category'}
                  </button>
                </div>

                {showCategoryForm ? (
                  <div style={styles.inlineCategoryForm}>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      placeholder="Category name"
                      style={styles.input}
                    />
                    <input
                      type="text"
                      name="icon"
                      value={categoryFormData.icon}
                      onChange={handleCategoryInputChange}
                      placeholder="📦"
                      style={{...styles.input, width: '60px'}}
                      maxLength="2"
                    />
                    <button type="button" style={styles.saveCategoryBtn} onClick={handleCreateCategory}>
                      Save
                    </button>
                  </div>
                ) : (
                  <select name="category" value={formData.category} onChange={handleInputChange} required style={styles.input}>
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="99.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="100"
                    min="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Low Alert *</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit *</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange} required style={styles.input}>
                    {unitOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    type="number"
                    name="unitQuantity"
                    value={formData.unitQuantity}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="1"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image * {editingProduct && '(Optional)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingProduct}
                  style={styles.fileInput}
                />
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Add Product')}
                </button>
                <button type="button" style={styles.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, brand, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={styles.empty}>No products found</div>
      ) : (
        <div style={styles.productsGrid}>
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product);
            return (
              <div key={product._id} style={styles.productCard}>
                {stockStatus === 'out' && <div style={styles.outBadge}>OUT OF STOCK</div>}
                {stockStatus === 'low' && <div style={styles.lowBadge}>LOW STOCK</div>}
                
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`} 
                  alt={product.name}
                  style={{...styles.productImage, opacity: stockStatus === 'out' ? 0.5 : 1}}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  {product.brand && <p style={styles.brand}>{product.brand}</p>}
                  <p style={styles.productDesc}>{product.description}</p>
                  
                  <div style={styles.productMeta}>
                    <span style={styles.price}>₹{product.price}</span>
                    <span style={styles.unit}>{product.unitQuantity} {product.unit}</span>
                  </div>

                  <div style={styles.productMeta}>
                    <span style={{
                      ...styles.stockBadge,
                      background: stockStatus === 'out' ? '#ef4444' : stockStatus === 'low' ? '#f59e0b' : '#10b981'
                    }}>
                      Stock: {product.stock}
                    </span>
                    <span style={styles.category}>{product.category}</span>
                  </div>

                  <div style={styles.productActions}>
                    <button style={styles.editBtn} onClick={() => handleEdit(product)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statsRow: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },
  statItem: {
    fontSize: '0.8125rem',
    color: '#5A5A5A',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem'
  },
  modalContent: {
    background: '#FFFFFF',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E5E2DD'
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#1A1A1A',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#8B8B8B',
    padding: 0,
    lineHeight: 1
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none'
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  newCategoryBtn: {
    padding: '0.375rem 0.75rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  inlineCategoryForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  saveCategoryBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  fileInput: {
    padding: '0.5rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem'
  },
  formActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem'
  },
  submitBtn: {
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cancelBtn: {
    padding: '1rem',
    background: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #E5E2DD',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    outline: 'none'
  },
  filterSelect: {
    padding: '0.75rem 1rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    minWidth: '200px',
    outline: 'none'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4rem',
    color: '#8B8B8B'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E2DD',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: '#8B8B8B',
    background: '#FFFFFF',
    border: '1px solid #E5E2DD'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  productCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    overflow: 'hidden',
    position: 'relative'
  },
  outBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#ef4444',
    color: '#FFFFFF',
    padding: '0.375rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    zIndex: 10
  },
  lowBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#f59e0b',
    color: '#FFFFFF',
    padding: '0.375rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    zIndex: 10
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  productInfo: {
    padding: '1rem'
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: '#1A1A1A'
  },
  brand: {
    fontSize: '0.75rem',
    color: '#8B8B8B',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '500'
  },
  productDesc: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    marginBottom: '0.75rem',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },
  price: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  unit: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    background: '#F8F7F5',
    padding: '0.25rem 0.75rem',
    fontWeight: '500'
  },
  stockBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  category: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#F8F7F5',
    color: '#5A5A5A',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  productActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  editBtn: {
    padding: '0.625rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  deleteBtn: {
    padding: '0.625rem',
    background: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #E5E2DD',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};

export default ProductManagement;
