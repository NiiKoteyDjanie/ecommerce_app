import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    getProductById(id)
      .then(({ data }) => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user || user.role !== 'buyer') { toast.error('Login as buyer to add to cart'); return; }
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Link to="/" style={{ color: 'var(--gray-400)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Image */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          borderRadius: 'var(--radius)', height: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
            : '📦'
          }
        </div>

        {/* Details */}
        <div className="fade-up">
          {product.category && (
            <span className="badge" style={{ background: 'var(--amber-light)', color: 'var(--navy)', marginBottom: 12, display: 'inline-block' }}>
              {product.category}
            </span>
          )}
          <h1 style={{ fontSize: 32, color: 'var(--navy)', marginBottom: 12 }}>{product.name}</h1>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--amber-dark)', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
            GH₵{product.price?.toFixed(2)}
          </div>
          <p style={{ color: product.stock > 0 ? 'var(--green)' : 'var(--red)', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
          </p>

          {/* Seller info */}
          {product.store && (
            <Link to={`/sellers/${product.seller?._id}`}>
              <div style={{
                background: 'var(--gray-50)', borderRadius: 10, padding: '12px 16px',
                marginBottom: 24, border: '1px solid var(--gray-200)',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 40, height: 40, background: 'var(--navy)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--amber)', fontWeight: 700, fontSize: 16
                }}>{product.store.storeName?.charAt(0)}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{product.store.storeName}</p>
                  <p style={{ color: 'var(--gray-400)', fontSize: 12 }}>📍 {product.store.location || 'Ghana'}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--gray-400)', fontSize: 12 }}>View store →</span>
              </div>
            </Link>
          )}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '2px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ padding: '10px 16px', border: 'none', background: 'white', fontSize: 18, cursor: 'pointer' }}>−</button>
                <span style={{ padding: '10px 16px', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ padding: '10px 16px', border: 'none', background: 'white', fontSize: 18, cursor: 'pointer' }}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                🛒 Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}