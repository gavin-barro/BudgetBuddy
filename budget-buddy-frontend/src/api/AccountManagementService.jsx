// src/api/AccountManagementService.jsx
// LocalStorage-backed mock service for Accounts CRUD.
// Each user's accounts are stored under bb_accounts:<userKey>

const STORAGE_PREFIX = 'bb_accounts:';
const LATENCY_MS = 200; // tiny artificial delay to mimic a network call

// Derive a stable user key (email preferred; fall back to id)
const userKeyOf = (user) => {
  if (!user) throw new Error('No user provided');
  return String(user.email || user.id || user.userId || 'anon').toLowerCase();
};

// LocalStorage helpers
const load = (user) => {
  const raw = localStorage.getItem(STORAGE_PREFIX + userKeyOf(user));
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (user, accounts) => {
  localStorage.setItem(
    STORAGE_PREFIX + userKeyOf(user),
    JSON.stringify(accounts)
  );
};

// Small async wrapper with latency
const respond = (payload, ok = true) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (ok ? resolve(payload) : reject(payload)), LATENCY_MS)
  );

// ID generator (e.g., acc_0003)
const nextId = (accounts) => {
  const n = (accounts.length + 1).toString().padStart(4, '0');
  return `acc_${n}`;
};

/**
 * Public API
 */
const AccountManagementService = {
  // GET /accounts
  async list(user) {
    const accounts = load(user);
    return respond(accounts);
  },

  // POST /accounts
  async create(user, draft) {
    const accounts = load(user);
    const newAccount = {
      id: nextId(accounts),
      name: (draft?.name || 'Untitled').trim(),
      type: (draft?.type || 'Checking').trim(),
      balance: Number(draft?.balance) || 0,
      _owner: userKeyOf(user), // ownership marker for clarity/debug
    };
    const updated = [...accounts, newAccount];
    save(user, updated);
    return respond({ account: newAccount, accounts: updated });
  },

  // PUT /accounts/:id
  async update(user, accountId, patch) {
    const accounts = load(user);
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx === -1) {
      return respond({ error: 'Not found or not owned by user' }, false);
    }
    const updatedAccount = {
      ...accounts[idx],
      ...(patch?.name != null ? { name: String(patch.name) } : {}),
      ...(patch?.type != null ? { type: String(patch.type) } : {}),
      ...(patch?.balance != null ? { balance: Number(patch.balance) || 0 } : {}),
    };
    const updated = [...accounts];
    updated[idx] = updatedAccount;
    save(user, updated);
    return respond({ account: updatedAccount, accounts: updated });
  },

  // DELETE /accounts/:id
  async remove(user, accountId) {
    const accounts = load(user);
    const exists = accounts.some((a) => a.id === accountId);
    if (!exists) {
      return respond({ error: 'Not found or not owned by user' }, false);
    }
    const updated = accounts.filter((a) => a.id !== accountId);
    save(user, updated);
    return respond({ accounts: updated, deletedId: accountId });
  },

  // Utility: seed local store from an in-memory user object, once
  seedFromUser(user) {
    if (!user) return;
    const current = load(user);
    if (current.length) return; // already seeded
    if (Array.isArray(user.accounts) && user.accounts.length) {
      // normalize incoming accounts (ensure ids/types/balance formats)
      const seeded = user.accounts.map((a, i) => ({
        id: a.id || `acc_${(i + 1).toString().padStart(4, '0')}`,
        name: String(a.name || 'Untitled'),
        type: String(a.type || 'Checking'),
        balance: Number(a.balance) || 0,
        _owner: userKeyOf(user),
      }));
      save(user, seeded);
    }
  },
};

export default AccountManagementService;
