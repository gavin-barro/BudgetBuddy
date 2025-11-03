// src/api/AccountManagementService.jsx
// ===============================================
// API-backed service that talks to AccountController
// ===============================================
import apiClient from './apiClient';

const ACCOUNTS_BASE = "/api/accounts";
const ACCOUNT_ITEM = (id) => `${ACCOUNTS_BASE}/${encodeURIComponent(id)}`;

// Normalize list payloads (array OR { accounts: [...] })
const normalizeList = (data) => (Array.isArray(data) ? data : (data?.accounts ?? []));

// Normalize a single account’s id to a consistent key the UI expects
const coerceId = (a) => {
  if (!a) return a;
  const id = a.id ?? a.accountId ?? a._id ?? a.uuid ?? null;
  return id ? { ...a, id } : a;
};

// Canonicalize account types to what the BE expects.
// Map display labels → canonical lowercase.
const normalizeType = (t) => {
  if (!t) return undefined;
  const s = String(t).trim().toLowerCase();
  if (s === 'checking') return 'checking';
  if (s === 'savings') return 'savings';
  if (s === 'credit' || s === 'credit card') return 'credit';
  if (s === 'investment') return 'other'; // adjust if BE supports 'investment'
  if (s === 'loan') return 'other';
  return 'other';
};

// Convert to number but allow 0; return null if truly not a number.
const toNumberOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const AccountManagementService = {
  // GET /api/accounts  -> AccountView[]
  async list() {
    const { data } = await apiClient.get(ACCOUNTS_BASE);
    const arr = normalizeList(data).map(coerceId);
    return arr;
  },

  // POST /api/accounts { name, type, balance } -> AccountView
  async create(draft) {
    const payload = {
      name: (draft?.name ?? "Untitled").trim(),
      type: normalizeType(draft?.type) ?? 'checking',
      balance: toNumberOrNull(draft?.balance) ?? 0,
    };
    const { data } = await apiClient.post(ACCOUNTS_BASE, payload);
    const created = coerceId(data?.account ?? data);
    const accounts = await this.list();
    return { account: created, accounts };
  },

  // PUT /api/accounts/:id { name?, type?, balance? } -> AccountView
  async update(id, patch) {
    const payload = {};
    if (patch?.name != null) payload.name = String(patch.name).trim();
    if (patch?.type != null) payload.type = normalizeType(patch.type);

    // IMPORTANT: allow 0
    if (patch?.balance !== undefined) {
      const num = toNumberOrNull(patch.balance);
      if (num !== null) payload.balance = num;
    }

    const { data } = await apiClient.put(ACCOUNT_ITEM(id), payload);
    const updated = coerceId(data?.account ?? data);
    const accounts = await this.list();
    return { account: updated, accounts };
  },

  // DELETE /api/accounts/:id
  async remove(id) {
    await apiClient.delete(ACCOUNT_ITEM(id));
    const accounts = await this.list();
    return { accounts, deletedId: id };
  },
};

export default AccountManagementService;
