// src/api/TransactionService.jsx

import apiClient from './apiClient';

// ----- CLIENT-SIDE FILTERS -----
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

// ----- CLIENT-SIDE SORT -----
const applySort = (rows, sortKey) => {
  const [key, dir] = (sortKey || 'date:desc').split(':');
  const sign = dir === 'asc' ? 1 : -1;

  const cmp = (a, b) => {
    const va = a[key];
    const vb = b[key];

    if (key === 'amount') {
      return sign * (Number(va) - Number(vb));
    }

    return sign * String(va).localeCompare(String(vb));
  };

  return [...rows].sort(cmp);
};

// ----- NORMALIZATION: backend -> frontend row -----
function normalizeFromApi(txn) {
  if (!txn) return null;

  const id = txn.id;
  const accountId = txn.accountId ?? txn.account_id;
  const amount = Number(txn.amount ?? 0);
  const type = String(txn.type || 'expense').toLowerCase(); // "income" / "expense"
  const category = txn.category || 'Other';
  const description = txn.description || '';
  const rawDate = txn.date || txn.transactionDate || new Date().toISOString();
  const date = rawDate.slice(0, 10); // YYYY-MM-DD

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

// ----- NORMALIZATION: frontend draft/patch -> backend payload -----
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
    accountId: accountId ?? account_id, // backend expects accountId
    amount,
    // send lowercase or adjust to match your enum, ex: String(type).toUpperCase()
    type: type ? String(type).toLowerCase() : undefined,
    category,
    date,
    description,
    ...rest,
  };
}

// ----- HANDLE DIFFERENT LIST RESPONSE SHAPES -----
// Supports:
//   - array of txns
//   - { content: [...], totalElements: N }  (Spring Page)
//   - { transactions: [...] }              (alt API shape)
const normalizeListPayload = (data) => {
  if (!data) {
    return { items: [], total: 0 };
  }

  // Raw array
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }

  // Spring Page<TransactionEntity>
  if (Array.isArray(data.content)) {
    return {
      items: data.content,
      total: typeof data.totalElements === 'number'
        ? data.totalElements
        : data.content.length,
    };
  }

  // { transactions: [...] }
  if (Array.isArray(data.transactions)) {
    return { items: data.transactions, total: data.transactions.length };
  }

  // Fallback
  return { items: [], total: 0 };
};

const TransactionService = {
  // No-op: data comes from backend now
  seedIfEmpty() {},

  // Fetch single transaction by id
  async get(id) {
    const { data } = await apiClient.get(`/api/transactions/${encodeURIComponent(id)}`);
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  // Fetch all transactions for the user, then filter/sort/paginate on client
  async list({
    filters = {},
    sort = 'date:desc',
    page = 1,
    pageSize = 10,
  } = {}) {
    // For now we just get the first backend page (or all if backend returns all),
    // and let the client handle filters + pagination.
    const { data } = await apiClient.get('/api/transactions');

    const { items } = normalizeListPayload(data);
    const all = Array.isArray(items)
      ? items.map(normalizeFromApi).filter(Boolean)
      : [];

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
    const { data } = await apiClient.post('/api/transactions', payload);
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  async update(id, patch) {
    const payload = toApiPayload({ ...patch, id });
    const { data } = await apiClient.put(`/api/transactions/${encodeURIComponent(id)}`, payload);
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  async remove(id) {
    await apiClient.delete(`/api/transactions/${encodeURIComponent(id)}`);
    return { ok: true };
  },
};

export default TransactionService;
