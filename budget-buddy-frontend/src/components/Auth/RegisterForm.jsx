import React, { useState } from 'react';
import './Auth.css';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { register } from '../../api/authService';

const RegisterForm = ({ onSwitch }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = [];
    if (!form.firstName.trim()) errs.push('First Name is required.');
    if (!form.lastName.trim()) errs.push('Last Name is required.');
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.push('A valid email is required.');
    if (form.password.length < 8) errs.push('Password must be at least 8 characters.');
    if (form.password !== form.confirm) errs.push('Passwords do not match.');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
    }
    setErrors([]);
    setBusy(true);

    try {
      await register({ 
          firstName: form.firstName, 
          lastName: form.lastName, 
          email: form.email.trim(), 
          password: form.password 
        });
      alert("Registration successful! Please switch to the login tab to sign in.");
      onSwitch();
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        {errors.length > 0 && (
          <div className="alert error" role="alert">
            {errors.map((er, i) => <div key={i}>• {er}</div>)}
          </div>
        )}
        <div className="input-box">
          <input type="text" placeholder="First Name" name="firstName" value={form.firstName} onChange={onChange} required />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input type="text" placeholder="Last Name" name="lastName" value={form.lastName} onChange={onChange} required />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input type="email" placeholder="Email" name="email" value={form.email} onChange={onChange} required/>
          <FaEnvelope className="icon" />
        </div>
        <div className="input-box">
          <input type={showPwd ? 'text' : 'password'} placeholder="Password" name="password" value={form.password} onChange={onChange} required />
          <FaLock className="icon" />
          <button type="button" className="icon-button" onClick={() => setShowPwd(s => !s)}>
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>
        <PasswordStrengthIndicator password={form.password} />
        <div className="input-box">
          <input type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirm Password" name="confirm" value={form.confirm} onChange={onChange} required />
          <FaLock className="icon" />
          <button type="button" className="icon-button" onClick={() => setShowConfirmPwd(s => !s)}>
            {showConfirmPwd ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create Account'}</button>
        <div className="register-link">
          <p>Already have an account? <button type="button" className="auth-toggle-btn" onClick={onSwitch}>Login</button></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;