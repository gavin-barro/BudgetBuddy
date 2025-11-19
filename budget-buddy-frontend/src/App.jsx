import React, { useState, useEffect } from 'react';
import AuthenticationPage from './pages/AuthenticationPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import Navbar from './components/Navbar/Navbar';
import AccountManagementService from './api/AccountManagementService';
import TransactionService from './api/TransactionService';
import './index.css';
import TransactionsPage from './pages/TransactionsPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'accounts' | 'transactions' | 'profile'

  // Global state: accounts and transactions
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // When the user logs in/out, fetch their accounts from the backend
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!currentUser) {
        setAccounts([]);
        return;
      }

      try {
        const rows = await AccountManagementService.list();
        setAccounts(rows);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    };

    fetchAccounts();
  }, [currentUser]);

  // When the user logs in/out, fetch their transactions from the backend
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) {
        setTransactions([]);
        return;
      }

      try {
        // Fetch a reasonably large page; sorting is handled client-side where needed
        const { rows } = await TransactionService.list({
          sort: 'date:desc',
          page: 1,
          pageSize: 500,
        });
        setTransactions(rows);
      } catch (e) {
        console.error('Failed to load transactions', e);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  // --- Account handlers (API-backed) ---
  const handleAddAccount = async (draft) => {
    try {
      const res = await AccountManagementService.create(draft);
      if (res?.accounts) {
        setAccounts(res.accounts);
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
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to delete account');
    }
  };

  // --- Transaction handlers (API-backed) ---
  const handleAddTransaction = async (draft) => {
    try {
      const created = await TransactionService.create(draft);
      if (created) {
        setTransactions((prev) => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to add transaction');
    }
  };

  const handleUpdateTransaction = async (id, patch) => {
    try {
      const updated = await TransactionService.update(id, patch);
      if (updated) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await TransactionService.remove(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to delete transaction');
    }
  };

  const handleUserUpdate = (updatedUser) => setCurrentUser(updatedUser);

  const handleLogout = () => {
    setCurrentUser(null);
    setAccounts([]);
    setTransactions([]);
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
        {activeView === 'dashboard' && (
          <DashboardPage
            user={currentUser}
            accounts={accounts}
            transactions={transactions}
          />
        )}

        {activeView === 'transactions' && (
          <TransactionsPage
            user={currentUser}
            accounts={accounts}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

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
