import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CATEGORY_PALETTE } from './categoryColors';
import './AccountComparisonsCard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/**
 * Income vs Expense comparison per account.
 * - User selects an account from a dropdown
 * - Bar chart shows total Income vs total Expenses for that account
 */
const AccountComparisonsCard = ({
  accounts = [],
  transactions = [],
}) => {
  const [selectedAccountId, setSelectedAccountId] = React.useState('');

  // Keep selected account in sync when accounts change
  React.useEffect(() => {
    if (!accounts || accounts.length === 0) {
      setSelectedAccountId('');
      return;
    }

    // If nothing selected or selected account no longer exists, default to first account
    const exists = accounts.some(
      (a) => String(a.id) === String(selectedAccountId)
    );
    if (!selectedAccountId || !exists) {
      setSelectedAccountId(String(accounts[0].id));
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = React.useMemo(
    () =>
      accounts.find((a) => String(a.id) === String(selectedAccountId)) ||
      null,
    [accounts, selectedAccountId]
  );

  // Aggregate income vs expenses for the selected account
  const { incomeTotal, expenseTotal } = React.useMemo(() => {
    if (!selectedAccountId || !Array.isArray(transactions)) {
      return { incomeTotal: 0, expenseTotal: 0 };
    }

    return transactions.reduce(
      (acc, tx) => {
        const accountId = tx.account_id ?? tx.accountId;
        if (String(accountId) !== String(selectedAccountId)) return acc;

        const amount = Number(tx.amount) || 0;
        const type = (tx.type || '').toLowerCase();

        if (type === 'income' || amount > 0) {
          acc.incomeTotal += Math.abs(amount);
        } else if (type === 'expense' || amount < 0) {
          acc.expenseTotal += Math.abs(amount);
        }
        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0 }
    );
  }, [transactions, selectedAccountId]);

  const hasData = incomeTotal > 0 || expenseTotal > 0;

  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [incomeTotal, expenseTotal],
        backgroundColor: [
          CATEGORY_PALETTE[0] + '99',
          CATEGORY_PALETTE[1] + '99',
        ],
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y || 0;
            return `$${v.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `$${v}`,
        },
      },
    },
  };

  return (
    <section className="card">
      <header className="card-header abl-header">
        <div>
          <h2>Income vs Expenses</h2>
        </div>

        <div className="abl-controls">
          <select
            className="abl-select"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            disabled={!accounts.length}
          >
            {accounts.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="chart-box abl-chart">
        {selectedAccount && hasData ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="abl-empty">
            {selectedAccount
              ? 'No income or expense transactions for this account yet.'
              : 'Add an account to see income vs expense trends.'}
          </div>
        )}
      </div>
    </section>
  );
};

export default AccountComparisonsCard;
