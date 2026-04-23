import { useState, useEffect } from 'react';
import { getReceivedOrders, updateOrderStatus } from '../../api';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Shipped', 'Delivered'];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const { data } = await getReceivedOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-header">
        <h1>Received Orders</h1>
        <p>{orders.length} total orders</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['All', ...STATUSES, 'Cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '8px 20px', borderRadius: 99, border: '2px solid',
              borderColor: filter === s ? 'var(--navy)' : 'var(--gray-200)',
              background: filter === s ? 'var(--navy)' : 'white',
              color: filter === s ? 'white' : 'var(--gray-600)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
            }}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <h3>No orders here</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => (
            <div key={order._id} className="card fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2 }}>ORDER</p>
                  <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{order._id.slice(-12)}</p>
                  <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 4 }}>
                    👤 {order.buyer?.name} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber-dark)', fontFamily: 'Syne' }}>
                    GH₵{order.totalAmount?.toFixed(2)}
                  </span>
                  {order.status !== 'Cancelled' ? (
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, border: '2px solid var(--gray-200)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer', outline: 'none',
                        background: 'white'
                      }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className="badge badge-cancelled">Cancelled</span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {order.items.map(item => (
                  <div key={item._id} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '6px 12px', fontSize: 13, display: 'flex', gap: 6 }}>
                    <span>{item.name}</span>
                    <span style={{ color: 'var(--gray-400)' }}>×{item.quantity}</span>
                    <span style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>GH₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping address */}
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}