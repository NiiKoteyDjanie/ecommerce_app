import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyStore, getMyProducts, getReceivedOrders } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyStore().catch(() => null),
      getMyProducts().catch(() => []),
      getReceivedOrders().catch(() => [])
    ]).then(([s, p, o]) => {
      setStore(s?.data);
      setProducts(p?.data || []);
      setOrders(o?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', link: '/seller/products' },
    { label: 'Total Orders', value: orders.length, icon: '🛒', link: '/seller/orders' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: '⏳', link: '/seller/orders' },
    { label: 'Revenue', value: `GH₵${orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(0)}`, icon: '💰', link: '/seller/orders' },
  ];

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here's what's happening with your store today</p>
      </div>

      {/* No store warning */}
      {!store && (
        <div style={{
          background: '#fffbeb', border: '2px solid var(--amber)', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--amber-dark)' }}>⚠️ Your store isn't set up yet</p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>Set up your store before adding products</p>
          </div>
          <Link to="/seller/store" className="btn btn-primary btn-sm">Setup Store →</Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        {stats.map(stat => (
          <Link to={stat.link} key={stat.label} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', fontFamily: 'Syne' }}>{stat.value}</div>
              <div style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 4 }}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 22, marginBottom: 16, color: 'var(--navy)' }}>Quick Actions</h2>
      <div className="grid-2" style={{ marginBottom: 40 }}>
        <Link to="/seller/products" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, background: 'var(--navy)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>Manage Products</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Add, edit, or remove products</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--gray-400)' }}>→</span>
          </div>
        </Link>
        <Link to="/seller/orders" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, background: 'var(--amber)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🛒</div>
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>View Orders</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Manage and update order status</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--gray-400)' }}>→</span>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <>
          <h2 style={{ fontSize: 22, marginBottom: 16, color: 'var(--navy)' }}>Recent Orders</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Order ID', 'Buyer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id} style={{ borderTop: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12 }}>{order._id.slice(-8)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{order.buyer?.name}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>GH₵{order.totalAmount?.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-400)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}