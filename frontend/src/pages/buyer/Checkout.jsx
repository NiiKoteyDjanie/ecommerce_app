import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder, initializePayment, verifyPayment, markOrderPaid } from '../../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [payMethod, setPayMethod] = useState('paystack'); // 'paystack' | 'cod'
  const [address, setAddress]   = useState({ street: '', city: '', country: 'Ghana' });

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city) {
      toast.error('Please fill in your shipping address');
      return;
    }
    setLoading(true);

    try {
      // Step 1: Create the order in our database
      const items = cart.map(item => ({ productId: item._id, quantity: item.quantity }));
      const { data: order } = await placeOrder({
        items,
        shippingAddress: address,
        paymentMethod: payMethod === 'paystack' ? 'Paystack' : 'Cash on Delivery',
      });

      if (payMethod === 'cod') {
        // Cash on delivery — done
        clearCart();
        toast.success('Order placed! Pay on delivery. 🎉');
        navigate('/orders');
        return;
      }

      // Step 2: Initialize Paystack payment
      const { data: payData } = await initializePayment({
        email: user.email,
        amount: cartTotal,
        orderId: order._id,
      });

      // Step 3: Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(cartTotal * 100),  // pesewas
        currency: 'GHS',
        ref: payData.reference,
        metadata: { orderId: order._id },

        onSuccess: async (transaction) => {
          try {
            // Step 4: Verify on backend
            const { data: verifyData } = await verifyPayment(transaction.reference);
            if (verifyData.success) {
              // Step 5: Mark order as paid
              await markOrderPaid(order._id, { paystackReference: transaction.reference });
              clearCart();
              toast.success('Payment successful! Order confirmed. 🎉');
              navigate('/orders');
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Error verifying payment');
          }
        },

        onCancel: () => {
          toast('Payment cancelled. Your order is saved — you can pay later.', { icon: 'ℹ️' });
          navigate('/orders');
        },
      });

      handler.openIframe();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Complete your order</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <div>
          {/* Shipping Address */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>📦 Shipping Address</h2>
            <div className="form-group">
              <label>Street Address</label>
              <input name="street" placeholder="123 Independence Ave" value={address.street} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>City</label>
                <input name="city" placeholder="Accra" value={address.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input name="country" value={address.country} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>💳 Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Paystack Option */}
              <div
                onClick={() => setPayMethod('paystack')}
                style={{
                  border: `2px solid ${payMethod === 'paystack' ? 'var(--amber)' : 'var(--gray-200)'}`,
                  borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                  background: payMethod === 'paystack' ? '#fffbeb' : 'white',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 16
                }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${payMethod === 'paystack' ? 'var(--amber)' : 'var(--gray-300)'}`,
                  background: payMethod === 'paystack' ? 'var(--amber)' : 'white',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>Pay with Paystack</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                    Mobile Money (MTN, Vodafone, AirtelTigo) · Credit/Debit Card · Bank Transfer
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['📱', '💳', '🏦'].map(icon => (
                    <span key={icon} style={{ fontSize: 20 }}>{icon}</span>
                  ))}
                </div>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => setPayMethod('cod')}
                style={{
                  border: `2px solid ${payMethod === 'cod' ? 'var(--amber)' : 'var(--gray-200)'}`,
                  borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                  background: payMethod === 'cod' ? '#fffbeb' : 'white',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 16
                }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${payMethod === 'cod' ? 'var(--amber)' : 'var(--gray-300)'}`,
                  background: payMethod === 'cod' ? 'var(--amber)' : 'white',
                  flexShrink: 0
                }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>Cash on Delivery</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>Pay when your order arrives</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 24 }}>💵</span>
              </div>
            </div>

            <button onClick={handleOrder} disabled={loading} className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 20, fontSize: 15 }}>
              {loading ? 'Processing...' : payMethod === 'paystack'
                ? `Pay GH₵${cartTotal.toFixed(2)} with Paystack →`
                : `Place Order — Cash on Delivery →`
              }
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ position: 'sticky', top: 88 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Order Summary</h2>
          {cart.map(item => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ color: 'var(--gray-400)', fontSize: 12 }}>×{item.quantity}</p>
              </div>
              <p style={{ fontWeight: 700 }}>GH₵{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--gray-600)' }}>
            <span>Subtotal</span><span>GH₵{cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--gray-600)' }}>
            <span>Shipping</span><span style={{ color: 'var(--green)' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20 }}>
            <span>Total</span>
            <span style={{ color: 'var(--amber-dark)' }}>GH₵{cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}