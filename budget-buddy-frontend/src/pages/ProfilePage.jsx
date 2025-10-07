import React, { useState } from 'react';
import './Profile.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
// Import the new service functions
import { updateUsername, updateEmail, updatePassword } from '../api/profileManagementService';

const ProfilePage = ({ user, onLogout, onUserUpdate }) => {
  const [usernameForm, setUsernameForm] = useState({ newUsername: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') setSuccess(msg); else setError(msg);
    setTimeout(() => {
        setSuccess('');
        setError('');
    }, 3000); // Message disappears after 3 seconds
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUsername(usernameForm.newUsername);
      onUserUpdate(updatedUser); // Notify App.jsx of the change
      showMessage('Username updated successfully!');
      setUsernameForm({ newUsername: '' }); // Clear form
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateEmail(emailForm.newEmail);
      onUserUpdate(updatedUser);
      showMessage('Email updated successfully!');
      setEmailForm({ newEmail: '' });
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header"><h1>Welcome, {user.username}</h1></div>
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
      </div>
      
      {/* Universal message display */}
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <hr className="divider" />
      
      <form onSubmit={handleUsernameUpdate} className="profile-form">
        <h2>Change Username</h2>
        <div className="input-box"><input type="text" placeholder="New Username" value={usernameForm.newUsername} onChange={(e) => setUsernameForm({ newUsername: e.target.value })} required /><FaUser className="icon" /></div>
        <button type="submit">Update Username</button>
      </form>
      
      <form onSubmit={handleEmailUpdate} className="profile-form">
        <h2>Change Email</h2>
        <div className="input-box"><input type="email" placeholder="New Email" value={emailForm.newEmail} onChange={(e) => setEmailForm({ newEmail: e.target.value })} required /><FaEnvelope className="icon" /></div>
        <button type="submit">Update Email</button>
      </form>

      <form onSubmit={handlePasswordUpdate} className="profile-form">
        <h2>Change Password</h2>
        <div className="input-box"><input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({...p, currentPassword: e.target.value}))} required /><FaLock className="icon" /></div>
        <div className="input-box"><input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({...p, newPassword: e.target.value}))} required /><FaLock className="icon" /></div>
        <button type="submit">Change Password</button>
      </form>
      <button onClick={onLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default ProfilePage;