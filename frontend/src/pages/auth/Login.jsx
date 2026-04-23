import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--amber)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px', fontFamily: 'Syne', fontWeight: 800, color: 'var(--navy)'
          }}>S</div>
          <h1 style={{ color: 'white', fontSize: 28, fontFamily: 'Syne, sans-serif' }}>Welcome Back</h1>
          <p style={{ color: 'var(--gray-400)', marginTop: 6 }}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-dark" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray-600)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}