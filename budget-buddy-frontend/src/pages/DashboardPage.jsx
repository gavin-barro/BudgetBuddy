import React from 'react';
import AccountsCard from '../components/Dashboard/AccountsCard';
import TransactionsCard from '../components/Dashboard/TransactionsCard';
import CategoryPieCard from '../components/Dashboard/CategoryPieCard';
import AccountComparisonsCard from '../components/Dashboard/AccountComparisonsCard';
import './Dashboard.css';

/**
 * Dashboard layout:
 * Left column: Accounts (top) + Recent Txns (bottom)
 * Right column: Category Pie (top) + Account Balance Line (bottom)
 *
 * This page now receives accounts and transactions from props so it always
 * reflects the same data as the rest of the app, with no fallback/demo data.
 */
const DashboardPage = ({ user, accounts = [], transactions = [] }) => {
  // Derive most recent 5 transactions from the global list
  const recentTransactions = React.useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];
    const sorted = [...transactions].sort((a, b) =>
      (b.date || '').localeCompare(a.date || '')
    );
    return sorted.slice(0, 5);
  }, [transactions]);

  return (
    <div className="db-container">
      <div className="db-grid db-grid-2x2">
        <div className="db-col-left">
          {/* AccountsCard will simply show an empty state if accounts = [] */}
          <AccountsCard accounts={accounts} />

          {/* TransactionsCard gets only real data; no fake/fallback transactions */}
          <TransactionsCard
            transactions={recentTransactions}
            accounts={accounts}
          />
        </div>

        <div className="db-col-right">
          {/* Category & balances also use the real arrays; if empty, they can render empty states */}
          <CategoryPieCard transactions={transactions} />
          <AccountComparisonsCard accounts={accounts} transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
