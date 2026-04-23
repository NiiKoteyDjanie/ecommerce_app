import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can add to cart');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow)';
        }}
      >
        {/* Product Image */}
        <div style={{
          height: 200,
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64, position: 'relative'
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span>📦</span>
          }
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--red)', color: 'white',
              padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600
            }}>Out of Stock</div>
          )}
          {product.category && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(0,0,0,0.5)', color: 'white',
              padding: '4px 10px', borderRadius: 99, fontSize: 11
            }}>{product.category}</div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>
            {product.name}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 12, lineHeight: 1.4 }}>
            {product.description?.substring(0, 60)}{product.description?.length > 60 ? '...' : ''}
          </p>

          {product.store && (
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>
              🏪 {product.store.storeName}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-dark)', fontFamily: 'Syne, sans-serif' }}>
              GH₵{product.price?.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm"
              disabled={product.stock === 0}
              style={{ opacity: product.stock === 0 ? 0.5 : 1 }}
            >
              + Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}