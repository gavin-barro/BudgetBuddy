// src/pages/AccountsPage.jsx
import React, { useState } from 'react';
import './Dashboard.css';
import './AccountsPage.css';
import AddAccountForm from '../components/Accounts/AddAccountForm';

const currency = (n) => {
    const absVal = Math.abs(Number(n) || 0);
    const formatted = absVal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return (Number(n) || 0) < 0 ? `-$${formatted}` : `$${formatted}`;
};

// Canonical options for editing
const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'other', label: 'Other' },
];

export default function AccountsPage({
    accounts = [],
    onUpdateAccount,
    onDeleteAccount,
    onAddAccount,
}) {
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ name: '', type: 'checking', balance: 0 });

    // Add-account modal
    const [showAdd, setShowAdd] = useState(false);
    const openAdd = () => setShowAdd(true);
    const closeAdd = () => setShowAdd(false);
    const handleAddSubmit = (accountDraft) => {
        onAddAccount?.(accountDraft); // AddAccountForm may pass "Checking"/etc., service normalizes
        closeAdd();
    };

    const startEdit = (acc) => {
        setEditingId(acc.id);
        // ensure type uses canonical value if BE returned display text
        const t = String(acc.type || 'checking').toLowerCase();
        const canonical = ACCOUNT_TYPES.some(o => o.value === t) ? t : 'other';
        setDraft({ name: acc.name ?? '', type: canonical, balance: acc.balance ?? 0 });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ name: '', type: 'checking', balance: 0 });
    };

    const saveEdit = (id) => {
        onUpdateAccount?.(id, {
            name: (draft.name || '').trim() || 'Untitled',
            type: draft.type,                       // already canonical
            balance: draft.balance,                 // service will coerce safely (allow 0)
        });
        cancelEdit();
    };

    const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

    return (
        <div className="db-container accounts-page">
            <section className="card">
                <header className="card-header">
                    <h2>Accounts</h2>
                    <div className="ap-header-actions">
                        <div className={`pill ${total < 0 ? 'neg' : 'pos'}`}>{currency(total)}</div>
                        <button className="tab active" type="button" onClick={openAdd}>
                            + Add Account
                        </button>
                    </div>
                </header>

                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Balance</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((acc) => {
                                const isEditing = editingId === acc.id;
                                const displayType =
                                    ACCOUNT_TYPES.find(o => o.value === String(acc.type || '').toLowerCase())?.label
                                    ?? (acc.type || 'Other');

                                return (
                                    <tr key={acc.id} className="ap-row">
                                        <td className="ap-cell ap-name">
                                            {isEditing ? (
                                                <input
                                                    value={draft.name}
                                                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                                    className="input-like"
                                                    placeholder="Account name"
                                                    autoFocus
                                                />
                                            ) : (
                                                acc.name
                                            )}
                                        </td>

                                        <td className="ap-cell">
                                            {isEditing ? (
                                                <select
                                                    className="select-like"
                                                    value={draft.type}
                                                    onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                                                >
                                                    {ACCOUNT_TYPES.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="tag">{displayType}</span>
                                            )}
                                        </td>

                                        <td className="ap-cell ap-balance">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={draft.balance}
                                                    onChange={(e) => setDraft((d) => ({ ...d, balance: e.target.value }))}
                                                    className="input-like"
                                                    placeholder="0.00"
                                                />
                                            ) : (
                                                <span className={`amount ${Number(acc.balance) < 0 ? 'neg' : 'pos'}`}>
                                                    {currency(acc.balance)}
                                                </span>
                                            )}
                                        </td>

                                        <td className="ap-cell ap-actions">
                                            {isEditing ? (
                                                <>
                                                    <button className="tab active" onClick={() => saveEdit(acc.id)}>Save</button>
                                                    <button className="tab" onClick={cancelEdit} style={{ marginLeft: 8 }}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="tab" onClick={() => startEdit(acc)}>Edit</button>
                                                    <button
                                                        className="logout"
                                                        style={{ marginLeft: 8 }}
                                                        onClick={() => onDeleteAccount?.(acc.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add Account Modal */}
            <AddAccountForm open={showAdd} onSubmit={handleAddSubmit} onCancel={closeAdd} />
        </div>
    );
}
