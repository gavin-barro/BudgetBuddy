// --- MOCK BACKEND HELPERS (similar to authService.js) ---

const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('bb_users')) || []; }
    catch { return []; }
};
  
const saveUsers = (users) => {
    localStorage.setItem('bb_users', JSON.stringify(users));
};

const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('bb_current_user')); }
    catch { return null; }
}

// --- API Service Functions ---

/**
 * Simulates updating the user's username.
 * @param {string} newUsername The new username for the current user.
 * @returns {Promise<object>} A promise that resolves with the updated user object.
 */
export const updateUsername = async (newUsername) => {
    console.log('[ProfileService] Attempting to update username...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return reject(new Error("No user is logged in."));

            let users = getUsers();
            const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());

            if (userIndex === -1) return reject(new Error("User not found in database."));

            // Check if new username is already taken by someone else
            const isTaken = users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.username.toLowerCase() !== currentUser.username.toLowerCase());
            if (isTaken) return reject(new Error("Username is already taken."));

            // Update user and save
            users[userIndex].username = newUsername;
            saveUsers(users);

            // Update the current session user
            const updatedUser = { ...currentUser, username: newUsername };
            localStorage.setItem('bb_current_user', JSON.stringify(updatedUser));
            
            console.log('[ProfileService] Username updated successfully.');
            resolve(updatedUser);
        }, 500); // Simulate network delay
    });
};

/**
 * Simulates updating the user's email.
 * @param {string} newEmail The new email for the current user.
 * @returns {Promise<object>} A promise that resolves with the updated user object.
 */
export const updateEmail = async (newEmail) => {
    console.log('[ProfileService] Attempting to update email...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return reject(new Error("No user is logged in."));

            let users = getUsers();
            const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());

            if (userIndex === -1) return reject(new Error("User not found in database."));

            users[userIndex].email = newEmail;
            saveUsers(users);
            
            const updatedUser = { ...currentUser, email: newEmail };
            localStorage.setItem('bb_current_user', JSON.stringify(updatedUser));
            
            console.log('[ProfileService] Email updated successfully.');
            resolve(updatedUser);
        }, 500);
    });
};

/**
 * Simulates changing the user's password.
 * @param {string} currentPassword The user's current password for verification.
 * @param {string} newPassword The new password.
 * @returns {Promise<{success: boolean}>} A promise that resolves with a success message.
 */
export const updatePassword = async (currentPassword, newPassword) => {
    console.log('[ProfileService] Attempting to change password...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return reject(new Error("No user is logged in."));

            let users = getUsers();
            const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
            
            if (userIndex === -1) return reject(new Error("User not found in database."));

            // Verify current password
            if (users[userIndex].password !== currentPassword) {
                return reject(new Error("Incorrect current password."));
            }

            users[userIndex].password = newPassword;
            saveUsers(users);

            console.log('[ProfileService] Password changed successfully.');
            resolve({ success: true, message: "Password updated successfully!" });
        }, 500);
    });
};