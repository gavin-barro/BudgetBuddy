// src/App.jsx
import React, { useState, useEffect } from 'react';
import AuthenticationPage from './pages/AuthenticationPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import Navbar from './components/Navbar/Navbar';
import AccountManagementService from './api/AccountManagementService';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'accounts' | 'profile'

  // Keep accounts separate from currentUser so we can refresh from the API cleanly
  const [accounts, setAccounts] = useState([]);

  // When the user logs in, fetch their accounts from the backend
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!currentUser) {
        setAccounts([]);
        setCurrentUser((prev) => (prev ? { ...prev, accounts: [] } : null))
        return;
      }
      try {
        const rows = await AccountManagementService.list();
        setAccounts(rows);
        setCurrentUser((prev) => (prev ? { ...prev, accounts: rows } : null));
      } catch (e) {
        console.error(e);
      }
    };
    fetchAccounts();
  }, [currentUser]);

  // --- Account handlers (API-backed) ---
  const handleAddAccount = async (draft) => {
    try {
      const res = await AccountManagementService.create(draft);
      if (res?.accounts) {
        setAccounts(res.accounts);
        setCurrentUser((prev) => (prev ? { ...prev, accounts: res.accounts } : null));
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to add account');
    }
  };

  const handleAccountUpdate = async (id, patch) => {
    try {
      const res = await AccountManagementService.update(id, patch);
      if (res?.accounts) {
        setAccounts(res.accounts);
        setCurrentUser((prev) => (prev ? { ...prev, accounts: res.accounts } : null));
      } 
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to update account');
    }
  };

  const handleAccountDelete = async (id) => {
    try {
      const res = await AccountManagementService.remove(id);
      if (res?.accounts) {
        setAccounts(res.accounts);
        setCurrentUser((prev) => (prev ? { ...prev, accounts: res.accounts } : null));
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to delete account');
    }
  };

  const handleUserUpdate = (updatedUser) => setCurrentUser(updatedUser);
  const handleLogout = () => {
    setCurrentUser(null);
    setAccounts([]);
    // clear tokens/localStorage here if you persist auth
  };

  // Show auth until a real user is present
  if (!currentUser) {
    return <AuthenticationPage onAuthSuccess={setCurrentUser} />;
  }

  return (
    <>
      <Navbar
        user={currentUser}
        activePage={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
      />
      <div className="page-shell">
        {activeView === 'dashboard' && <DashboardPage user={currentUser} accounts={accounts} />}
        {activeView === 'accounts' && (
          <AccountsPage
            accounts={accounts}
            onUpdateAccount={handleAccountUpdate}
            onDeleteAccount={handleAccountDelete}
            onAddAccount={handleAddAccount}
          />
        )}
        {activeView === 'profile' && (
          <ProfilePage
            user={currentUser}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        )}
      </div>
    </>
  );
}

export default App;
