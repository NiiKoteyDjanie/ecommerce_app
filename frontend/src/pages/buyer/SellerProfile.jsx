import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSellerProfile, getSellerProducts } from '../../api';
import ProductCard from '../../components/ProductCard';

export default function SellerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSellerProfile(id), getSellerProducts(id)])
      .then(([p, pr]) => { setProfile(p.data); setProducts(pr.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!profile) return <div className="empty-state"><h3>Seller not found</h3></div>;

  const { seller, store } = profile;

  return (
    <div>
      {/* Store Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
        padding: '48px 24px', color: 'white'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 80, height: 80, background: 'var(--amber)',
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 800, color: 'var(--navy)', fontFamily: 'Syne'
            }}>{store?.storeName?.charAt(0) || seller.name.charAt(0)}</div>
            <div>
              <h1 style={{ fontSize: 32, marginBottom: 4 }}>{store?.storeName || seller.name}</h1>
              <p style={{ color: 'var(--gray-400)' }}>{store?.description || 'No description available'}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {store?.location && <span style={{ fontSize: 13 }}>📍 {store.location}</span>}
                {store?.phone && <span style={{ fontSize: 13 }}>📞 {store.phone}</span>}
                <span style={{ fontSize: 13 }}>📦 {products.length} products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h2 style={{ fontSize: 24, marginBottom: 24, color: 'var(--navy)' }}>Products by this seller</h2>
        {products.length === 0 ? (
          <div className="empty-state"><h3>No products yet</h3></div>
        ) : (
          <div className="grid-3">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}