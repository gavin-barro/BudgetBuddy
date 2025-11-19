import React from 'react';
import '../../pages/Dashboard.css'; // shared glass/card styles
import '../../pages/AccountsPage.css'; // shared accounts list styles
const currency = (n) => {
  const absVal = Math.abs(n);
  const formatted = absVal.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
};

const AccountsCard = ({ accounts = [] }) => {
  const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  return (
    <section className="card">
      <header className="card-header">
        <h2>Accounts</h2>
        <div className={`pill ${total < 0 ? 'neg' : 'pos'}`}>{currency(total)}</div>
      </header>
      <ul className="list">
        {accounts.map((a) => (
          <li key={a.id} className="list-row">
            <div className="list-main">
              <div className="list-title">{a.name}</div>
              <div className="list-sub">{a.type.toUpperCase()}</div>
            </div>
            <div className={`amount ${a.balance < 0 ? 'neg' : ''}`}>{currency(Number(a.balance) || 0)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AccountsCard;