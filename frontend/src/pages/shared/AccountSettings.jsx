import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AccountSettings() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await API.put('/auth/profile', profileForm);
      // Update stored user with new name/email but keep token
      login({ ...user, name: data.name, email: data.email });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await API.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 640 }}>
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your profile and password</p>
      </div>

      {/* Profile Info */}
      <div className="card fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, background: 'var(--navy)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: 'var(--amber)', fontFamily: 'Syne'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, color: 'var(--navy)' }}>{user?.name}</h2>
            <span style={{
              background: user?.role === 'seller' ? '#fffbeb' : '#eff6ff',
              color: user?.role === 'seller' ? '#92400e' : '#1e40af',
              padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
            }}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} required />
          </div>
          <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card fade-up">
        <h2 style={{ fontSize: 18, marginBottom: 20, color: 'var(--navy)' }}>🔒 Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input name="newPassword" type="password" placeholder="Min. 6 characters with a number" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
          </div>
          <button type="submit" disabled={savingPassword} className="btn btn-dark" style={{ padding: '12px 28px' }}>
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}