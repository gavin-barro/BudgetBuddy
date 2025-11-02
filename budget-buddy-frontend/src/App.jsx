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

  // --- BYPASS AUTH FOR TESTING ---
  useEffect(() => {
    const dummyUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      accounts: [
        { id: 'acc_1', name: 'Checking', type: 'Checking', balance: 1200 },
        { id: 'acc_2', name: 'Savings', type: 'Savings', balance: 5000 },
      ],
      transactions: [
        { id: 't1', name: 'Groceries', category: 'Food', accountId: 'acc_1', amount: -50 },
        { id: 't2', name: 'Paycheck', category: 'Recreation', accountId: 'acc_1', amount: 2000 },
      ],
    };

    setCurrentUser(dummyUser);
    // Seed mock store once, then load accounts from the service so all pages are in sync
    AccountManagementService.seedFromUser(dummyUser);
    AccountManagementService.list(dummyUser).then((accounts) => {
      setCurrentUser((u) => ({ ...u, accounts }));
    });
  }, []);

  // --- Handlers using the mock API service ---
  const handleAddAccount = async (draft) => {
    if (!currentUser) return;
    const res = await AccountManagementService.create(currentUser, draft);
    if (res?.accounts) {
      setCurrentUser((u) => ({ ...u, accounts: res.accounts }));
    }
  };

  const handleAccountUpdate = async (id, patch) => {
    if (!currentUser) return;
    const res = await AccountManagementService.update(currentUser, id, patch);
    if (res?.accounts) {
      setCurrentUser((u) => ({ ...u, accounts: res.accounts }));
    }
  };

  const handleAccountDelete = async (id) => {
    if (!currentUser) return;
    const res = await AccountManagementService.remove(currentUser, id);
    if (res?.accounts) {
      // Also remove transactions tied to that account on the client (optional convenience)
      setCurrentUser((u) => ({
        ...u,
        accounts: res.accounts,
        transactions: (u.transactions || []).filter((t) => t.accountId !== id),
      }));
    }
  };

  const handleUserUpdate = (updatedUser) => setCurrentUser(updatedUser);
  const handleLogout = () => {
    setCurrentUser(null);
    // If you were persisting auth, you’d clear tokens/localStorage here.
  };


  if (!currentUser) {
    // keep your old path available when you disable bypass
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
        {activeView === 'dashboard' && <DashboardPage user={currentUser} />}
        {activeView === 'accounts' && (
          <AccountsPage
            accounts={currentUser.accounts}
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
