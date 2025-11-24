/* eslint-disable */
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getAuthConfig, emitAuthEvent } from "./authInit";
import { ensureFirebase } from "services/firebase";
import usersService from "services/usersService";

/* -----------------------------------------------------------
 * 환경변수 필수 확인
 * ----------------------------------------------------------- */
const FN_BASE = process.env.REACT_APP_FN_BASE;
if (!FN_BASE) {
    throw new Error("[AuthKit] REACT_APP_FN_BASE 환경변수가 설정되어야 합니다.");
}

/* -----------------------------------------------------------
 * 공통: Functions로 code 교환 → { token } 수신
 * ----------------------------------------------------------- */
async function exchangeCode(endpoint, code, state, redirectUri) {
    const body = { code, state };
    if (redirectUri) body.redirect_uri = redirectUri;

    const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    if (!r.ok) {
        const text = await r.text();
        throw new Error(`exchange failed: ${r.status} ${text}`);
    }

    const json = await r.json().catch(() => null);
    if (!json || !json.token) throw new Error("No token returned from exchangeCode");
    return json; // { token }
}

/* -----------------------------------------------------------
 * 커스텀 토큰 로그인 (공통)
 * ----------------------------------------------------------- */
export async function signInWithCustomTokenWeb(token, provider) {
    ensureFirebase();
    const auth = getAuth();
    const res = await signInWithCustomToken(auth, token);

    const p = String(provider || "").toLowerCase();
    const method =
        p === "kakao" ? "kakao" :
            p === "naver" ? "naver" :
                p === "google" ? "google" : "sso";

    await usersService.ensureUserDoc(res.user.uid, {
        provider: method,
        email: res.user.email || null,
        loginMethodToSet: method,
    });

    emitAuthEvent("auth_success", { provider: method, uid: res.user.uid });
    return res.user;
}

/* -----------------------------------------------------------
 * Kakao
 * ----------------------------------------------------------- */
export function buildKakaoAuthorizeUrl(state = crypto.randomUUID()) {
    const q = new URLSearchParams({
        client_id: process.env.REACT_APP_KAKAO_CLIENT_ID,
        redirect_uri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
        response_type: "code",
        state,
    });
    return `https://kauth.kakao.com/oauth/authorize?${q.toString()}`;
}

export async function exchangeKakaoCode(code, state) {
    const { endpoints } = getAuthConfig();
    const endpoint = endpoints?.kakao || `${FN_BASE}/kakaoAuth`;
    const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    const { token } = await exchangeCode(endpoint, code, state, redirectUri);
    return token;
}

/* -----------------------------------------------------------
 * Naver
 * ----------------------------------------------------------- */
export function buildNaverAuthorizeUrl(state = crypto.randomUUID()) {
    const q = new URLSearchParams({
        client_id: process.env.REACT_APP_NAVER_CLIENT_ID,
        redirect_uri: process.env.REACT_APP_NAVER_REDIRECT_URI,
        response_type: "code",
        state,
    });


    console.log("[ENV] NAVER_EP =", process.env.REACT_APP_AUTH_ENDPOINT_NAVER);
    
    return `https://nid.naver.com/oauth2.0/authorize?${q.toString()}`;
}

export async function exchangeNaverCode(code, state) {
    const { endpoints } = getAuthConfig();
    const endpoint = endpoints?.naver || `${FN_BASE}/naverAuth`;
    const redirectUri = process.env.REACT_APP_NAVER_REDIRECT_URI;
    const { token } = await exchangeCode(endpoint, code, state, redirectUri);
    return token;
}
