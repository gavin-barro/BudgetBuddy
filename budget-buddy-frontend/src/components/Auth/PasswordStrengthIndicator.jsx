// PasswordStrengthIndicator.jsx
import React, { useMemo } from 'react';
import './Auth.css';

const PasswordStrengthIndicator = ({ password }) => {
  const { score, label } = useMemo(() => {
      let score = 0;
      if (!password) return { score: 0, label: '' };
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      
      const label = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score - 1] || '';
      if (password.length > 0 && password.length < 8) {
          return { score: 1, label: 'Too Short' };
      }
      return { score, label };
  }, [password]);

  const getBarColor = (index) => {
      if (index >= score) return 'rgba(0,0,0,0.1)';
      if (score === 1) return '#ef4444'; // red-500
      if (score === 2) return '#f97316'; // orange-500
      if (score === 3) return '#f59e0b'; // amber-500
      if (score === 4) return '#84cc16'; // lime-500
      return '#22c55e'; // green-500
  };

  return (
      <div className="strength-container">
          <div className="strength-bars">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bar" style={{ backgroundColor: getBarColor(i-1) }}></div>
              ))}
          </div>
          {label && <div className="strength-label">{label}</div>}
      </div>
  );
};

export default PasswordStrengthIndicator;


