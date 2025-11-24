/* eslint-disable */
import { getAuth, GoogleAuthProvider, signInWithPopup, linkWithPopup, getRedirectResult } from "firebase/auth";
import { ensureFirebase } from "services/firebase";
import usersService from "services/usersService";

/**
 * 내부 공통 유틸
 */
async function ensureGoogleUserDoc(user) {
    if (!user) throw new Error("[googleWeb] invalid user");
    const { isNew } = await usersService.ensureUserDoc(user.uid, {
        provider: "google",
        email: user.email || null,
        loginMethodToSet: "google",
    });
    return { user, isNew };
}

/**
 * Google 로그인 (Popup)
 * 반환: { user, isNew }
 */
export async function signInWithGoogle() {
    try {
        ensureFirebase();
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        const cred = await signInWithPopup(auth, provider);
        return await ensureGoogleUserDoc(cred.user);
    } catch (e) {
        console.error("[AuthKit][signInWithGoogle] error:", e);
        throw e;
    }
}

/**
 * Google Redirect 플로우 결과 처리
 * - signInWithRedirect 이후 콜백 페이지에서 호출
 * - 반환: { user, isNew } | null
 */
export async function handleRedirectResultGoogle() {
    ensureFirebase();
    const auth = getAuth();
    const res = await getRedirectResult(auth);
    if (!res?.user) return null;
    return await ensureGoogleUserDoc(res.user);
}

/**
 * 현재 로그인된 계정에 Google 연결(link)
 * 반환: { user }
 */
export async function linkGoogleToCurrent() {
    ensureFirebase();
    const auth = getAuth();
    if (!auth.currentUser) throw new Error("NO_CURRENT_USER");

    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        const cred = await linkWithPopup(auth.currentUser, provider);
        await usersService.ensureUserDoc(cred.user.uid, {
            provider: "google",
            email: cred.user.email || null,
            loginMethodToSet: "google",
        });
        return { user: cred.user };
    } catch (e) {
        console.error("[AuthKit][linkGoogleToCurrent] error:", e);
        throw e;
    }
}

/* ── 호환 별칭(기존 코드 대비) ──────────────────────────── */
export const login = signInWithGoogle;
export const start = signInWithGoogle;
export const link = linkGoogleToCurrent;
export const signInGoogle = signInWithGoogle;

export default {
    signInWithGoogle,
    signInGoogle,
    handleRedirectResultGoogle,
    linkGoogleToCurrent,
    login,
    start,
    link,
};
