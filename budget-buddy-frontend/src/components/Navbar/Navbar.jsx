import React from 'react';

import './Navbar.css';

export default function Navbar({ user, onNavigate, onLogout, activePage }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <h3>Budget Buddy</h3>
        </div>

        {/* Nav links */}
        <div className="navbar-links">
          <button
            className={activePage === 'dashboard' ? 'active' : ''}
            onClick={() => onNavigate('dashboard')}
            type="button"
          >
            Dashboard
          </button>
          <button
            className={activePage === 'transactions' ? 'active' : ''}
            onClick={() => onNavigate('transactions')}
            type="button"
            >
            Transactions
            </button>
          <button
            className={activePage === 'accounts' ? 'active' : ''}
            onClick={() => onNavigate('accounts')}
            type="button"
          >
            Accounts
          </button>
          <button
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => onNavigate('profile')}
            type="button"
          >
            Profile
          </button>
        </div>

        {/* User info + logout */}
        <div className="navbar-user">
          {user && (
            <span className="navbar-username">
              Welcome, {user.firstName || user.name || 'User'}
            </span>
          )}
          <button
            className="logout-nav-button"
            onClick={onLogout}
            type="button"
            aria-label="Logout"
          >
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
