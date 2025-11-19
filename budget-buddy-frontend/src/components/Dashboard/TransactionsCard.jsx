import React from 'react';

const currency = (n) => {
  const v = Number(n) || 0;
  return v < 0 ? `-$${Math.abs(v).toFixed(2)}` : `$${v.toFixed(2)}`;
};

export default function TransactionsCard({ transactions = [], accounts = [] }) {
  // Create lookup map with consistent string keys
  const byId = Object.fromEntries(accounts.map((a) => [String(a.id), a]));
  
  const recent = [...transactions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 7);

  return (
    <section className="card">
      <header className="card-header">
        <h2>Recent Transactions</h2>
      </header>
      <ul className="list">
        {recent.map((t) => {
          // Normalize account_id - handle both possible field names
          const accountId = t.account_id || t.accountId;
          const accountKey = accountId != null ? String(accountId) : null;
          const accountName = accountKey && byId[accountKey] 
            ? byId[accountKey].name 
            : (t.accountName || 'Unknown Account');

          return (
            <li key={t.id} className="list-row">
              <div className="list-main">
                <div className="list-title">{t.description || '(No description)'}</div>
                <div className="list-sub">
                  <span className="tag">{t.category || 'Uncategorized'}</span>
                  <span className="dot" />
                  <span>{accountName}</span>
                  {t.date ? (<><span className="dot" /><span>{t.date}</span></>) : null}
                </div>
              </div>
              <div className={`amount ${Number(t.amount) < 0 ? 'neg' : 'pos'}`}>
                {currency(t.amount)}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}