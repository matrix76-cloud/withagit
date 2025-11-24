/* eslint-disable */
// src/services/auth/session.js
const KEY = "auth_dev_session";

export function setSessionPhone(phoneE164) {
    const payload = { phoneE164, isLoggedIn: true, at: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch { }
    try { window.dispatchEvent(new CustomEvent("auth:session", { detail: payload })); } catch { }
    return payload;
}

export function clearSession() {
    try { localStorage.removeItem(KEY); } catch { }
    try { window.dispatchEvent(new CustomEvent("auth:logout")); } catch { }
}

export function getSession() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
