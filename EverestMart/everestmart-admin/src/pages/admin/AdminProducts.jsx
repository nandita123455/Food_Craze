import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: ''
  });
  const navigate = useNavigate();

  const categories = [
    'Mobile Phones', 'Laptops', 'Televisions', 'Chicken', 'Mutton',
    'Vegetables - Leafy Greens', 'Fruits - Citrus', 'Dairy - Milk',
    'Bread & Buns', 'Rice', 'Soft Drinks', 'Chips & Namkeen'
    // Add more from your schema as needed
  ];


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/products`);
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingProduct) {
        await axios.put(
          `${config.API_URL}/products/${editingProduct._id}`,
          formData,
          axiosConfig
        );
        alert('Product updated successfully!');
      } else {
        await axios.post(
          `${config.API_URL}/products`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Product added successfully!');
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' });
      fetchProducts();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Product Management</h1>
        <button onClick={() => navigate('/admin')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingProduct(null);
          setFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' });
        }}
        style={styles.addBtn}
      >
        {showForm ? '✕ Cancel' : '+ Add New Product'}
      </button>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>

          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            style={styles.input}
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            style={{ ...styles.input, minHeight: '100px' }}
          />

          <input
            type="url"
            placeholder="Image URL (https://...)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            style={styles.input}
          />

          {formData.image && (
            <div style={styles.imagePreview}>
              <img src={formData.image} alt="Preview" style={styles.previewImg} />
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      {/* Products Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} style={styles.tableRow}>
                <td style={styles.td}>
                  <img src={config.getAssetUrl(product.image)} alt={product.name} style={styles.productImg} />
                </td>
                <td style={styles.td}>{product.name}</td>
                <td style={styles.td}>
                  <span style={styles.categoryBadge}>{product.category}</span>
                </td>
                <td style={styles.td}>₹{product.price}</td>
                <td style={styles.td}>{product.stock || 'N/A'}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(product)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'inherit'
  },
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
    margin: 0,
    letterSpacing: '-0.02em'
  },
  backBtn: {
    background: '#FFFFFF',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },
  addBtn: {
    background: '#0c831f',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '2rem',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
    transition: 'background 0.2s'
  },
  form: {
    background: '#FFFFFF',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
    border: '1px solid #E5E7EB',
    maxWidth: '800px',
    margin: '0 auto 2rem auto'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    margin: '0 0 1rem 0',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#F9FAFB'
  },
  imagePreview: {
    marginBottom: '1rem',
    textAlign: 'center',
    background: '#F9FAFB',
    padding: '1rem',
    borderRadius: '8px'
  },
  previewImg: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    objectFit: 'contain'
  },
  submitBtn: {
    background: '#0c831f',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s'
  },
  tableContainer: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '0',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
    overflowX: 'auto',
    border: '1px solid #E5E7EB'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0'
  },
  tableHeader: {
    background: '#F9FAFB'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#6B7280',
    borderBottom: '1px solid #E5E7EB',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tableRow: {
    transition: 'background 0.1s'
  },
  td: {
    padding: '1rem',
    color: '#1F2937',
    borderBottom: '1px solid #F3F4F6',
    verticalAlign: 'middle',
    fontSize: '0.95rem'
  },
  productImg: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: '1px solid #F3F4F6',
    background: '#F9FAFB'
  },
  categoryBadge: {
    background: '#F3F4F6',
    color: '#4B5563',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  editBtn: {
    background: '#FFFFFF',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  deleteBtn: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem'
  }
};

export default AdminProducts;
