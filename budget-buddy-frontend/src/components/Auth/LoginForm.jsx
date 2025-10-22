import React, { useState } from 'react';
import './Auth.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { login } from '../../api/authService';

const LoginForm = ({ onSwitch, onSuccess }) => {
  const [form, setForm] = useState({ identifier: '', password: '', remember: true });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const email = form.identifier.trim()
      const password = form.password;
      const user = await login(email, password);
      
      // --- SUCCESS ALERT ---
      alert(`Login Successful! Welcome back, ${user.firstName}.`);

      if (form.remember) {
        localStorage.setItem('bb_remember', '1');
      } else {
        localStorage.removeItem('bb_remember');
      }
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <div className="alert error" role="alert">• {error}</div>}
        <div className="input-box">
          <input type="text" placeholder='Email' name="identifier" value={form.identifier} onChange={onChange} required />
          <FaUser className="icon"/>
        </div>
        <div className="input-box">
          <input type={showPwd ? 'text' : 'password'} placeholder='Password' name="password" value={form.password} onChange={onChange} required />
          <FaLock className="icon"/>
          <button type="button" className="icon-button" onClick={() => setShowPwd(s => !s)}>
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="remember-forgot">
          <label><input type="checkbox" name="remember" checked={form.remember} onChange={onChange} />Remember me</label>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot Password clicked!'); }}>Forgot Password?</a>
        </div>
        <button type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        <div className="register-link">
          <p>Don't have an account? <button type="button" className="auth-toggle-btn" onClick={onSwitch}>Register</button></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;