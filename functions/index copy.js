/* eslint-disable */
// Minimal HTTP Functions: health
// Social auth handlers are exported from separate files (kakao.js, naver.js)
// SMS handlers are exported from sms.js (sendSms, pingIp)

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

// ---- Firebase Admin
if (!admin.apps.length) admin.initializeApp();

// ---- CORS (minimal)
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

// ---------------- health ----------------
const appHealth = express();
appHealth.use(corsMinimal);
appHealth.get("/", (_req, res) => res.json({ ok: true, ts: Date.now() }));
exports.health = functions.region("asia-northeast3").https.onRequest(appHealth);

// ---------------- social auth ----------------
exports.kakaoAuth = require("./kakao").kakaoAuth;
exports.naverAuth = require("./naver").naverAuth;

// ---------------- sms (sendSms / pingIp) ----------------
exports.sendSms = require("./sms").sendSms;
exports.pingIp = require("./sms").pingIp;
