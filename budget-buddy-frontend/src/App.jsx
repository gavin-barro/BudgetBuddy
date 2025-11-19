import React, { useState, useEffect, useCallback } from 'react';
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

  // --------------------------------------------------
  // Shared loaders
  // --------------------------------------------------
  const fetchAccounts = useCallback(async () => {
    if (!currentUser) {
      setAccounts([]);
      return;
    }

    try {
      const rows = await AccountManagementService.list();
      setAccounts(rows);
      // keep currentUser.accounts in sync if it exists
      setCurrentUser((prev) =>
        prev ? { ...prev, accounts: rows } : prev
      );
    } catch (e) {
      console.error('Failed to load accounts', e);
    }
  }, [currentUser]);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }

    try {
      // Use TransactionService.list which returns { rows, total, page, pageSize }
      // Request a reasonably large page so the client-side filters/paging
      // in TransactionsPage can work with the full list.
      const result = await TransactionService.list({
        filters: {},
        sort: 'date:desc',
        page: 1,
        pageSize: 500,
      });
      const rows = result?.rows ?? result ?? [];
      setTransactions(rows);
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  }, [currentUser]);

  // When the user logs in/out, pull accounts + transactions
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // --------------------------------------------------
  // Account handlers (unchanged)
  // --------------------------------------------------
  const handleAddAccount = async (draft) => {
    try {
      const res = await AccountManagementService.create(draft);
      if (res?.accounts) {
        setAccounts(res.accounts);
        setCurrentUser((prev) =>
          prev ? { ...prev, accounts: res.accounts } : prev
        );
      } else {
        // Fallback: re-fetch if service didn't return accounts
        await fetchAccounts();
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
        setCurrentUser((prev) =>
          prev ? { ...prev, accounts: res.accounts } : prev
        );
      } else {
        await fetchAccounts();
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
        setCurrentUser((prev) =>
          prev ? { ...prev, accounts: res.accounts } : prev
        );
      } else {
        await fetchAccounts();
      }

      // If your backend also modifies transactions when an account is deleted,
      // you *can* refresh transactions here:
      // await fetchTransactions();
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to delete account');
    }
  };

  // --------------------------------------------------
  // Transaction handlers (real-time updates)
  // --------------------------------------------------
  const handleAddTransaction = async (draft) => {
    try {
      const created = await TransactionService.create(draft);
      if (created) {
        // Optimistic local update so UI feels instant
        setTransactions((prev) => [...prev, created]);
        // Then refresh account balances so dashboards stay in sync
        await fetchAccounts();
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
        await fetchAccounts();
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const result = await TransactionService.remove(id);
      if (result?.ok || result === undefined) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        await fetchAccounts();
      }
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
    // TODO: clear any persisted auth (localStorage/session) if you use it
  };

  // Until a user is authenticated, show the auth page
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
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleAccountUpdate}
            onDeleteAccount={handleAccountDelete}
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
