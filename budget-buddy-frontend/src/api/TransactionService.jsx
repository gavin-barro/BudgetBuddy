// Lightweight mock API using localStorage

const LS_KEY = 'bb.transactions.v1';

function readAll() {
    try {
        const raw = localStrorage.getItem(LS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function writeAll(rows) {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

function uid() {
    return 'txn_' + Math.random().toString(36).slice(2, 10);
}

function normalize(txn) {
    // Ensure types are consistent
    return {
        id: txn.id || uid(),
        account_id: String(txn.account_id || ''),
        user_id: txn.user_id || 'local-user',
        amount: Number(txn.amount || 0),
        type: (txn.type || 'expense').toLowerCase(), // 'income' | 'expense'
        category: txn.category || 'Uncategorized',
        date: txn.date || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        description: txn.description || '',
        created_at: txn.created_at || new Date().toISOString(),
    };
}

function applyFilters(rows, { accountId, category, type, dateFrom, dateTo, search }) {
    return rows.filter(r => {
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
}

function applySort(rows, sortKey) {
    const [key, dir] = (sortKey || 'date:desc').split(':');
    const sign = dir === 'asc' ? 1 : -1;
    const cmp = (a, b) => {
        const va = a[key];
        const vb = b[key];
        if (key === 'amount') return sign * (va - vb);
        return sign * String(va).localeCompare(String(vb));
    };
    return [...rows].sort(cmp);
}

const TransactionService = {
    seedIfEmpty() {
        const rows = readAll();
        if (rows.length) return;
        writeAll([
            {
                id: uid(), account_id: 'acc_1', user_id: 'local-user', amount: -82.45, type: 'expense',
                category: 'Food & Dining', date: '2025-10-18', description: 'Groceries', created_at: new Date().toISOString(),
            },
            {
                id: uid(), account_id: 'acc_1', user_id: 'local-user', amount: 1850.0, type: 'income',
                category: 'Income', date: '2025-10-15', description: 'Paycheck', created_at: new Date().toISOString(),
            },
            {
                id: uid(), account_id: 'acc_2', user_id: 'local-user', amount: -44.1, type: 'expense',
                category: 'Transportation', date: '2025-10-12', description: 'Gas', created_at: new Date().toISOString(),
            },
        ]);
    },
    async list({ filters = {}, sort = 'date:desc', page = 1, pageSize = 10 } = {}) {
        const rows = readAll();
        const filtered = applyFilters(rows, filters);
        const sorted = applySort(filtered, sort);
        const total = sorted.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageRows = sorted.slice(start, end);
        return { rows: pageRows, total, page, pageSize };
    },
    
    async create(txnDraft) {
        const rows = readAll();
        const row = normalize(txnDraft);
        rows.push(row);
        writeAll(rows);
        return row;
    },

    async update(id, patch) {
        const rows = readAll();
        const idx = rows.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Transaction not found');
        rows[idx] = normalize({ ...rows[idx], ...patch, id });
        writeAll(rows);
        return rows[idx];
    },

    async remove(id) {
        const rows = readAll();
        const next = rows.filter(r => r.id !== id);
        writeAll(next);
        return { ok: true };
    },
};

export default TransactionService;
