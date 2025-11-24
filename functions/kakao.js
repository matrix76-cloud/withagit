/* eslint-disable */
// functions/kakaoAuth.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

if (!admin.apps.length) admin.initializeApp();

// ===== ENV (config() 우선, 없으면 process.env 폴백) =====
const cfg = functions.config?.() || {};
const KAKAO_REST_KEY =
    cfg.kakao?.rest_key || process.env.KAKAO_REST_KEY || "";
const KAKAO_CLIENT_SECRET =
    cfg.kakao?.client_secret || process.env.KAKAO_CLIENT_SECRET || "";
const KAKAO_REDIRECT_URI_DEFAULT =
    cfg.kakao?.redirect_uri || process.env.KAKAO_REDIRECT_URI || "";
const ALLOWED_ORIGINS =
    (cfg.app?.allowed_origins || process.env.ALLOWED_ORIGINS || "http://localhost:3000,https://withagit.co.kr")
        .split(",").map(s => s.trim()).filter(Boolean);

// 안전 마스킹 헬퍼
const tail = (s, n = 6) => (s ? s.slice(-n) : null);

function corsMinimal(req, res, next) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
}

// Node18+ 글로벌 fetch 폴백
const fetch_ = (...a) =>
    (typeof fetch === "function" ? fetch(...a) : import("node-fetch").then(({ default: f }) => f(...a)));

const appKakao = express();
appKakao.use(corsMinimal);
appKakao.use(express.json());
appKakao.use(express.urlencoded({ extended: false }));

appKakao.get("/health", (req, res) => res.json({ ok: true }));

appKakao.post("/", async (req, res) => {
    try {
        const { code, state, redirectUri } = req.body || {};
        const finalRedirectUri = redirectUri || KAKAO_REDIRECT_URI_DEFAULT;

        // 🔎 들어온 입력 & 현재 서버 설정 로그(비밀은 마스킹)
        functions.logger.info("[kakaoAuth] incoming", {
            hasCode: !!code,
            state,
            finalRedirectUri,
            rest_key_tail: tail(KAKAO_REST_KEY),             // 예: ******5ade
            client_secret_present: !!KAKAO_CLIENT_SECRET,    // true/false만
            allowed_origins_count: ALLOWED_ORIGINS.length,
        });

        if (!code) return res.status(400).json({ ok: false, step: "pre", error: "missing_code" });
        if (!KAKAO_REST_KEY || !finalRedirectUri) {
            return res.status(500).json({ ok: false, step: "pre", error: "missing_env" });
        }

        // 1) code -> token
        const form = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: KAKAO_REST_KEY,          // = client_id
            redirect_uri: finalRedirectUri,
            code,
        });
        // if (KAKAO_CLIENT_SECRET) form.set("client_secret", KAKAO_CLIENT_SECRET);

        // 🔎 토큰 요청 직전 로그
        functions.logger.info("[kakaoAuth] token request", {
            redirect_uri: finalRedirectUri,
            client_id_tail: tail(KAKAO_REST_KEY),
            sending_client_secret: !!KAKAO_CLIENT_SECRET,
        });

        const tRes = await fetch_("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
            body: form.toString(),
        });
        const tok = await tRes.json().catch(() => ({}));

        if (!tRes.ok || !tok?.access_token) {
            // 🔎 실패 원문을 그대로(비밀 제외) 내려주고, 로그로도 남김
            functions.logger.error("[kakaoAuth] token error", {
                status: tRes.status,
                error: tok?.error,
                error_description: tok?.error_description,
            });
            return res.status(400).json({
                ok: false,
                step: "token",
                status: tRes.status,
                error: tok?.error,
                error_description: tok?.error_description,
                redirect_uri_used: finalRedirectUri,
            });
        }

        // 2) access_token -> /v2/user/me
        const pRes = await fetch_("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${tok.access_token}` },
        });
        const p = await pRes.json().catch(() => ({}));
        if (!pRes.ok || !p?.id) {
            functions.logger.error("[kakaoAuth] profile error", { status: pRes.status, detail: p });
            return res.status(400).json({ ok: false, step: "me", status: pRes.status, detail: p });
        }

        // 3) Firebase Custom Token
        const uid = `kakao:${p.id}`;
        const customToken = await admin.auth().createCustomToken(uid, { provider: "kakao" });

        functions.logger.info("[kakaoAuth] success", { uid, nickname: p?.kakao_account?.profile?.nickname || null });

        return res.json({
            ok: true,
            provider: "kakao",
            uid,
            token: customToken,
            profile: {
                nickname: p?.kakao_account?.profile?.nickname || "",
                email: p?.kakao_account?.email || null,
            },
            state: state || null,
        });
    } catch (e) {
        functions.logger.error("[kakaoAuth] fatal", e);
        return res.status(500).json({ ok: false, step: "fatal", error: String(e) });
    }
});

exports.kakaoAuth = functions.region("asia-northeast3").https.onRequest(appKakao);
