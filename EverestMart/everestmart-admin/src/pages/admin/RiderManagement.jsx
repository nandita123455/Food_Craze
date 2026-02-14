import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import config from '../../config/config';

function RiderManagement() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, suspended

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAllRiders();
      setRiders(data || []);
    } catch (error) {
      console.error('Failed to load riders:', error);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const approveRider = async (riderId) => {
    if (!window.confirm('✅ Approve this rider?')) return;
    try {
      await adminApi.approveRider(riderId);
      alert('✅ Rider approved successfully!');
      loadRiders();
    } catch (error) {
      alert('❌ Failed to approve rider');
    }
  };

  const rejectRider = async (riderId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminApi.rejectRider(riderId, reason);
      alert('❌ Rider rejected successfully!');
      loadRiders();
    } catch (error) {
      alert('❌ Failed to reject rider');
    }
  };

  const suspendRider = async (riderId) => {
    if (!window.confirm('🚫 Suspend this rider? They will not receive new orders.')) return;
    try {
      await adminApi.suspendRider(riderId);
      alert('🚫 Rider suspended successfully!');
      loadRiders();
    } catch (error) {
      alert('❌ Failed to suspend rider');
    }
  };

  const activateRider = async (riderId) => {
    if (!window.confirm('✅ Activate this suspended rider?')) return;
    try {
      await adminApi.activateRider(riderId);
      alert('✅ Rider activated successfully!');
      loadRiders();
    } catch (error) {
      alert('❌ Failed to activate rider');
    }
  };

  const filteredRiders = riders.filter(rider => {
    if (filter === 'all') return true;
    if (filter === 'pending') return rider.status === 'pending';
    if (filter === 'approved') return rider.status === 'approved';
    if (filter === 'suspended') return rider.status === 'suspended';
    return true;
  });

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading riders...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Rider Management</h1>
        <div style={styles.filterTabs}>
          <button
            onClick={() => setFilter('all')}
            style={filter === 'all' ? styles.filterTabActive : styles.filterTab}
          >
            All ({riders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={filter === 'pending' ? styles.filterTabActive : styles.filterTab}
          >
            Pending ({riders.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            style={filter === 'approved' ? styles.filterTabActive : styles.filterTab}
          >
            Approved ({riders.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            style={filter === 'suspended' ? styles.filterTabActive : styles.filterTab}
          >
            Suspended ({riders.filter(r => r.status === 'suspended').length})
          </button>
        </div>
      </div>

      {filteredRiders.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🚴</div>
          <h3 style={styles.emptyTitle}>No riders found</h3>
          <p style={styles.emptyText}>Try changing the filter above</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredRiders.map(rider => (
            <div key={rider._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.riderName}>{rider.name}</h3>
                  <p style={styles.riderEmail}>{rider.email}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: rider.status === 'approved' ? '#10b981' : rider.status === 'pending' ? '#f59e0b' : '#ef4444'
                }}>
                  {rider.status}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{rider.phone}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Bike Model</span>
                  <span style={styles.value}>{rider.bikeDetails?.model || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Registration</span>
                  <span style={styles.value}>{rider.bikeDetails?.registrationNumber || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Registration</span>
                  <span style={styles.value}>{rider.bikeDetails?.registrationNumber || 'N/A'}</span>
                </div>
                {rider.totalDeliveries && (
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Total Deliveries</span>
                    <span style={styles.value}>{rider.totalDeliveries}</span>
                  </div>
                )}

                {/* Documents Section */}
                <div style={styles.documentsSection}>
                  <p style={styles.sectionTitle}>Documents</p>
                  <div style={styles.docLinks}>
                    {rider.citizenshipProof && (
                      <a
                        href={`${config.BACKEND_URL}/${rider.citizenshipProof.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        📄 Citizenship
                      </a>
                    )}
                    {rider.policeRecord && (
                      <a
                        href={`${config.BACKEND_URL}/${rider.policeRecord.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        📄 Police Record
                      </a>
                    )}
                    {rider.bikeDetails?.rcDocument && (
                      <a
                        href={`${config.BACKEND_URL}/${rider.bikeDetails.rcDocument.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        📄 RC Book
                      </a>
                    )}
                    {rider.bikeDetails?.insurance && (
                      <a
                        href={`${config.BACKEND_URL}/${rider.bikeDetails.insurance.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        📄 Insurance
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.actions}>
                {rider.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveRider(rider._id)}
                      style={styles.approveBtn}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => rejectRider(rider._id)}
                      style={styles.rejectBtn}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}

                {rider.status === 'approved' && (
                  <button
                    onClick={() => suspendRider(rider._id)}
                    style={styles.suspendBtn}
                  >
                    🚫 Suspend
                  </button>
                )}

                {rider.status === 'suspended' && (
                  <button
                    onClick={() => activateRider(rider._id)}
                    style={styles.approveBtn}
                  >
                    ✅ Activate
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
    fontFamily: 'inherit',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '1.5rem',
    letterSpacing: '-0.02em'
  },
  filterTabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    background: '#FFFFFF',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    width: 'fit-content'
  },
  filterTab: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#6B7280',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },
  filterTabActive: {
    padding: '0.5rem 1rem',
    background: '#0c831f',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    color: '#6B7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0c831f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.5rem'
  },
  emptyText: {
    color: '#6B7280',
    fontSize: '0.95rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    padding: '1.25rem',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  riderName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0 0 0.25rem 0'
  },
  riderEmail: {
    fontSize: '0.85rem',
    color: '#6B7280',
    margin: 0
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  cardBody: {
    padding: '1.25rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '0.9rem'
  },
  label: {
    color: '#6B7280',
    fontWeight: '500'
  },
  value: {
    color: '#1F2937',
    fontWeight: '600'
  },
  documentsSection: {
    marginTop: '1rem',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '0.75rem'
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  docLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  docLink: {
    fontSize: '0.8rem',
    color: '#2563EB',
    textDecoration: 'none',
    background: '#EFF6FF',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #BFDBFE'
  },
  actions: {
    padding: '1.25rem',
    background: '#F9FAFB',
    borderTop: '1px solid #F3F4F6',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.75rem'
  },
  approveBtn: {
    padding: '0.6rem',
    background: '#10b981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s'
  },
  rejectBtn: {
    padding: '0.6rem',
    background: '#ef4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s'
  },
  suspendBtn: {
    padding: '0.6rem',
    background: '#f59e0b',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s'
  }
};

export default RiderManagement;
