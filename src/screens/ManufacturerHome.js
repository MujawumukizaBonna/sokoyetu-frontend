import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getIncomingOrders, updateOrderStatus } from '../api';
import { useAuth } from '../context/AuthContext';

const statusLabel = { pending: '⏳ Pending', confirmed: '✓ Confirmed', in_transit: '🚚 In transit', delivered: '✅ Delivered', cancelled: '❌ Cancelled' };
const statusBadge = { pending: 'badge-amber', confirmed: 'badge-green', in_transit: 'badge-blue', delivered: 'badge-blue', cancelled: 'badge-red' };
const nextStatus = { pending: 'confirmed', confirmed: 'in_transit', in_transit: 'delivered' };
const nextLabel = { pending: 'Confirm order', confirmed: 'Mark in transit', in_transit: 'Mark delivered' };

export default function ManufacturerHome() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getIncomingOrders()])
      .then(([sRes, oRes]) => {
        setStats(sRes.data);
        setOrders(oRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="nav">
        <span className="nav-title">📊 Dashboard</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hi, {user?.name?.split(' ')[0]}</span>
        <button onClick={logoutUser} style={{ border: 'none', background: 'none', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 8 }}>
          Logout
        </button>
      </div>

      <div className="content">
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <div className="spacer" />
            {stats && (
              <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                {[
                  { label: 'Active retailers', value: stats.active_retailers || 0 },
                  { label: 'Total orders', value: stats.total_orders || 0 },
                  { label: 'Revenue (RWF)', value: Number(stats.total_revenue || 0).toLocaleString() },
                  { label: 'Pending', value: stats.pending_orders || 0 },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="section-label">Incoming orders ({orders.length})</p>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="emoji">📦</div>
                <p>No orders yet</p>
                <span>Add products so retailers can order</span>
              </div>
            ) : (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => (
                  <div key={order.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {order.emoji || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{order.product_name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          {order.retailer_name} · {order.retailer_location} · Qty {order.quantity}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${statusBadge[order.status] || 'badge-blue'}`}>
                            {statusLabel[order.status] || order.status}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>
                            RWF {Number(order.total_rwf).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {nextStatus[order.status] && (
                      <button
                        onClick={() => handleStatus(order.id, nextStatus[order.status])}
                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                      >
                        {nextLabel[order.status]}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '16px 16px 0' }}>
              <button className="btn-primary" onClick={() => navigate('/manufacturer/add-product')}>
                + Add new product listing
              </button>
            </div>
            <div className="spacer" />
          </>
        )}
      </div>

      <div className="bottom-nav">
        {[
          { icon: '📊', label: 'Dashboard', path: '/manufacturer', active: true },
          { icon: '📦', label: 'Add product', path: '/manufacturer/add-product' },
          { icon: '👤', label: 'Account', path: '/manufacturer' },
        ].map(item => (
          <button key={item.label} className={`bnav-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
