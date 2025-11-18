import React, { useEffect, useMemo, useState } from 'react';
import './AddTransactionForm.css';

/**
* Props:
* - open, onCancel
* - onSubmit: (txnDraft) => void
* - accounts: [{id, name}]
* - categories?: string[]
*/
const DEFAULT_CATEGORIES = [
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

export default function AddTransactionForm({ open, onCancel, onSubmit, accounts = [], categories = DEFAULT_CATEGORIES }) {
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Other');
    const [accountId, setAccountId] = useState('');

    const wasOpenRef = React.useRef(false);
    useEffect(() => {
        if (open && !wasOpenRef.current) {
            setDate(new Date().toISOString().slice(0, 10));
            setDescription('');
            setAmount('');
            setType('expense');
            setCategory('Other');
            setAccountId(accounts[0]?.id || '');
        }
        wasOpenRef.current = open;
    }, [open, accounts]);


    const numericAmount = useMemo(() => Number(amount || 0), [amount]);
    const canSubmit = description.trim() && accountId && !Number.isNaN(numericAmount) && numericAmount !== 0;

    if (!open) return null;

    const submit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit?.({ date, description: description.trim(), amount: numericAmount, type, category, account_id: accountId });
    };
    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Add Transaction">
            <div className="modal-panel">
                <header className="modal-header"><h3>Add Transaction</h3></header>
                <form onSubmit={submit} className="modal-body">
                    <label className="field">
                        <span className="label">Date</span>
                        <input className="input-like" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                    <label className="field">
                        <span className="label">Description</span>
                        <input className="input-like" placeholder="e.g., Groceries" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>
                    <label className="field">
                        <span className="label">Amount</span>
                        <input className="input-like" type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </label>
                    <label className="field">
                        <span className="label">Type</span>
                        <select className="select-like" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </label>
                    <label className="field">
                        <span className="label">Category</span>
                        <select className="select-like" value={category} onChange={(e) => setCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                    <label className="field">
                        <span className="label">Account</span>
                        <select className="select-like" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </label>
                    <div className="modal-actions">
                        <button type="button" className="tab" onClick={onCancel}>Cancel</button>
                        <button type="submit" className={`tab ${canSubmit ? 'active' : ''}`} disabled={!canSubmit}>Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}