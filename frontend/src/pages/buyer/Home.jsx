import { useState, useEffect } from 'react';
import { getAllProducts } from '../../api';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Food', 'Beauty', 'Home', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Home() {
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [sort, setSort]             = useState('newest');
  const [page, setPage]             = useState(1);
  const [minPrice, setMinPrice]     = useState('');
  const [maxPrice, setMaxPrice]     = useState('');

  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    try {
      const params = { page: currentPage, limit: 12, sort };
      if (search)   params.search   = search;
      if (category !== 'All') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await getAllProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(true); }, [category, sort]);
  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(true); };

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, #1e3a5f 100%)',
        padding: '60px 24px', textAlign: 'center'
      }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, color: 'white', marginBottom: 12, lineHeight: 1.1 }}>
          Shop Everything,<br />
          <span style={{ color: 'var(--amber)' }}>Delivered Fast</span>
        </h1>
        <p style={{ color: 'var(--gray-400)', fontSize: 18, marginBottom: 32 }}>
          Browse thousands of products from local sellers
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 540, margin: '0 auto' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, padding: '14px 20px', borderRadius: 10, border: 'none', fontSize: 15, outline: 'none' }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 24px' }}>Search</button>
        </form>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '7px 16px', borderRadius: 99, border: '2px solid',
                borderColor: category === cat ? 'var(--navy)' : 'var(--gray-200)',
                background: category === cat ? 'var(--navy)' : 'white',
                color: category === cat ? 'white' : 'var(--gray-600)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.2s', cursor: 'pointer'
              }}>{cat}</button>
            ))}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: '8px 14px', borderRadius: 8, border: '2px solid var(--gray-200)',
            fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', background: 'white'
          }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Price Range Filter */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>Price (GH₵):</span>
          <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            style={{ width: 90, padding: '7px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, outline: 'none' }} />
          <span style={{ color: 'var(--gray-400)' }}>—</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            style={{ width: 90, padding: '7px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, outline: 'none' }} />
          <button onClick={() => fetchProducts(true)} className="btn btn-sm btn-dark">Apply</button>
          {(minPrice || maxPrice) && (
            <button onClick={() => { setMinPrice(''); setMaxPrice(''); fetchProducts(true); }}
              style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: 13 }}>
              Clear ✕
            </button>
          )}
          <span style={{ marginLeft: 'auto', color: 'var(--gray-400)', fontSize: 13 }}>
            {pagination.total || 0} products
          </span>
        </div>

        {/* Products */}
        {loading ? <div className="spinner" /> :
         products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3>No products found</h3>
            <p>Try different filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid-3 fade-up">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn btn-outline btn-sm" style={{ opacity: page === 1 ? 0.4 : 1 }}>
                  ← Prev
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) => (
                    p === '...'
                      ? <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>...</span>
                      : <button key={p} onClick={() => setPage(p)}
                          style={{
                            width: 36, height: 36, borderRadius: 8, border: '2px solid',
                            borderColor: page === p ? 'var(--navy)' : 'var(--gray-200)',
                            background: page === p ? 'var(--navy)' : 'white',
                            color: page === p ? 'white' : 'var(--gray-600)',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                          }}>{p}</button>
                  ))
                }

                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  className="btn btn-outline btn-sm" style={{ opacity: page === pagination.pages ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}