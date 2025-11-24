/* eslint-disable */
// /src/services/authService.js
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { normalizeKR, isValidKR } from "../utils/phone";
import { db } from "./api";

const LS_KEYS = {
    session: "withagit.session",
    members: "withagit.members",
};

// ---- localStorage helpers ----
function loadMembers() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.members) || "{}"); } catch { return {}; }
}
function saveMembers(m) {
    try { localStorage.setItem(LS_KEYS.members, JSON.stringify(m)); } catch { }
}
function now() { return Date.now(); }

// ---- Session: 익명 생성 or 이어쓰기 ----
export function ensureAnonymousSession() {
    let s;
    try { s = JSON.parse(localStorage.getItem(LS_KEYS.session) || "null"); } catch { }
    if (!s) {
        s = { type: "anon", at: now(), phoneE164: null, kakao: null };
        localStorage.setItem(LS_KEYS.session, JSON.stringify(s));
    }
    return s;
}

// ---- Session 저장/조회 ----
export function getSession() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.session) || "null"); } catch { return null; }
}
export function setSession(next) {
    localStorage.setItem(LS_KEYS.session, JSON.stringify(next));
    return next;
}
export function signOut() {
    // 익명 세션으로 되돌림(요구 사항: 계속 추가해도 OK)
    const anon = { type: "anon", at: now(), phoneE164: null, kakao: null };
    setSession(anon);
    return anon;
}

// ---- Members (SSOT = phoneE164 as ID) ----
export async function upsertMemberByPhone(phoneE164, payload = {}) {
    if (!phoneE164) throw new Error("phoneE164 required");
    const ref = doc(db, "members", phoneE164);
    await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
    }, { merge: true });
}


export function getMember(phoneE164) {
    const db = loadMembers();
    return db[normalizeKR(phoneE164)] || null;
}

// ---- Phone login (SMS 코드는 실제 서비스 대체) ----
export async function requestSmsCode(phoneInput) {
    const phoneE164 = normalizeKR(phoneInput);
    if (!isValidKR(phoneE164)) throw new Error("invalid_phone");
    // mock: 코드 생성/저장
    const code = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("sms.code:" + phoneE164, JSON.stringify({ code, exp: now() + 5 * 60 * 1000 }));
    return { ok: true, phoneE164, sent: true, testCode: code }; // dev 편의: testCode 반환
}
export async function verifySmsCode(phoneInput, codeInput) {
    const phoneE164 = normalizeKR(phoneInput);
    const raw = sessionStorage.getItem("sms.code:" + phoneE164);
    if (!raw) throw new Error("no_code");
    const { code, exp } = JSON.parse(raw);
    if (now() > exp) throw new Error("expired");
    if (String(code) !== String(codeInput)) throw new Error("wrong_code");

    const member = upsertMemberByPhone(phoneE164);
    // 세션 업그레이드
    return setSession({ type: "member", phoneE164, kakao: null, at: now() });
}

// ---- Kakao login (mock) ----
// 실제에선 window.open / redirect 콜백. 여기선 결과만 흉내.
export async function kakaoLoginMock({ phoneE164FromKakao = null } = {}) {
    const kakao = { id: "kakao_" + Math.random().toString(36).slice(2, 8), connectedAt: now() };
    const s = ensureAnonymousSession();
    let phoneE164 = phoneE164FromKakao ? normalizeKR(phoneE164FromKakao) : null;

    if (phoneE164 && isValidKR(phoneE164)) {
        // 카카오가 전화 제공 → 멤버 upsert + link
        const member = upsertMemberByPhone(phoneE164, { kakao });
        return setSession({ type: "member", phoneE164, kakao, at: now() });
    } else {
        // 카카오 OK, 전화 없음 → 세션에 kakao만 담고 전화 인증 필요
        return setSession({ ...s, kakao, at: now() });
    }
}
