import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../api';
import toast from 'react-hot-toast';

const statusSteps = ['Pending', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!order) return (
    <div className="empty-state">
      <h3>Order not found</h3>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Orders</Link>
    </div>
  );

  const currentStep = order.status === 'Cancelled' ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>
      <Link to="/orders" style={{ color: 'var(--gray-400)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--navy)' }}>Order Details</h1>
          <p style={{ color: 'var(--gray-400)', fontFamily: 'monospace', marginTop: 4 }}>{order._id}</p>
          <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 4 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`badge badge-${order.status.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 16px' }}>
          {order.status}
        </span>
      </div>

      {/* Order Status Tracker */}
      {order.status !== 'Cancelled' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 24, color: 'var(--navy)' }}>Order Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute', top: 20, left: '10%', right: '10%',
              height: 3, background: 'var(--gray-200)', zIndex: 0
            }}>
              <div style={{
                height: '100%',
                background: 'var(--amber)',
                width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%',
                transition: 'width 0.5s ease'
              }} />
            </div>

            {statusSteps.map((step, index) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: index <= currentStep ? 'var(--amber)' : 'var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 8, transition: 'background 0.3s',
                  border: index === currentStep ? '3px solid var(--amber-dark)' : '3px solid transparent'
                }}>
                  {index < currentStep ? '✓' : index === 0 ? '📋' : index === 1 ? '🚚' : '📦'}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: index <= currentStep ? 700 : 400,
                  color: index <= currentStep ? 'var(--navy)' : 'var(--gray-400)'
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--navy)' }}>Payment</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{order.paymentMethod === 'Paystack' ? '💳' : '💵'}</span>
            <div>
              <p style={{ fontWeight: 600 }}>{order.paymentMethod}</p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                {order.isPaid
                  ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                  : 'Payment pending'}
              </p>
              {order.paystackReference && (
                <p style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                  Ref: {order.paystackReference}
                </p>
              )}
            </div>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            background: order.isPaid ? '#d1fae5' : '#fef3c7',
            color: order.isPaid ? '#065f46' : '#92400e'
          }}>
            {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--navy)' }}>Items Ordered</h2>
        {order.items.map(item => (
          <div key={item._id} style={{
            display: 'flex', gap: 16, alignItems: 'center',
            paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--gray-100)'
          }}>
            <div style={{ width: 60, height: 60, background: 'var(--navy)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              {item.product?.image
                ? <img src={item.product.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>{item.name}</p>
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Qty: {item.quantity} × GH₵{item.price?.toFixed(2)}</p>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--amber-dark)' }}>
              GH₵{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--gray-400)', fontSize: 13, marginBottom: 4 }}>Order Total</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber-dark)', fontFamily: 'Syne' }}>
              GH₵{order.totalAmount?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--navy)' }}>Shipping Address</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24 }}>📍</span>
          <div>
            <p style={{ fontWeight: 600 }}>{order.shippingAddress?.street}</p>
            <p style={{ color: 'var(--gray-400)' }}>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}