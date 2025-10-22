import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import '../components/Auth/Auth.css';

const AuthenticationPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const handleSwitch = (next) => setMode(next);

  const handleSuccess = (user) => {
    if (onAuthSuccess) onAuthSuccess(user);
    // You can add a success notification here, e.g., using a toast library
    console.log(`Authentication successful for ${user.email}`);
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Welcome to Budget Buddy</h1>

      {mode === 'login' ? (
        <LoginForm onSwitch={() => handleSwitch('register')} onSuccess={handleSuccess} />
      ) : (
        <RegisterForm onSwitch={() => handleSwitch('login')} onSuccess={handleSuccess} />
      )}
    </div>
  );
};

export default AuthenticationPage;