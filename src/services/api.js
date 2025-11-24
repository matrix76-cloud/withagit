/* eslint-disable */
// 웹에서 Firebase를 1회만 초기화하고 재사용하기 위한 헬퍼

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let _app = null;

/** Firebase 앱을 단 한 번만 초기화 */
export function ensureFirebase() {
    if (_app) return _app;

    // ✅ 최소 필수 키: apiKey, authDomain, projectId, appId
    // ❗ storageBucket은 보통 {projectId}.appspot.com 형식 (예: withagit.appspot.com)
    const cfg = {
        apiKey: "AIzaSyDoBETT8hES9izxaArW9Dm3GUyGWSYLbfw",
        authDomain: "withagit.firebaseapp.com",
        projectId: "withagit",
        storageBucket: "withagit.firebasestorage.app",
        messagingSenderId: "526048407999",
        appId: "1:526048407999:web:0764f6e43ade8270ccb10a",
        measurementId: "G-48D7XV02DH",
    };

    // window.__FIREBASE_CONFIG__ 지원(전역 주입 시 우선 적용)
    const runtimeCfg =
        (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) || null;

    const config =
        (cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId) ? { ...cfg, ...(runtimeCfg || {}) } : runtimeCfg;

    if (!config) {
        throw new Error(
            "[firebase] config가 없습니다. ENV(FIREBASE_*) 또는 window.__FIREBASE_CONFIG__를 확인하세요."
        );
    }

    _app = getApps().length ? getApp() : initializeApp(config);
    return _app;
}

/** Core singletons (lazy) */
export const db = (() => getFirestore(ensureFirebase()))();
export const storage = (() => getStorage(ensureFirebase()))();

/** 필요 시 auth 인스턴스를 얻는 헬퍼 */
export function auth() {
    return getAuth(ensureFirebase());
}
