import React, { useMemo, useState } from 'react';
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

// Static category list – adjust as you like
const CATEGORIES = [
  'Housing',
  'Utilities',
  'Food',
  'Transportation',
  'Entertainment',
  'Health',
  'Debt',
  'Savings',
  'Other',
];

function sortRows(rows, sort) {
  if (!sort) return rows;
  const [field, dir] = sort.split(':'); // e.g. "date:desc"
  const factor = dir === 'desc' ? -1 : 1;

  return [...rows].sort((a, b) => {
    let av = a[field];
    let bv = b[field];

    if (field === 'amount') {
      av = Number(av) || 0;
      bv = Number(bv) || 0;
    }
    if (field === 'description') {
      av = (av || '').toLowerCase();
      bv = (bv || '').toLowerCase();
    }

    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

export default function TransactionsPage({
  user,
  accounts,
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Filters
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('All'); // "All" | one of CATEGORIES
  const [type, setType] = useState('All'); // "All" | "income" | "expense"
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  // Paging + sorting
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('date:desc');

  // Filter + sort
  const filtered = useMemo(() => {
    let rows = transactions || [];

    rows = rows.filter((r) => {
      const accountIdValue = String(r.account_id ?? r.accountId ?? '');

      if (accountId && accountIdValue !== String(accountId)) return false;
      if (category && category !== 'All' && r.category !== category) return false;
      if (type && type !== 'All' && r.type !== type.toLowerCase()) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;

      if (search) {
        const q = search.toLowerCase();
        const haystack = `${r.description ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    rows = sortRows(rows, sort);
    return rows;
  }, [transactions, accountId, category, type, dateFrom, dateTo, search, sort]);

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndexExclusive = startIndex + pageSize;
  const rows = filtered.slice(startIndex, endIndexExclusive);

  const start = total === 0 ? 0 : startIndex + 1;
  const end = total === 0 ? 0 : Math.min(total, endIndexExclusive);

  const clearFilters = () => {
    setAccountId('');
    setCategory('All');
    setType('All');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  const onEditRow = (row) => {
    setEditingRow(row);
    setShowAdd(true);
  };

  const handleSave = async (values) => {
    if (editingRow) {
      await onUpdateTransaction?.(editingRow.id, values);
    } else {
      await onAddTransaction?.(values);
    }
    setShowAdd(false);
    setEditingRow(null);
  };

  const handleDelete = async (id) => {
    await onDeleteTransaction?.(id);
  };

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
          {/* Account */}
          <select
            className="select-like"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            className="select-like"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Income and Expense</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category */}
          <select
            className="select-like"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            className="input-like"
            placeholder="Search description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* Date range */}
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

          {/* Sort + page size */}
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

          {/* Reset */}
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
