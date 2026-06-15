import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../api';

const statusBadge = { confirmed: 'badge-green', pending: 'badge-amber', in_transit: 'badge-blue', delivered: 'badge-blue', cancelled: 'badge-red' };
const statusLabel = { confirmed: '✓ Confirmed', pending: '⏳ Pending', in_transit: '🚚 In transit', delivered: '✅ Delivered', cancelled: '❌ Cancelled' };

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="nav">
        <button className="nav-back" onClick={() => navigate('/retailer')}>‹ Back</button>
        <span className="nav-title" style={{ textAlign: 'right' }}>My orders</span>
      </div>

      <div className="content">
        {loading ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📦</div>
            <p>No orders yet</p>
            <span>Browse suppliers to place your first order</span>
            <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/retailer')}>
              Browse suppliers
            </button>
          </div>
        ) : (
          <>
            <div className="spacer" />
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map(order => (
                <div key={order.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {order.emoji || '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{order.product_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        {order.supplier_name} · Qty {order.quantity}
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
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
                    {new Date(order.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="spacer" />
      </div>

      <div className="bottom-nav">
        {[
          { icon: '🏪', label: 'Browse', path: '/retailer' },
          { icon: '📦', label: 'Orders', path: '/orders', active: true },
          { icon: '👤', label: 'Account', path: '/retailer' },
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
