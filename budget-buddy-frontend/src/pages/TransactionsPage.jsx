import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import './Transactions.css';
import TransactionsTable from '../components/Transactions/TransactionsTable';
import AddTransactionForm from '../components/Transactions/AddTransactionForm';
import TransactionService from '../api/TransactionService';

const PAGE_SIZES = [10, 25, 50];
const SORTS = [
  { value: 'date:desc', label: 'Date (newest first)' },
  { value: 'date:asc', label: 'Date (oldest first)' },
  { value: 'amount:desc', label: 'Amount (highest first)' },
  { value: 'amount:asc', label: 'Amount (lowest first)' },
  { value: 'description:asc', label: 'Description (A-Z)' },
  { value: 'description:desc', label: 'Description (Z-A)' },
];

// Keep categories consistent with the AddTransactionForm defaults
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

export default function TransactionsPage({ user, accounts = [] }) {
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

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  // NEW: track the row we’re editing (or null when adding)
  const [editingRow, setEditingRow] = useState(null);

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map(a => [String(a.id), a])),
    [accounts]
  );

  useEffect(() => {
    TransactionService.seedIfEmpty();
  }, []);

  async function refresh() {
    const { rows, total } = await TransactionService.list({
      filters: { accountId, category, type, dateFrom, dateTo, search },
      sort,
      page,
      pageSize,
    });
    setRows(rows);
    setTotal(total);
  }

  useEffect(() => {
    refresh();
  }, [accountId, category, type, dateFrom, dateTo, search, sort, page, pageSize]);

  const clearFilters = () => {
    setAccountId('');
    setCategory('All');
    setType('All');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  // Single save handler: decides between create vs update
  const onSave = async (draft) => {
    if (editingRow && editingRow.id != null) {
      // UPDATE via TransactionService
      await TransactionService.update(editingRow.id, draft);
    } else {
      // CREATE
      await TransactionService.create(draft);
    }

    setShowAdd(false);
    setEditingRow(null);
    setPage(1);
    refresh();
  };

  const onDelete = async (id) => {
    await TransactionService.remove(id);
    refresh();
  };

  // Called when user clicks "Edit" in TransactionsTable
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
                // ensure we’re in “add” mode
                setEditingRow(null);
                setShowAdd(true);
              }}
            >
              + Add Transaction
            </button>
          </div>
        </header>

        {/* Filters Row */}
        <div className="filters">
          {/* Item 1: Account */}
          <select
            className="select-like"
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
          >
            <option value="">All accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {/* Item 2: Type */}
          <select
            className="select-like"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option>All</option>
            <option>income</option>
            <option>expense</option>
          </select>

          {/* Item 3: Category */}
          <select
            className="select-like"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Item 4: Search */}
          <input
            className="input-like"
            placeholder="Search description"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          {/* Item 5: Date Range Group */}
          <div className="filter-group-date">
            <input
              className="input-like"
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
            <span className="filters-sep">to</span>
            <input
              className="input-like"
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>

          {/* Item 6: Controls Group */}
          <div className="filter-group-controls">
            <select
              className="select-like"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              className="select-like"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          </div>

          {/* Item 7: Reset row */}
          <div className="filter-reset-row">
            <button
              className="tab"
              type="button"
              onClick={() => { clearFilters(); setPage(1); }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <TransactionsTable
          rows={rows}
          accountsById={accountsById}
          onEdit={onEditRow}
          onDelete={onDelete}
        />

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-left">
            {start}–{end} of {total}
          </div>
          <div className="pagination-right">
            <button
              className="tab"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="tab"
              disabled={end >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AddTransactionForm
        open={showAdd}
        onCancel={() => {
          setShowAdd(false);
          setEditingRow(null);
        }}
        onSubmit={onSave}
        accounts={accounts}
        // when editingRow is non-null, form can use it to prefill fields
        initialValues={editingRow}
      />
    </div>
  );
}
