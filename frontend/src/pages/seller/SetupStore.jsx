import { useState, useEffect } from 'react';
import { setupStore, getMyStore } from '../../api';
import toast from 'react-hot-toast';

export default function SetupStore() {
  const [form, setForm] = useState({ storeName: '', description: '', location: '', phone: '', logo: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getMyStore()
      .then(({ data }) => setForm({
        storeName: data.storeName || '',
        description: data.description || '',
        location: data.location || '',
        phone: data.phone || '',
        logo: data.logo || '',
      }))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setupStore(form);
      toast.success('Store saved successfully! 🏪');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save store');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="spinner" />;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 640 }}>
      <div className="page-header">
        <h1>🏪 Store Setup</h1>
        <p>Configure your store details visible to buyers</p>
      </div>

      <div className="card fade-up">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name *</label>
            <input name="storeName" placeholder="e.g. Jane's Fashion Hub" value={form.storeName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" placeholder="Tell buyers what you sell..." value={form.description} onChange={handleChange}
              style={{ minHeight: 100, resize: 'vertical', padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Location</label>
              <input name="location" placeholder="Accra, Ghana" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="0241234567" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input name="logo" placeholder="https://..." value={form.logo} onChange={handleChange} />
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Paste an image URL for your store logo</span>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}>
            {loading ? 'Saving...' : 'Save Store ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}