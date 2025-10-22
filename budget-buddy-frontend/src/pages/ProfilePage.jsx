import React, { useState } from 'react';
import './Profile.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
// Import the new service functions
// Note: You will need to create an `updateName` service function similar to the others.
import { updateEmail, updatePassword } from '../api/profileManagementService';

const ProfilePage = ({ user, onLogout, onUserUpdate }) => {
  // State updated for first and last name
  const [nameForm, setNameForm] = useState({ newFirstName: '', newLastName: '' });
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

  // Renamed and updated handler for changing the name
  const handleNameUpdate = async (e) => {
    e.preventDefault();
    try {
      // --- Placeholder: Replace with actual API call ---
      // const updatedUser = await updateName(nameForm.newFirstName, nameForm.newLastName);
      
      // For now, we'll simulate the update locally.
      console.log(`Simulating name update to: ${nameForm.newFirstName} ${nameForm.newLastName}`);
      const updatedUser = { ...user, firstName: nameForm.newFirstName, lastName: nameForm.newLastName };
      
      onUserUpdate(updatedUser); // Notify App.jsx of the change
      showMessage('Name updated successfully!');
      setNameForm({ newFirstName: '', newLastName: '' }); // Clear form
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
      {/* Display user's first name */}
      <div className="profile-header"><h1>Welcome, {user.firstName || user.email}</h1></div>
      <div className="profile-info">
        {/* Display user's full name */}
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
      </div>
      
      {/* Universal message display */}
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <hr className="divider" />
      
      {/* Updated form for changing name */}
      <form onSubmit={handleNameUpdate} className="profile-form">
        <h2>Change Name</h2>
        <div className="input-box">
            <input 
                type="text" 
                placeholder="New First Name" 
                value={nameForm.newFirstName} 
                onChange={(e) => setNameForm(f => ({...f, newFirstName: e.target.value}))} 
                required 
            />
            <FaUser className="icon" />
        </div>
        <div className="input-box">
            <input 
                type="text" 
                placeholder="New Last Name" 
                value={nameForm.newLastName} 
                onChange={(e) => setNameForm(f => ({...f, newLastName: e.target.value}))} 
                required 
            />
            <FaUser className="icon" />
        </div>
        <button type="submit">Update Name</button>
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