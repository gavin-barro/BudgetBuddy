// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import './Profile.css';
import { getProfile, updateName, updateEmail, updatePassword } from '../api/profileManagementService';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const ProfilePage = ({ user, onLogout, onUserUpdate }) => {
  const [nameForm, setNameForm] = useState({ newFirstName: '', newLastName: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const toast = (msg, type = 'success', ms = 3000) => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, ms);
  };

  // Load current profile on mount (and after login)
  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        onUserUpdate?.({
          ...user,
          firstName: profile?.firstName ?? '',
          lastName: profile?.lastName ?? '',
          email: profile?.email ?? user?.email,
        });
      } catch (e) {
        console.error(e);
        toast(e?.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await updateName(nameForm.newFirstName, nameForm.newLastName);
      onUserUpdate?.({
        ...user,
        firstName: updated?.firstName ?? user?.firstName,
        lastName: updated?.lastName ?? user?.lastName,
      });
      setNameForm({ newFirstName: '', newLastName: '' });
      toast('Name updated successfully!');
    } catch (err) {
      console.error(err);
      toast(err?.message || 'Unable to update name', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateEmail(emailForm.newEmail);
      // Don’t re-fetch immediately; principal may still be old. Update UI optimistically.
      if (res?.ok) {
        onUserUpdate?.({
          ...user,
          email: res.email,
        });
        toast('Email updated. Please sign in again with your new email.');
        onLogout?.();
        alert('Email updated successfully! Please log in again with your new email.')
        return;
      }
      setEmailForm({ newEmail: '' });
      toast('Email updated successfully!');
    } catch (err) {
      console.error(err);
      toast(err?.message || 'Unable to update email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res?.ok) {
        toast('Password changed successfully!');
      }
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      toast(err?.message || 'Unable to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Welcome, {user?.firstName || user?.email}</h1>
      </div>

      <div className="profile-info">
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email || 'Not provided'}</p>
      </div>

      {loading && <div className="alert info">Working…</div>}
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <hr className="divider" />

      <form onSubmit={handleNameUpdate} className="profile-form">
        <h2>Change Name</h2>
        <div className="input-box">
          <input
            type="text"
            placeholder="New First Name"
            value={nameForm.newFirstName}
            onChange={(e) => setNameForm(f => ({ ...f, newFirstName: e.target.value }))}
            required
          />
           <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="New Last Name"
            value={nameForm.newLastName}
            onChange={(e) => setNameForm(f => ({ ...f, newLastName: e.target.value }))}
            required
          />
           <FaUser className="icon" />
        </div>
        <button type="submit">Update Name</button>
      </form>

      <form onSubmit={handleEmailUpdate} className="profile-form">
        <h2>Change Email</h2>
        <div className="input-box">
          <input
            type="email"
            placeholder="New Email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm({ newEmail: e.target.value })}
            required
          />
          <FaEnvelope className="icon" />
        </div>
        <button type="submit">Update Email</button>
      </form>

      <form onSubmit={handlePasswordUpdate} className="profile-form">
        <h2>Change Password</h2>
        <div className="input-box">
          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
            required
          />
          <FaLock className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
            required
          />
          <FaLock className="icon" />
        </div>
        <button type="submit">Change Password</button>
      </form>

      <button onClick={onLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default ProfilePage;
