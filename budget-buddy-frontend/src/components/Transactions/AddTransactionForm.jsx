import React, { useEffect, useState } from 'react';
import './AddTransactionForm.css';

export default function AddTransactionForm({
  open,
  onCancel,
  onSubmit,
  accounts = [],
  initialValues = null,   // NEW
}) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');
  const [accountId, setAccountId] = useState('');

  /**
   * Prefill when modal opens
   */
  useEffect(() => {
    if (!open) return;

    const today = new Date().toISOString().slice(0, 10);

    if (initialValues) {
      // EDIT MODE
      setDate(initialValues.date || today);
      setDescription(initialValues.description || '');
      setAmount(
        initialValues.amount !== undefined && initialValues.amount !== null
          ? String(initialValues.amount)
          : ''
      );
      setType(initialValues.type || 'expense');
      setCategory(initialValues.category || 'Other');
      setAccountId(initialValues.account_id || accounts[0]?.id || '');
    } else {
      // ADD MODE
      setDate(today);
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Other');
      setAccountId(accounts[0]?.id || '');
    }
  }, [open, initialValues, accounts]);

  /**
   * Submit handler
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = Number(amount || 0);

    onSubmit?.({
      date,
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      account_id: accountId,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h3>{initialValues ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="input-like"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label className="form-label">Description</label>
          <input
            type="text"
            className="input-like"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label className="form-label">Amount</label>
          <input
            type="number"
            className="input-like"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label className="form-label">Type</label>
          <select
            className="select-like"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <label className="form-label">Category</label>
          <select
            className="select-like"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Income</option>
            <option>Food & Dining</option>
            <option>Transportation</option>
            <option>Housing</option>
            <option>Utilities</option>
            <option>Health & Fitness</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Debt</option>
            <option>Other</option>
          </select>

          <label className="form-label">Account</label>
          <select
            className="select-like"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <footer className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              {initialValues ? 'Update' : 'Add'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
