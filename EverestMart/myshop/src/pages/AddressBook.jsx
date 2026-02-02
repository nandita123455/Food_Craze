import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';

function AddressBook() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]); // ✅ Initialize as empty array
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
      console.log('⚠️ No token - redirecting to login');
      navigate('/login');
      return;
    }

    console.log('📍 Loading addresses...');
    console.log('API URL:', `${config.API_BASE_URL}/addresses`);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await axios.get(`${config.API_BASE_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📦 Full API Response:', response.data);
    
    const addressList = response.data.addresses || response.data.data || response.data || [];
    console.log('📍 Extracted address list:', addressList);
    console.log('📊 Number of addresses:', addressList.length);
    
    setAddresses(addressList);
    console.log('✅ State updated with addresses');
    
  } catch (error) {
    console.error('❌ Failed to load addresses:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      navigate('/login');
    } else {
      alert('Failed to load addresses. Please try again.');
    }
    
    setAddresses([]);
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    console.log('💾 Saving address...');
    console.log('Form data:', formData);
    console.log('Editing ID:', editingId);

    let response;

    if (editingId) {
      // Update existing
      console.log('📝 Updating address:', editingId);
      response = await axios.put(
        `${config.API_BASE_URL}/addresses/${editingId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Update response:', response.data);
      alert('✅ Address updated successfully');
    } else {
      // Add new
      console.log('➕ Creating new address');
      response = await axios.post(
        `${config.API_BASE_URL}/addresses`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Create response:', response.data);
      alert('✅ Address added successfully');
    }

    console.log('🔄 Resetting form and reloading addresses...');
    resetForm();
    
    // Force reload after small delay
    setTimeout(() => {
      loadAddresses();
    }, 500);
    
  } catch (error) {
    console.error('❌ Save address error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Failed to save address';
    alert(`❌ Error: ${errorMsg}`);
  }
};


  const handleEdit = (address) => {
    setFormData({
      label: address.label || 'Home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: address.isDefault || false
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${config.API_BASE_URL}/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Address deleted');
      loadAddresses();
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete address');
    }
  };

  const setDefault = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${config.API_BASE_URL}/addresses/${addressId}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      loadAddresses();
      
    } catch (error) {
      console.error('Set default error:', error);
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
    setShowForm(false);
  };

  const getLabelIcon = (label) => {
    const icons = {
      Home: '🏠',
      Work: '💼',
      Other: '📍'
    };
    return icons[label] || '📍';
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Saved Addresses</h1>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
          >
            ← Back
          </button>
        </div>

        {/* ✅ Empty State */}
        {addresses.length === 0 && !showForm && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📍</div>
            <h2 style={styles.emptyTitle}>No saved addresses</h2>
            <p style={styles.emptyText}>Add your first delivery address to get started</p>
            <button
              onClick={() => setShowForm(true)}
              style={styles.addButton}
            >
              + Add New Address
            </button>
          </div>
        )}

        {/* Address List */}
        {addresses.length > 0 && !showForm && (
          <>
            <button
              onClick={() => setShowForm(true)}
              style={styles.addButton}
            >
              + Add New Address
            </button>

            <div style={styles.addressGrid}>
              {addresses.map((address) => (
                <div key={address._id} style={styles.addressCard}>
                  <div style={styles.addressHeader}>
                    <div style={styles.labelSection}>
                      <span style={styles.labelIcon}>{getLabelIcon(address.label)}</span>
                      <span style={styles.labelText}>{address.label}</span>
                      {address.isDefault && (
                        <span style={styles.defaultBadge}>Default</span>
                      )}
                    </div>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleEdit(address)}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address._id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={styles.addressBody}>
                    <p style={styles.fullName}>{address.fullName}</p>
                    <p style={styles.addressText}>
                      📞 {address.phone}
                    </p>
                    <p style={styles.addressText}>
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    {address.landmark && (
                      <p style={styles.addressText}>
                        Landmark: {address.landmark}
                      </p>
                    )}
                    <p style={styles.addressText}>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => setDefault(address._id)}
                      style={styles.setDefaultBtn}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={resetForm} style={styles.cancelBtn}>
                × Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address Type *</label>
                <div style={styles.labelOptions}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFormData({ ...formData, label })}
                      style={{
                        ...styles.labelOption,
                        ...(formData.label === label ? styles.labelOptionActive : {})
                      }}
                    >
                      {getLabelIcon(label)} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input}
                    pattern="[0-9]{10}"
                    title="10-digit phone number"
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  style={styles.input}
                  placeholder="House no., Street, Area"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  style={styles.input}
                  placeholder="Apartment, Suite, etc. (optional)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  style={styles.input}
                  placeholder="Near school, mall, etc. (optional)"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    style={styles.input}
                    pattern="[0-9]{6}"
                    title="6-digit pincode"
                    required
                  />
                </div>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={styles.checkbox}
                />
                <label htmlFor="isDefault" style={styles.checkboxLabel}>
                  Set as default address
                </label>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelFormBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '2rem'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E2DD'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: '0.5px'
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: '500'
  },
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1rem',
    color: '#8B8B8B'
  },
  emptyState: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.3
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '1rem',
    color: '#8B8B8B',
    marginBottom: '2rem'
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    marginBottom: '2rem',
    transition: 'background 0.2s'
  },
  addressGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  addressCard: {
    padding: '1.5rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    transition: 'border-color 0.2s'
  },
  addressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  labelSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  labelIcon: {
    fontSize: '1.25rem'
  },
  labelText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  defaultBadge: {
    fontSize: '0.7rem',
    background: '#10b981',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid #2563eb',
    color: '#2563eb',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: '500'
  },
  deleteBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: '500'
  },
  addressBody: {
    marginBottom: '1rem'
  },
  fullName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: '0.5rem'
  },
  addressText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
    lineHeight: '1.5'
  },
  setDefaultBtn: {
    width: '100%',
    padding: '0.5rem',
    background: 'transparent',
    border: '1px dashed #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: '500'
  },
  formContainer: {
    maxWidth: '700px',
    margin: '0 auto',
    background: '#F8F7F5',
    padding: '2rem',
    borderRadius: '8px'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    color: '#8B8B8B',
    cursor: 'pointer'
  },
  form: {},
  formGroup: {
    marginBottom: '1.25rem',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#5A5A5A',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '4px',
    outline: 'none',
    background: '#FFFFFF',
    color: '#1A1A1A'
  },
  labelOptions: {
    display: 'flex',
    gap: '0.75rem'
  },
  labelOption: {
    padding: '0.75rem 1.25rem',
    background: '#FFFFFF',
    border: '2px solid #E5E2DD',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#5A5A5A',
    transition: 'all 0.2s'
  },
  labelOptionActive: {
    borderColor: '#2563eb',
    background: '#f0f9ff',
    color: '#2563eb'
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
    fontSize: '0.875rem',
    color: '#5A5A5A',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelFormBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '500'
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px'
  }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AddressBook;
