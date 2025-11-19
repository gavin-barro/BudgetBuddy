import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import './Transactions.css';
import TransactionsTable from '../components/Transactions/TransactionsTable';
import AddTransactionForm from '../components/Transactions/AddTransactionForm';

const PAGE_SIZES = [10, 25, 50];
const SORTS = [
  { value: 'date:desc', label: 'Date (newest first)' },
  { value: 'date:asc', label: 'Date (oldest first)' },
  { value: 'amount:desc', label: 'Amount (highest first)' },
  { value: 'amount:asc', label: 'Amount (lowest first)' },
  { value: 'description:asc', label: 'Description (A-Z)' },
  { value: 'description:desc', label: 'Description (Z-A)' },
];

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

// helpers for local filtering/sorting
const applyFilters = (rows, { accountId, category, type, dateFrom, dateTo, search }) =>
  rows.filter((r) => {
    if (accountId && String(r.account_id) !== String(accountId)) return false;
    if (category && category !== 'All' && r.category !== category) return false;
    if (type && type !== 'All' && r.type !== type.toLowerCase()) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${r.description || ''} ${r.category || ''} ${r.type || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

const applySort = (rows, sort) => {
  const [key, dir] = (sort || 'date:desc').split(':');
  const sign = dir === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const va = a[key];
    const vb = b[key];

    if (key === 'amount') {
      return sign * (Number(va) - Number(vb));
    }

    return sign * String(va).localeCompare(String(vb));
  });
};

export default function TransactionsPage({
  user,
  accounts = [],
  transactions = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState('date:desc');

  // Filters
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  // Paginated/filtered rows
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Local recompute whenever transactions/filters/sort/page change
  useEffect(() => {
    const filtered = applyFilters(transactions, {
      accountId,
      category,
      type,
      dateFrom,
      dateTo,
      search,
    });

    const sorted = applySort(filtered, sort);

    const newTotal = sorted.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRows = sorted.slice(start, end);

    setRows(pageRows);
    setTotal(newTotal);
  }, [transactions, accountId, category, type, dateFrom, dateTo, search, sort, page, pageSize]);

  const clearFilters = () => {
    setAccountId('');
    setCategory('All');
    setType('All');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  // ---------------------------
  // SAVE HANDLER: CREATE or UPDATE
  // ---------------------------
  const handleSave = async (draft) => {
    try {
      if (editingRow && editingRow.id) {
        await onUpdateTransaction(editingRow.id, draft);
      } else {
        await onAddTransaction(draft);
      }
    } finally {
      setShowAdd(false);
      setEditingRow(null);
      setPage(1);
    }
  };

  // DELETE HANDLER
  const handleDelete = async (id) => {
    await onDeleteTransaction(id);
  };

  // When user selects an edit
  const onEditRow = (row) => {
    setEditingRow(row);
    setShowAdd(true);
  };

  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="db-container">
      <section className="card tx-card">
        <header className="card-header">
          <h2>Transactions</h2>
          <div className="ap-header-actions">
            <button
              className="tab active"
              type="button"
              onClick={() => {
                setEditingRow(null);
                setShowAdd(true);
              }}
            >
              + Add Transaction
            </button>
          </div>
        </header>

        {/* FILTERS */}
        <div className="filters">
          <select
            className="select-like"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            className="select-like"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>income</option>
            <option>expense</option>
          </select>

          <select
            className="select-like"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="input-like"
            placeholder="Search description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="filter-group-date">
            <input
              className="input-like"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
            <span className="filters-sep">to</span>
            <input
              className="input-like"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-group-controls">
            <select
              className="select-like"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              className="select-like"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>

          <div className="filter-reset-row">
            <button
              className="tab"
              onClick={() => {
                clearFilters();
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* TABLE */}
        <TransactionsTable
          rows={rows}
          onEdit={onEditRow}
          onDelete={handleDelete}
        />

        {/* PAGINATION */}
        <div className="pagination">
          <div className="pagination-left">
            {start}–{end} of {total}
          </div>
          <div className="pagination-right">
            <button
              className="tab"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="tab"
              disabled={end >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* ADD/EDIT TRANSACTION MODAL */}
      <AddTransactionForm
        open={showAdd}
        onCancel={() => {
          setShowAdd(false);
          setEditingRow(null);
        }}
        onSubmit={handleSave}
        accounts={accounts}
        initialValues={editingRow}
      />
    </div>
  );
}
