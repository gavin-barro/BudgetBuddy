// src/api/TransactionService.jsx

import apiClient from './apiClient';

const applyFilters = (rows, { accountId, category, type, dateFrom, dateTo, search }) => {
  return rows.filter((r) => {
    if (accountId && String(r.account_id) !== String(accountId)) return false;
    if (category && category !== 'All' && r.category !== category) return false;
    if (type && type !== 'All' && r.type !== type.toLowerCase()) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.description} ${r.category} ${r.type}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};

const applySort = (rows, sortKey) => {
  const [key, dir] = (sortKey || 'date:desc').split(':');
  const sign = dir === 'asc' ? 1 : -1;
  const cmp = (a, b) => {
    const va = a[key];
    const vb = b[key];
    if (key === 'amount') return sign * (Number(va) - Number(vb));
    return sign * String(va).localeCompare(String(vb));
  };
  return [...rows].sort(cmp);
};

// Map from backend transaction -> frontend row shape
function normalizeFromApi(txn) {
  if (!txn) return null;
  // Adjust these field names if your backend uses different ones
  const id = txn.id;
  const accountId = txn.accountId ?? txn.account_id;
  const amount = Number(txn.amount ?? 0);
  // Backend likely uses enum "INCOME"/"EXPENSE"
  const type = String(txn.type || 'expense').toLowerCase();
  const category = txn.category || 'Other';
  const description = txn.description || '';
  // assume ISO date / datetime; keep just YYYY-MM-DD for the UI
  const rawDate = txn.date || txn.transactionDate || new Date().toISOString();
  const date = rawDate.slice(0, 10);

  return {
    id,
    account_id: String(accountId ?? ''),
    amount,
    type,
    category,
    date,
    description,
  };
}

// Map from frontend draft/patch -> backend payload
function toApiPayload(draftOrPatch) {
  if (!draftOrPatch) return {};
  const {
    id,
    account_id,
    accountId,
    amount,
    type,
    category,
    date,
    description,
    ...rest
  } = draftOrPatch;

  return {
    id,
    accountId: accountId ?? account_id,                 // backend expects accountId
    amount,
    type: type ? String(type).toUpperCase() : undefined, // "INCOME" / "EXPENSE"
    category,
    date,                                                // YYYY-MM-DD (backend can parse or treat as LocalDate)
    description,
    ...rest,
  };
}

const TransactionService = {
  // Keep this so TransactionsPage can still call it, but do nothing now.
  seedIfEmpty() {
    // no-op: data comes from backend now
  },

  // Fetch all transactions from backend, then filter/sort/paginate on the client
  async list({ filters = {}, sort = 'date:desc', page = 1, pageSize = 10 } = {}) {
    // Adjust URL if your controller maps differently
    const data = await apiClient.get('/api/transactions');
    const all = Array.isArray(data) ? data.map(normalizeFromApi).filter(Boolean) : [];

    const filtered = applyFilters(all, filters);
    const sorted = applySort(filtered, sort);

    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRows = sorted.slice(start, end);

    return { rows: pageRows, total, page, pageSize };
  },

  async create(txnDraft) {
    const payload = toApiPayload(txnDraft);
    const created = await apiClient.post('/api/transactions', payload);
    return normalizeFromApi(created);
  },

  async update(id, patch) {
    const payload = toApiPayload({ ...patch, id });
    const updated = await apiClient.put(`/api/transactions/${id}`, payload);
    return normalizeFromApi(updated);
  },

  async remove(id) {
    await apiClient.delete(`/api/transactions/${id}`);
    return { ok: true };
  },
};

export default TransactionService;
