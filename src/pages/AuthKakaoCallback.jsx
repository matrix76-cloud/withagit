/* eslint-disable */
// src/pages/AuthKakaoCallback.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhoneVerifyDialog from "../components/PhoneVerifyDialog";

// Firebase (클라이언트에서 최소 upsert만 수행 — 보안 규칙은 서버에서 보호)
import { linkGet, linkSave } from "../services/auth/providerLinkStore";


import { db, ensureFirebase } from "../services/api";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

// 서버 교환 엔드포인트(.env에서 하나만 있으면 됨)
const EXCHANGE_ENDPOINT =
    process.env.REACT_APP_KAKAO_EXCHANGE_URL ||
    process.env.REACT_APP_AUTH_ENDPOINT_KAKAO ||
    "/api/auth/kakao/exchange"; // (Hosting 리라이트 프록시용)

// SSOT 세션 저장 헬퍼
function saveLocalSession(payload) {
    try {
        localStorage.setItem(
            "auth_dev_session",
            JSON.stringify({ ...payload, isLoggedIn: true, at: Date.now() })
        );
    } catch { }
}

export default function AuthKakaoCallback() {
    const nav = useNavigate();
    const [sp] = useSearchParams();
    const ran = useRef(false); // 중복 실행 방지

    // 전화 인증 모달 상태
    const [needPhone, setNeedPhone] = useState(false);
    const [verifying, setVerifying] = useState(false); // 전화 인증 처리 중
    const [exchangePayload, setExchangePayload] = useState(null); // 서버 교환 응답 (provider 정보 등 보관)

    const redirectUri = `${window.location.origin}/auth/callback/kakao`;

    const finalizeLogin = useCallback(async (phoneE164, providerMeta = {}) => {
        // 1) auth/{phone} kakao 프로바이더 머지
        const authRef = doc(db, "auth", phoneE164);
        const prevAuthSnap = await getDoc(authRef);
        const prevAuth = prevAuthSnap.exists() ? prevAuthSnap.data() : {};

        await setDoc(
            memRef,
            {
                phoneE164,
                profile: prevMem?.profile || { displayName: providerMeta?.nickname || "", avatarUrl: "" },
                createdAt: prevMem?.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // 2) members/{phone} upsert (최소 필드만 — 나머지는 서버/관리자 화면에서 확장)
        const memRef = doc(db, "members", phoneE164);
        const prevMemSnap = await getDoc(memRef);
        const prevMem = prevMemSnap.exists() ? prevMemSnap.data() : {};
        await setDoc(
            memRef,
            {
                phoneE164,
                status: prevMem?.status || "active",
                updatedAt: serverTimestamp(),
                createdAt: prevMem?.createdAt || serverTimestamp(),
            },
            { merge: true }
        );

        // 3) 세션 저장(SSOT: phoneE164)
        saveLocalSession({ phoneE164 });

        // 4) 홈 이동 → 앱 부팅 시 UserContext가 phoneE164로 문서 로딩
        nav("/", { replace: true });
    }, [nav]);

    /* eslint-disable */
    // src/pages/AuthKakaoCallback.jsx (핵심 추가/변경 부분만)




    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const code = sp.get("code");
        const state = sp.get("state") || "";

        (async () => {
            // 1) 서버 교환(혹은 기존 exchangeKakaoCode() 사용)
            const r = await fetch(EXCHANGE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ code, state, redirectUri }),
            });
            const j = await r.json().catch(() => null);
            if (!r.ok || j?.ok === false) { nav("/login", { replace: true }); return; }

            // 2) 서버가 phoneE164 주면 바로 로그인
            if (j?.phoneE164) { await finalizeLogin(j.phoneE164, j.provider || null); return; }

            // 3) 서버 매핑은 없지만 provider.id가 있으면 → 로컬 링크 조회
            const providerMeta = j?.provider || j?.kakao || null;
            const providerId = providerMeta?.id;
            if (providerId) {
                const localPhone = linkGet("kakao", providerId); // ✅ 로컬에서 찾기
                if (localPhone) {
                    await finalizeLogin(localPhone, providerMeta);  // 바로 로그인(문자 스킵)
                    return;
                }
            }

            // 4) 로컬에도 없으면 → 전화 인증 모달
            setExchangePayload(j || {});
            setNeedPhone(true);
        })().catch(() => nav("/login", { replace: true }));
    }, [nav, sp, finalizeLogin, redirectUri]);


    // 전화 인증 성공 시(SSOT 획득) → auth/members upsert → 세션 저장 → 홈
    const handlePhoneVerified = useCallback(async (phoneE164) => {
        if (!phoneE164 || verifying) return;
        setVerifying(true);
        try {
            const providerMeta =
                exchangePayload?.provider || exchangePayload?.kakao || exchangePayload?.profile || null;

            // ✅ 로컬 링크 저장: 다음 로그인부터 문자 스킵
            if (providerMeta?.id) {
                linkSave("kakao", String(providerMeta.id), phoneE164);
            }

            await finalizeLogin(phoneE164, providerMeta);
        } catch (e) {
            alert("로그인 마무리 처리 중 오류가 발생했습니다.");
        } finally {
            setVerifying(false);
        }
    }, [verifying, exchangePayload, finalizeLogin])
    const handlePhoneClose = useCallback(() => {
        // 사용자가 닫으면 로그인 화면으로 복귀
        setNeedPhone(false);
        nav("/login", { replace: true });
    }, [nav]);

    return (
        <div style={{ padding: 24 }}>
            {needPhone && (
                <PhoneVerifyDialog
                    open={needPhone}
                    onClose={handlePhoneClose}
                    onVerified={handlePhoneVerified} // (phoneE164) 전달
                    // 필요 시 콜백용 문구 주입
                    title="전화번호 인증"
                    description="카카오 계정과 연결할 휴대폰 번호를 인증해 주세요."
                // Dialog 내부에서 자체적으로 로딩/에러 핸들링
                />
            )}
        </div>
    );
}
