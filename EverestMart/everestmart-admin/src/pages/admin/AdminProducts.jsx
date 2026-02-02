import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const { data } = await axios.get(`http://localhost:5000`http://localhost:5000'}/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingProduct) {
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${editingProduct._id}`,
          formData,
          config
        );
        alert('Product updated successfully!');
      } else {
        await axios.post(
          `http://localhost:5000`http://localhost:5000'}/api/products',
          formData,
          config
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
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
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
                  <img src={product.image} alt={product.name} style={styles.productImg} />
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
    padding: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    color: '#111827'
  },
  backBtn: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  addBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '2rem'
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box'
  },
  imagePreview: {
    marginBottom: '1rem',
    textAlign: 'center'
  },
  previewImg: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  submitBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f3f4f6'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    color: '#6b7280'
  },
  productImg: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  categoryBadge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  editBtn: {
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontWeight: '600'
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default AdminProducts;
