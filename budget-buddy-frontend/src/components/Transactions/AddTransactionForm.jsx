import React, { useEffect, useMemo, useState } from 'react';
import './AddTransactionForm.css';

const CATEGORIES = [
  'Income',
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Health & Fitness',
  'Shopping',
  'Entertainment',
  'Debt',
  'Other',
];

export default function AddTransactionForm({
  open,
  onCancel,
  onSubmit,
  accounts = [],
  initialValues = null,
}) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');
  const [accountId, setAccountId] = useState('');

  // Prefill when modal opens (add vs edit)
  // IMPORTANT: don't depend on `accounts` so typing doesn't get reset
  useEffect(() => {
    if (!open) return;

    const today = new Date().toISOString().slice(0, 10);

    if (initialValues) {
      // EDIT mode
      const rawAmount = initialValues.amount;
      const absoluteAmount =
        rawAmount !== undefined && rawAmount !== null
          ? Math.abs(Number(rawAmount))
          : '';

      setDate(initialValues.date || today);
      setDescription(initialValues.description || '');
      setAmount(
        absoluteAmount === '' || Number.isNaN(absoluteAmount)
          ? ''
          : String(absoluteAmount)
      );
      setType(initialValues.type || 'expense');
      setCategory(initialValues.category || 'Other');
      setAccountId(
        initialValues.account_id ??
          initialValues.accountId ??
          accounts[0]?.id ??
          ''
      );
    } else {
      // ADD mode
      setDate(today);
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Other');
      setAccountId(accounts[0]?.id || '');
    }
  }, [open, initialValues]); // <-- removed `accounts` here

  const numericAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const hasAccounts = accounts.length > 0;

  const canSubmit =
    !!date &&
    description.trim().length > 0 &&
    amount !== '' &&
    !Number.isNaN(numericAmount) &&
    hasAccounts &&
    !!accountId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit?.({
      date,
      description: description.trim(),
      amount: numericAmount, // TransactionService will make expenses negative
      type,
      category,
      account_id: accountId, // TransactionService maps this to backend accountId
    });
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={initialValues ? 'Edit Transaction' : 'Add Transaction'}
    >
      <div className="modal-panel">
        <header className="modal-header">
          <h3>{initialValues ? 'Edit Transaction' : 'Add Transaction'}</h3>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Date</span>
            <input
              type="date"
              className="input-like"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="label">Description</span>
            <input
              type="text"
              className="input-like"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Groceries, Rent, Paycheck"
              required
            />
          </label>

          <label className="field">
            <span className="label">Amount</span>
            <input
              type="number"
              className="input-like"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label className="field">
            <span className="label">Type</span>
            <select
              className="select-like"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="field">
            <span className="label">Category</span>
            <select
              className="select-like"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Account</span>
            <select
              className="select-like"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              disabled={!hasAccounts}
            >
              {hasAccounts ? (
                accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))
              ) : (
                <option value="">No accounts available</option>
              )}
            </select>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="tab"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`tab ${canSubmit ? 'active' : ''}`}
              disabled={!canSubmit}
            >
              {initialValues ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
