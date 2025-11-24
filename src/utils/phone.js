/* eslint-disable */
// /src/utils/phone.js
export function normalizeKR(input) {
    if (!input) return "";
    const only = String(input).replace(/[^\d]/g, "");
    // 010xxxxxxxx → +8210xxxxxxxx
    if (only.startsWith("0")) return "+82" + only.slice(1);
    if (only.startsWith("82")) return "+" + only;
    if (only.startsWith("+82")) return only;
    // 그 외: 그냥 +82 붙여서 보정 시도
    return "+82" + only.replace(/^0/, "");
}

export function isValidKR(phoneE164) {
    return /^\+8210\d{8}$/.test(phoneE164); // +8210XXXXXXXX
}
