import { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const pretty = s => s.charAt(0).toUpperCase() + s.slice(1);


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="admin-dashboard">
      <h1>📦 All Orders</h1>
      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total (₹)</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed On</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>
                    <div>{order.user?.name || 'Guest'}</div>
                    <div className="muted">{order.user?.email}</div>
                  </td>
                  <td>{order.totalAmount?.toFixed(2) || 0}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>{order.paymentStatus || 'unpaid'}</td>
                  <td>
                  <select
  value={order.orderStatus}
  onChange={e => handleStatusChange(order._id, e.target.value)}
  disabled={updatingId === order._id}
>
  {STATUS_OPTIONS.map(s => (
    <option key={s} value={s}>
      {pretty(s)}
    </option>
  ))}
</select>

                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
