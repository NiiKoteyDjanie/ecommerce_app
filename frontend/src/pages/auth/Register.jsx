import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      toast.success(`Welcome, ${data.name}! 🎉`);
      navigate(data.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
      padding: 24
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--amber)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px', fontFamily: 'Syne', fontWeight: 800, color: 'var(--navy)'
          }}>S</div>
          <h1 style={{ color: 'white', fontSize: 28, fontFamily: 'Syne, sans-serif' }}>Create Account</h1>
          <p style={{ color: 'var(--gray-400)', marginTop: 6 }}>Join ShopHub today</p>
        </div>

        <div className="card">
          {/* Role Toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 8, marginBottom: 24,
            background: 'var(--gray-100)', borderRadius: 10, padding: 4
          }}>
            {['buyer', 'seller'].map(r => (
              <button key={r} onClick={() => setForm({ ...form, role: r })}
                style={{
                  padding: '10px',
                  borderRadius: 8, border: 'none',
                  background: form.role === r ? 'var(--navy)' : 'transparent',
                  color: form.role === r ? 'white' : 'var(--gray-600)',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}>
                {r === 'buyer' ? '🛍️ Buyer' : '🏪 Seller'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Creating account...' : `Create ${form.role} account →`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray-600)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}