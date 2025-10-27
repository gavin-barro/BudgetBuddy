import React, { useEffect, useMemo, useState } from 'react';
import './AddAccountForm.css';

/**
 * Props:
 *  - open: boolean   -> controls visibility
 *  - onSubmit: (accountDraft) => void
 *      where accountDraft = { name: string, type: string, balance: number }
 *  - onCancel: () => void
 *  - defaultType?: string
 */
const ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Credit Card',
  'Investment',
  'Loan',
  'Other',
];

export default function AddAccountForm({ open, onSubmit, onCancel, defaultType = 'Checking' }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType);
  const [balance, setBalance] = useState('');

  // Reset when opened/closed
  useEffect(() => {
    if (open) {
      setName('');
      setType(defaultType);
      setBalance('');
    }
  }, [open, defaultType]);

  const numericBalance = useMemo(() => {
    const n = Number(balance);
    return Number.isFinite(n) ? n : 0;
  }, [balance]);

  const canSubmit = name.trim().length > 0 && type.trim().length > 0 && !Number.isNaN(numericBalance);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({
      name: name.trim(),
      type: type.trim(),
      balance: numericBalance,
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Add Account">
      <div className="modal-panel">
        <header className="modal-header">
          <h3>Add Account</h3>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <label className="field">
            <span className="label">Account Name</span>
            <input
              className="input-like"
              placeholder="e.g., Everyday Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="field">
            <span className="label">Type</span>
            <select
              className="select-like"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {ACCOUNT_TYPES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Starting Balance</span>
            <input
              className="input-like"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="tab" onClick={onCancel}>Cancel</button>
            <button type="submit" className={`tab ${canSubmit ? 'active' : ''}`} disabled={!canSubmit}>
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

