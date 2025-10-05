const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('bb_users')) || []; }
    catch { return []; }
};
  
const saveUsers = (users) => {
    localStorage.setItem('bb_users', JSON.stringify(users));
};

// --- API Service Functions ---

/**
 * Simulates a login API call.
 * @param {string} identifier The user's username OR email.
 * @param {string} password The user's password.
 * @returns {Promise<object>} A promise that resolves with the user object.
 */
export const login = async (identifier, password) => {
    console.log('[AuthService] Attempting login with identifier...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const identifierLower = identifier.toLowerCase();
            
            // Find user by either username or email
            const found = users.find(u => 
                u.username.toLowerCase() === identifierLower || 
                (u.email && u.email.toLowerCase() === identifierLower)
            );

            if (!found || found.password !== password) {
                return reject(new Error('Invalid credentials.'));
            }

            const userObj = { username: found.username, email: found.email || '' };
            localStorage.setItem('bb_current_user', JSON.stringify(userObj));
            console.log('[AuthService] Login successful.');
            resolve(userObj);
        }, 1000); 
    });
};

/**
 * Simulates a register API call.
 * @param {object} userData The new user's data (username, email, password).
 * @returns {Promise<object>} A promise that resolves with the new user object.
 */
export const register = async ({ username, email, password }) => {
    console.log('[AuthService] Attempting registration...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const existing = users.some(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (existing) {
                return reject(new Error('Username already exists.'));
            }

            users.push({ username, email, password });
            saveUsers(users);

            const userObj = { username, email };
            console.log('[AuthService] Registration successful.');
            resolve(userObj);
        }, 1000);
    });
};