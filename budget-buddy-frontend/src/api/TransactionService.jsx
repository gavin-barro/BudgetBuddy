// src/api/TransactionService.jsx

import apiClient from './apiClient';

// -------------------- Helpers: Normalization --------------------

// Backend -> Frontend
// - Handles nested `account` and `user` objects.
// - Converts enum type ("INCOME"/"EXPENSE") to lowercase ("income"/"expense").
// - Ensures expenses have NEGATIVE amounts in the UI.
// - Normalizes date from "2025-11-01T00:00:00" → "2025-11-01".
function normalizeFromApi(txn) {
  if (!txn) return null;

  const account = txn.account || {};
  const user = txn.user || {};

  const rawAmount = Number(txn.amount ?? 0);

  // Backend enum is likely "INCOME" / "EXPENSE"
  const rawType = String(txn.type || 'EXPENSE').toUpperCase();
  const type = rawType === 'INCOME' ? 'income' : 'expense';

  // Make amount negative for expenses, positive for income
  const amount =
    rawType === 'EXPENSE' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  const category = txn.category || 'Other';
  const description = txn.description || '';

  // Normalize date to "YYYY-MM-DD"
  const rawDate =
    txn.date ||
    txn.transactionDate ||
    txn.transaction_date ||
    new Date().toISOString();
  const date = String(rawDate).slice(0, 10); // YYYY-MM-DD

  const createdAt = txn.createdAt || null;

  // Try to resolve account id from multiple possible shapes
  const accountId =
    txn.accountId ??
    txn.account_id ??
    account.id ??
    '';

  return {
    // Core fields your UI likely uses
    id: txn.id,
    account_id: String(accountId), // keep as string for selects
    amount,
    type, // "income" | "expense"
    category,
    date,
    description,

    // Extra account info (nice for display)
    accountName: account.name ?? null,
    accountType: account.type ?? null,
    accountBalance: account.balance ?? null,
    accountCreatedAt: account.createdAt ?? null,

    // Extra user info (if needed)
    userId: user.id ?? null,
    userEmail: user.email ?? null,
    userFirstName: user.firstName ?? null,
    userLastName: user.lastName ?? null,

    createdAt,
    _raw: txn, // raw backend object, in case you ever need it
  };
}

// Frontend -> Backend
// - Always sends a POSITIVE amount.
// - Sends enum type as "INCOME"/"EXPENSE".
// - Sends `accountId` (not `account_id`).
// - Uses date as "YYYY-MM-DD" (backend can convert to LocalDateTime).
function toApiPayload(draftOrPatch) {
  if (!draftOrPatch) return {};

  const {
    id,
    account_id,
    accountId,
    account, // full account object if provided
    amount,
    type,
    category,
    date,
    description,
    ...rest
  } = draftOrPatch;

  // Resolve which account id to send
  const resolvedAccountId =
    accountId ??
    account_id ??
    (account && account.id) ??
    undefined;

  // Always send a POSITIVE amount; backend + "type" decide direction.
  const positiveAmount = Math.abs(Number(amount ?? 0));


  // Date: UI usually passes "YYYY-MM-DD"; backend can turn it into LocalDateTime.
  const normalizedDate = date || undefined;

  return {
    id,
    accountId: resolvedAccountId,
    amount: positiveAmount,
    type: type,
    category,
    date: normalizedDate,
    description,
    ...rest,
  };
}

// Handles different list payload shapes:
//  - [ ... ] plain array
//  - { content: [...], totalElements, number, size, ... }  (Spring Page)
//  - { transactions: [...] }
function normalizeListPayload(data) {
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
      total:
        typeof data.totalElements === 'number'
          ? data.totalElements
          : data.content.length,
      pageNumber:
        typeof data.number === 'number' ? data.number : 0,
      pageSize:
        typeof data.size === 'number'
          ? data.size
          : data.content.length,
    };
  }

  // Alternative shape: { transactions: [...] }
  if (Array.isArray(data.transactions)) {
    return {
      items: data.transactions,
      total: data.transactions.length,
    };
  }

  // Fallback
  return { items: [], total: 0 };
}

// -------------------- Main Service --------------------

const TransactionService = {
  // No-op here; keeping for compatibility if you were seeding local data before
  seedIfEmpty() {},

  // GET /api/transactions/{id}
  async get(id) {
    const { data } = await apiClient.get(
      `/api/transactions/${encodeURIComponent(id)}`
    );
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  /**
   * GET /api/transactions
   *
   * Sends:
   *   page (0-based), size, sort=field,dir
   *   accountId, category, type, dateFrom, dateTo, search (if provided)
   *
   * Expects backend to return a Spring Page<TransactionEntity> like:
   * {
   *   content: [ { id, account: {...}, user: {...}, ... } ],
   *   totalElements, totalPages, number, size, ...
   * }
   */
  async list({
    filters = {},
    sort = 'date:desc', // "field:direction"
    page = 1,           // 1-based in the UI
    pageSize = 10,
  } = {}) {
    const params = {};

    // Pagination: Spring Pageable is 0-based
    params.page = Math.max(page - 1, 0);
    params.size = pageSize;

    // Sort: "date:desc" -> "date,desc"
    if (sort) {
      const [field, dir] = String(sort).split(':');
      const direction =
        dir && dir.toLowerCase() === 'asc' ? 'asc' : 'desc';
      params.sort = `${field},${direction}`;
    }

    // Filters (these should align with your TransactionController @RequestParam)
    const {
      accountId,
      category,
      type,
      dateFrom,
      dateTo,
      search,
    } = filters || {};

    if (accountId) params.accountId = accountId;
    if (category && category !== 'All') params.category = category;
    if (type && type !== 'All') {
      params.type = String(type).toUpperCase(); // backend enum
    }
    if (dateFrom) params.dateFrom = dateFrom; // "YYYY-MM-DD"
    if (dateTo) params.dateTo = dateTo;       // "YYYY-MM-DD"
    if (search) params.search = search;

    const { data } = await apiClient.get('/api/transactions', {
      params,
    });

    const {
      items,
      total,
      pageNumber,
      pageSize: backendSize,
    } = normalizeListPayload(data);

    const rows = Array.isArray(items)
      ? items.map(normalizeFromApi).filter(Boolean)
      : [];

    const effectivePage =
      typeof pageNumber === 'number' ? pageNumber + 1 : page;
    const effectivePageSize =
      typeof backendSize === 'number' ? backendSize : pageSize;

    return {
      rows,          // normalized, with negative expenses
      total,         // total number of records (for pagination)
      page: effectivePage,      // still 1-based for UI
      pageSize: effectivePageSize,
    };
  },

  // POST /api/transactions
  async create(txnDraft) {
    const payload = toApiPayload(txnDraft);
    const { data } = await apiClient.post(
      '/api/transactions',
      payload
    );
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  // PUT /api/transactions/{id}
  async update(id, patch) {
    const payload = toApiPayload({ ...patch, id });
    const { data } = await apiClient.put(
      `/api/transactions/${encodeURIComponent(id)}`,
      payload
    );
    const txn = data?.transaction ?? data;
    return normalizeFromApi(txn);
  },

  // DELETE /api/transactions/{id}
  async remove(id) {
    await apiClient.delete(
      `/api/transactions/${encodeURIComponent(id)}`
    );
    return { ok: true };
  },
};

export default TransactionService;
