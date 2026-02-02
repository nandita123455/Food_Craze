import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import './RiderManagement.css';

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

  // 🔥 NEW SUSPEND FUNCTION
  const suspendRider = async (riderId) => {
    if (!window.confirm('🚫 Suspend this rider? They will not receive new orders.')) return;
    try {
      await adminApi.suspendRider(riderId); // You'll need to add this API call
      alert('🚫 Rider suspended successfully!');
      loadRiders();
    } catch (error) {
      alert('❌ Failed to suspend rider');
    }
  };

  // 🔥 NEW ACTIVATE FUNCTION
  const activateRider = async (riderId) => {
    if (!window.confirm('✅ Activate this suspended rider?')) return;
    try {
      await adminApi.activateRider(riderId); // You'll need to add this API call
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading riders...</p>
      </div>
    );
  }

  return (
    <div className="rider-management">
      <div className="page-header">
        <h1>Rider Management</h1>
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All ({riders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          >
            Pending ({riders.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          >
            Approved ({riders.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`filter-tab ${filter === 'suspended' ? 'active' : ''}`}
          >
            Suspended ({riders.filter(r => r.status === 'suspended').length})
          </button>
        </div>
      </div>

      {filteredRiders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚴</div>
          <h3>No riders found</h3>
          <p>Try changing the filter above</p>
        </div>
      ) : (
        <div className="riders-grid">
          {filteredRiders.map(rider => (
            <div key={rider._id} className="rider-card">
              <div className="card-header">
                <div>
                  <h3 className="rider-name">{rider.name}</h3>
                  <p className="rider-email">{rider.email}</p>
                </div>
                <span className={`status-badge status-${rider.status}`}>
                  {rider.status}
                </span>
              </div>

              <div className="rider-details">
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{rider.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Bike Model</span>
                  <span className="value">{rider.bikeDetails?.model || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Registration</span>
                  <span className="value">{rider.bikeDetails?.registrationNumber || 'N/A'}</span>
                </div>
                {rider.totalDeliveries && (
                  <div className="detail-row">
                    <span className="label">Total Deliveries</span>
                    <span className="value">{rider.totalDeliveries}</span>
                  </div>
                )}
              </div>

              {/* 🔥 DYNAMIC ACTION BUTTONS */}
              <div className="rider-actions">
                {rider.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveRider(rider._id)}
                      className="action-btn approve"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => rejectRider(rider._id)}
                      className="action-btn reject"
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
                
                {rider.status === 'approved' && (
                  <button
                    onClick={() => suspendRider(rider._id)}
                    className="action-btn suspend"
                  >
                    🚫 Suspend
                  </button>
                )}
                
                {rider.status === 'suspended' && (
                  <button
                    onClick={() => activateRider(rider._id)}
                    className="action-btn activate"
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

export default RiderManagement;
