import React from 'react';
import './TransactionsTable.css';

const currency = (n) => {
  const v = Number(n) || 0;
  const s = Math.abs(v).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return v < 0 ? `-$${s}` : `$${s}`;
};

/**
 * TransactionsTable
 *
 * Now relies on each row having:
 *  - date (YYYY-MM-DD)
 *  - description
 *  - category
 *  - type: "income" | "expense"
 *  - amount: negative for expenses, positive for income
 *  - accountName: provided by TransactionService.normalizeFromApi(...)
 *
 * No more account-id mapping required.
 */
export default function TransactionsTable({ rows, onEdit, onDelete }) {
  return (
    <div className="ap-table-wrap">
      <table className="ap-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Account</th>
            <th>Amount</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const accountName =
              r.accountName ||
              (r.account && r.account.name) || // in case you ever pass full account
              'Unknown';

            return (
              <tr key={r.id} className="ap-row">
                <td className="ap-cell">{r.date}</td>
                <td className="ap-cell ap-name" title={r.description}>
                  {r.description}
                </td>
                <td className="ap-cell">
                  <span className="tag">{r.category}</span>
                </td>
                <td className="ap-cell">
                  {r.type === 'income' ? 'Income' : 'Expense'}
                </td>
                <td className="ap-cell">
                  {accountName}
                </td>
                <td
                  className={`ap-cell ap-balance ${
                    r.amount < 0 ? 'neg' : 'pos'
                  }`}
                >
                  {currency(r.amount)}
                </td>
                <td className="ap-cell ap-actions">
                  <button className="tab" onClick={() => onEdit?.(r)}>
                    Edit
                  </button>
                  <button
                    className="logout"
                    style={{ marginLeft: 8 }}
                    onClick={() => onDelete?.(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td
                className="ap-cell"
                colSpan={7}
                style={{ textAlign: 'center', padding: '1rem' }}
              >
                No transactions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
