// src/api/profileManagementService.js
import apiClient from './apiClient';

const BASE = '/api/profile';

export async function getProfile() {
  const { data } = await apiClient.get(BASE);
  // Expect: { firstName, lastName, email }
  return data;
}

export async function updateName(firstName, lastName) {
  if (!firstName || !lastName) throw new Error('First and last name are required.');
  // Controller: PUT /api/profile/name
  await apiClient.put(`${BASE}/name`, { firstName, lastName });
  // We *can* re-fetch here because principal doesn’t change on name updates:
  const fresh = await getProfile();
  return fresh;
}

export async function updateEmail(email) {
  if (!email) throw new Error('Email is required.');
  // Controller: PUT /api/profile/email
  try {
    await apiClient.put(`${BASE}/email`, { email });
  } catch (err) {
    // Surface 400 validation messages from server if present
    const msg =
      err?.response?.data && typeof err.response.data === 'string'
        ? err.response.data
        : err?.message || 'Unable to update email';
    throw new Error(msg);
  }

  // IMPORTANT: do NOT re-fetch immediately — principal still has the *old* email.
  // Instead, return the new email so the UI can update locally.
  return { ok: true, email };
}

export async function updatePassword(currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error('Both current and new password are required.');
  }

  try {
    // Controller: PUT /api/profile/password
    await apiClient.put(`${BASE}/password`, { currentPassword, newPassword });
    return { ok: true };
  } catch (err) {
    // If you’re hitting a 404, it’s usually the wrong path or a proxy rule.
    // Bubble the message so you can see it in the UI.
    const msg =
      err?.response?.data && typeof err.response.data === 'string'
        ? err.response.data
        : err?.message || 'Unable to change password';
    throw new Error(msg);
  }
}
