/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

// ---- Firebase Admin (idempotent)
if (!admin.apps.length) admin.initializeApp();

// ---- CORS (minimal: index.js와 동일 정책 사용)
const ALLOW = new Set(
    (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
);
function corsMinimal(req, res, next) {
    const origin = req.headers.origin;
    if (origin && ALLOW.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
}

// ---- env (Secrets / .env.local)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI || "";

// ---- App
const appNaver = express();
appNaver.use(corsMinimal);
appNaver.use(express.urlencoded({ extended: false }));

appNaver.post("/", async (req, res) => {
    try {
        const { code, state } = req.body || {};
        if (!code) return res.status(400).json({ error: "bad_request" });
        if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || !NAVER_REDIRECT_URI) {
            return res.status(500).json({ error: "missing_env" });
        }

        // 1) code -> access_token
        const tokenResp = await fetch("https://nid.naver.com/oauth2.0/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: NAVER_CLIENT_ID,
                client_secret: NAVER_CLIENT_SECRET,
                code,
                state: state || "",
                redirect_uri: NAVER_REDIRECT_URI, // server-side fixed
            }).toString(),
        });
        const token = await tokenResp.json().catch(() => ({}));
        if (!tokenResp.ok || !token?.access_token) {
            return res.status(401).json({ error: "naver_token_error" });
        }

        // 2) profile
        const profResp = await fetch("https://openapi.naver.com/v1/nid/me", {
            headers: { Authorization: `Bearer ${token.access_token}` },
        });
        const prof = await profResp.json().catch(() => ({}));
        const pid = prof?.response?.id;
        if (!profResp.ok || !pid) {
            return res.status(401).json({ error: "naver_profile_error" });
        }

        // 3) Firebase custom token
        const uid = `naver:${pid}`;
        const customToken = await admin.auth().createCustomToken(uid, { provider: "naver" });
        return res.json({ token: customToken, provider: "naver", uid });
    } catch {
        return res.status(500).json({ error: "naver_auth_failed" });
    }
});

// ---- Export
exports.naverAuth = functions.region("asia-northeast3").https.onRequest(appNaver);
