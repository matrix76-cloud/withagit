/* eslint-disable */
// src/services/auth/providerLinkStore.js

const KEY = "providers_link_v1"; // { kakao: { [providerId]: { phoneE164, ts } } }

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch { }
}

export function linkSave(provider, providerId, phoneE164) {
    const all = load();
    all[provider] = all[provider] || {};
    all[provider][String(providerId)] = { phoneE164, ts: Date.now() };
    save(all);
}

export function linkGet(provider, providerId, { maxAgeMs = 1000 * 60 * 60 * 24 * 180 } = {}) {
    const all = load();
    const m = all?.[provider]?.[String(providerId)];
    if (!m) return null;
    if (maxAgeMs && Date.now() - (m.ts || 0) > maxAgeMs) return null; // 만료
    return m.phoneE164 || null;
}

export function linkRemove(provider, providerId) {
    const all = load();
    if (all?.[provider]?.[String(providerId)]) {
        delete all[provider][String(providerId)];
        save(all);
    }
}
