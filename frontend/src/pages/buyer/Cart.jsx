import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="empty-state">
        <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
        <h3>Your cart is empty</h3>
        <p style={{ marginBottom: 24 }}>Browse products and add items to your cart</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-header">
        <h1>Your Cart</h1>
        <p>{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cart.map(item => (
            <div key={item._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
              <div style={{
                width: 80, height: 80, background: 'var(--navy)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, flexShrink: 0
              }}>
                {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>{item.name}</h3>
                <p style={{ color: 'var(--amber-dark)', fontWeight: 700 }}>GH₵{item.price?.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  style={{ width: 32, height: 32, border: '2px solid var(--gray-200)', borderRadius: 8, background: 'white', fontSize: 16, cursor: 'pointer' }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  style={{ width: 32, height: 32, border: '2px solid var(--gray-200)', borderRadius: 8, background: 'white', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <p style={{ fontWeight: 700, marginBottom: 8 }}>GH₵{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item._id)}
                  style={{ color: 'var(--red)', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ position: 'sticky', top: 88 }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--gray-600)' }}>
            <span>Subtotal</span><span>GH₵{cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--gray-600)' }}>
            <span>Shipping</span><span style={{ color: 'var(--green)' }}>Free</span>
          </div>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '2px solid var(--gray-100)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 800, fontSize: 20 }}>
            <span>Total</span>
            <span style={{ color: 'var(--amber-dark)' }}>GH₵{cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
            Proceed to Checkout →
          </button>
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--gray-400)', fontSize: 14 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}