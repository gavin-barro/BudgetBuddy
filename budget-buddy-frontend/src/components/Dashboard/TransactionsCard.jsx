import React from 'react';

const currency = (n) => (n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`);

const TransactionsCard = ({ transactions = [], accounts = [] }) => {
  const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const recent = [...transactions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 7); // show most recent 7 if dates exist; order is stable for demo

  return (
    <section className="card">
      <header className="card-header">
        <h2>Recent Transactions</h2>
      </header>
      <ul className="list">
        {recent.map((t) => (
          <li key={t.id} className="list-row">
            <div className="list-main">
              <div className="list-title">{t.name}</div>
              <div className="list-sub">
                <span className="tag">{t.category}</span>
                <span className="dot" />
                <span>{byId[t.accountId]?.name || t.account || 'Unknown Account'}</span>
              </div>
            </div>
            <div className={`amount ${t.amount < 0 ? 'neg' : 'pos'}`}>{currency(Number(t.amount) || 0)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TransactionsCard;