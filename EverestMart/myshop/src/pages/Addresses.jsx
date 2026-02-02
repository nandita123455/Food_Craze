import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config'; 
function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const { data } = await axios.get(`${config.API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAddresses(data.addresses || []);
   } catch (error) {
  console.error('Failed to load addresses:', error);
  if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update existing address
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        alert('✅ Address updated successfully!');
      } else {
        // Add new address
        await axios.post(`${config.API_BASE_URL}/addresses`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        alert('✅ Address added successfully!');
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAddresses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Address deleted successfully!');
      loadAddresses();
    } catch (error) {
      alert('Failed to delete address');
    }
  };

  const setDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${id}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      loadAddresses();
    } catch (error) {
      alert('Failed to set default address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingId(null);
  };

  const getLabelIcon = (label) => {
    const icons = {
      Home: '🏠',
      Work: '💼',
      Other: '📍'
    };
    return icons[label] || '📍';
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>My Addresses</h1>
        <button 
          style={styles.addBtn}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Label Selection */}
              <div style={styles.labelSelector}>
                {['Home', 'Work', 'Other'].map(label => (
                  <button
                    key={label}
                    type="button"
                    style={{
                      ...styles.labelBtn,
                      ...(formData.label === label ? styles.labelBtnActive : {})
                    }}
                    onClick={() => setFormData({...formData, label})}
                  >
                    {getLabelIcon(label)} {label}
                  </button>
                ))}
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="John Doe"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    pattern="[0-9]{10}"
                    style={styles.input}
                    placeholder="9876543210"
                  />
                </div>

                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                  <label style={styles.label}>Address Line 1 *</label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="Flat, House no., Building, Company, Apartment"
                  />
                </div>

                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                  <label style={styles.label}>Address Line 2</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                    style={styles.input}
                    placeholder="Area, Street, Sector, Village"
                  />
                </div>

                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                  <label style={styles.label}>Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    style={styles.input}
                    placeholder="Near school, hospital, etc."
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="Mumbai"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="Maharashtra"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    required
                    pattern="[0-9]{6}"
                    style={styles.input}
                    placeholder="400001"
                  />
                </div>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  style={styles.checkbox}
                />
                <label htmlFor="isDefault" style={styles.checkboxLabel}>
                  Set as default address
                </label>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📍</div>
          <h2>No addresses saved</h2>
          <p>Add your first delivery address to get started!</p>
          <button 
            style={styles.emptyAddBtn}
            onClick={() => setShowForm(true)}
          >
            + Add Address
          </button>
        </div>
      ) : (
        <div style={styles.addressGrid}>
          {addresses.map(address => (
            <div 
              key={address._id} 
              style={{
                ...styles.addressCard,
                ...(address.isDefault ? styles.defaultCard : {})
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.labelTag}>
                  {getLabelIcon(address.label)} {address.label}
                </div>
                {address.isDefault && (
                  <span style={styles.defaultBadge}>Default</span>
                )}
              </div>

              <div style={styles.cardBody}>
                <p style={styles.addressName}>{address.fullName}</p>
                <p style={styles.addressPhone}>📞 {address.phone}</p>
                <p style={styles.addressText}>
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                {address.landmark && (
                  <p style={styles.addressLandmark}>
                    Landmark: {address.landmark}
                  </p>
                )}
                <p style={styles.addressText}>
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>

              <div style={styles.cardActions}>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleEdit(address)}
                >
                  ✏️ Edit
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleDelete(address._id)}
                >
                  🗑️ Delete
                </button>
                {!address.isDefault && (
                  <button
                    style={{...styles.actionBtn, ...styles.defaultActionBtn}}
                    onClick={() => setDefault(address._id)}
                  >
                    ⭐ Set Default
                  </button>
                )}
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '70vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #E8ECEF',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2C3E50',
    fontWeight: '600'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0,
    flex: 1
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  loading: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E8ECEF',
    borderTop: '4px solid #2C3E50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F9FA',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  emptyAddBtn: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  addressGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  addressCard: {
    background: 'white',
    border: '2px solid #E8ECEF',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s'
  },
  defaultCard: {
    borderColor: '#3b82f6',
    background: '#eff6ff'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  labelTag: {
    padding: '0.5rem 1rem',
    background: '#F8F9FA',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#2C3E50'
  },
  defaultBadge: {
    padding: '0.25rem 0.75rem',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  cardBody: {
    marginBottom: '1rem'
  },
  addressName: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: '0 0 0.5rem'
  },
  addressPhone: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: '0 0 0.75rem'
  },
  addressText: {
    fontSize: '0.95rem',
    color: '#4b5563',
    lineHeight: '1.5',
    margin: '0.25rem 0'
  },
  addressLandmark: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: '0.5rem 0'
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #F0F1F3'
  },
  actionBtn: {
    flex: 1,
    padding: '0.75rem',
    background: 'transparent',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#2C3E50',
    transition: 'all 0.2s'
  },
  defaultActionBtn: {
    borderColor: '#3b82f6',
    color: '#3b82f6'
  },
  formOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem'
  },
  formModal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E8ECEF'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280'
  },
  form: {
    padding: '1.5rem'
  },
  labelSelector: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  labelBtn: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #E8ECEF',
    borderRadius: '8px',
    background: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  labelBtnActive: {
    borderColor: '#2C3E50',
    background: '#2C3E50',
    color: 'white'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4b5563'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '0.95rem',
    color: '#4b5563',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#6b7280'
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

// Add animation
if (!document.getElementById('addresses-spinner')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'addresses-spinner';
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Addresses;
