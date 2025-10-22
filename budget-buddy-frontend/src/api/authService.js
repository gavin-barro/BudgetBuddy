// src/api/authService.js
import api from "./apiClient";

// --- helpers ---
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  localStorage.setItem("bb_token", token);
  localStorage.setItem("bb_current_user", JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem("bb_current_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem("bb_token");
  localStorage.removeItem("bb_current_user");
}

// --- API calls ---
export async function register({ firstName, lastName, email, password }) {
  try {
    await api.post("/api/auth/register", { firstName, lastName, email, password });
    // Backend returns a message; we don't persist anything on register
  } catch (err) {
    const msg = err?.response?.data || "Registration failed.";
    throw new Error(typeof msg === "string" ? msg : "Registration failed.");
  }
}

export async function login(email, password) {
  try {
    const { data } = await api.post("/api/auth/login", { email, password });
    const token = data?.token;
    if (!token) throw new Error("No token returned from server.");

    // Build a minimal user from the token (subject/email)
    const decoded = decodeJwt(token);
    const subjectEmail = decoded?.sub || email;

    // You can enrich this later after adding a /me endpoint
    const user = { email: subjectEmail };

    persistSession(token, user);
    return user;
  } catch (err) {
    const msg = err?.response?.data || "Invalid email or password.";
    throw new Error(typeof msg === "string" ? msg : "Login failed.");
  }
}

export async function logout() {
  // backend is stateless; just clear locally
  clearSession();
  try {
    // Optional: let backend log it for analytics
    await api.post("/api/auth/logout");
  } catch {
    // ignore network errors here
  }
}
