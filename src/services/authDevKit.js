/* eslint-disable */
// src/services/authDevKit.js
// ✅ 프로젝트 전용 DEV 어댑터 (UI에 코드 노출 없음)
// - send(): 세션ID+6자리 코드 생성 → sessionStorage 저장 (표시하지 않음)
// - verify(): 코드 일치 or 마스터 코드(999999) 허용 → localStorage 세션 저장

function randomSessionId() {
    return "sess_" + Math.random().toString(36).slice(2) + Date.now();
}
function randomCode6() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

const MASTER_DEV_CODE = "999999"; // ← DEV 마스터 코드(항상 통과)

const authDevKit = {
    phone: {
        async send({ phoneE164 }) {
            const sessionId = randomSessionId();
            const code = randomCode6();
            const key = `otp:${phoneE164}:${sessionId}`;
            sessionStorage.setItem(key, JSON.stringify({ phoneE164, code, issuedAt: Date.now() }));
            // UI에 표시하지 않음
            return { sessionId };
        },
        async verify({ sessionId, code, phoneE164 }) {
            // 마스터 코드 우선 통과
            if (code === MASTER_DEV_CODE) {
                localStorage.setItem("auth_dev_session", JSON.stringify({ isLoggedIn: true, phoneE164, at: Date.now() }));
                return { token: "dev_token", phoneE164 };
            }

            const key = `otp:${phoneE164}:${sessionId}`;
            const raw = sessionStorage.getItem(key);
            if (!raw) {
                const err = new Error("otp_session_not_found");
                err.code = "otp_session_not_found";
                throw err;
            }
            const saved = JSON.parse(raw);
            if (saved.code !== code) {
                const err = new Error("otp_mismatch");
                err.code = "otp_mismatch";
                throw err;
            }
            localStorage.setItem("auth_dev_session", JSON.stringify({ isLoggedIn: true, phoneE164, at: Date.now() }));
            sessionStorage.removeItem(key);
            return { token: "dev_token", phoneE164 };
        },
    },
    async ensureUserDoc({ phoneE164 }) {
        localStorage.setItem("auth_dev_user", JSON.stringify({ phoneE164 }));
        return { ok: true };
    },
    async bootstrapUserContext() {
        const raw = localStorage.getItem("auth_dev_session");
        if (!raw) return { isLoggedIn: false };
        try {
            const s = JSON.parse(raw);
            if (s?.isLoggedIn) {
                return { isLoggedIn: true, phoneE164: s.phoneE164, member: { id: s.phoneE164, status: "active" }, perms: {} };
            }
            return { isLoggedIn: false };
        } catch {
            return { isLoggedIn: false };
        }
    },
    async signOut() {
        localStorage.removeItem("auth_dev_session");
    },
};

export default authDevKit;
