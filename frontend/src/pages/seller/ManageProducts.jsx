import { useState, useEffect, useRef } from 'react';
import { getMyProducts, addProduct, updateProduct, deleteProduct, uploadImage } from '../../api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', stock: '', image: '' };
const CATEGORIES = ['Electronics', 'Fashion', 'Food', 'Beauty', 'Home', 'Sports', 'Other'];

export default function ManageProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState('');
  const fileRef = useRef();

  const fetchProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle image file selection and upload to Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await uploadImage(formData);
      setForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) { toast.error('Please wait for image to finish uploading'); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success('Product updated!');
      } else {
        await addProduct(form);
        toast.success('Product added!');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setPreview('');
      setEditId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, description: product.description || '',
      price: product.price, category: product.category || '',
      stock: product.stock, image: product.image || ''
    });
    setPreview(product.image || '');
    setEditId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, color: 'var(--navy)', fontFamily: 'Syne' }}>My Products</h1>
          <p style={{ color: 'var(--gray-400)' }}>{products.length} products in your store</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); setPreview(''); setEditId(null); }}
          className={showForm ? 'btn btn-outline' : 'btn btn-primary'}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: 32, border: '2px solid var(--amber)' }}>
          <h2 style={{ fontSize: 20, marginBottom: 20, color: 'var(--navy)' }}>
            {editId ? '✏️ Edit Product' : '➕ New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, marginBottom: 16 }}>
              {/* Image Upload Box */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Product Image
                </label>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: '100%', aspectRatio: '1',
                    border: '2px dashed var(--gray-200)',
                    borderRadius: 12, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', background: 'var(--gray-50)',
                    position: 'relative', transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {uploading && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13
                        }}>Uploading...</div>
                      )}
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', padding: '0 8px' }}>
                        Click to upload image
                      </span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Right side fields */}
              <div>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input name="name" placeholder="e.g. Wireless Headphones" value={form.name} onChange={handleChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Price (GH₵) *</label>
                    <input name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
                    <input name="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Describe your product..." value={form.description} onChange={handleChange}
                style={{ minHeight: 80, resize: 'vertical', padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8 }} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={saving || uploading} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                {saving ? 'Saving...' : uploading ? 'Uploading image...' : editId ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setPreview(''); }} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? <div className="spinner" /> : products.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <h3>No products yet</h3>
          <p>Click "Add Product" to get started</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} style={{ borderTop: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, background: 'var(--navy)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {product.image
                          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
                        }
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray-400)' }}>{product.category || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--amber-dark)' }}>GH₵{product.price?.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: product.stock > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {product.stock > 0 ? product.stock : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(product)} className="btn btn-sm btn-outline" style={{ padding: '6px 14px' }}>Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-danger" style={{ padding: '6px 14px' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}