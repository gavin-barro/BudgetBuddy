import React from 'react';
import AccountsCard from '../components/Dashboard/AccountsCard';
import TransactionsCard from '../components/Dashboard/TransactionsCard';
import CategoryPieCard from '../components/Dashboard/CategoryPieCard';
import AccountBalancesLineCard from '../components/Dashboard/AccountBalancesLineCard';
import './Dashboard.css';

/**
 * Dashboard layout:
 * Left column: Accounts (top) + Recent Txns (bottom)
 * Right column: Category Pie (top) + Account Balance Line (bottom)
 *
 * NOTE: This page now reads accounts/transactions from props.user
 * so it always reflects the same data as the Accounts page (mock API-backed).
 */
const DashboardPage = ({ user }) => {
  const fallbackAccounts = [
    { id: 'acc_1', name: 'Everyday Checking', type: 'Checking', balance: 1425.32 },
    { id: 'acc_2', name: 'Vacation Savings', type: 'Savings', balance: 5200.0 },
    { id: 'acc_3', name: 'Freedom Card', type: 'Credit Card', balance: -313.22 },
  ];

  const fallbackTransactions = [
    { id: 't_1', name: 'Groceries', category: 'Food & Dining', accountId: 'acc_1', amount: -82.45 },
    { id: 't_2', name: 'Gas', category: 'Transportation', accountId: 'acc_1', amount: -44.10 },
    { id: 't_3', name: 'Gym Membership', category: 'Health & Fitness', accountId: 'acc_1', amount: -29.99 },
    { id: 't_4', name: 'Coffee', category: 'Food & Dining', accountId: 'acc_1', amount: -4.85 },
    { id: 't_5', name: 'Paycheck', category: 'Income', accountId: 'acc_1', amount: 1850.00 },
  ];

  const accounts =
    Array.isArray(user?.accounts) && user.accounts.length ? user.accounts : fallbackAccounts;

  const transactions =
    Array.isArray(user?.transactions) && user.transactions.length
      ? user.transactions
      : fallbackTransactions;

  return (
    <div className="db-container">
      <div className="db-grid db-grid-2x2">
        <div className="db-col-left">
          <AccountsCard accounts={accounts} />
          <TransactionsCard transactions={transactions} accounts={accounts} />
        </div>
        <div className="db-col-right">
          <CategoryPieCard transactions={transactions} />
          <AccountBalancesLineCard accounts={accounts} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

