/* eslint-disable */
// src/auth-kit/utils/postAuthGate.js
import { getAuth } from "firebase/auth";
import config from "../config/auth.config";
import usersService from "services/usersService";
import * as membersService from "services/membersService";
import * as expertsService from "services/expertsService";

/**
 * postAuthGate
 * ----------------------------------------------------------
 * SNS / PASS / 알림톡 인증 완료 직후 다음 경로를 결정.
 * - 기본 리다이렉트 정책: verified(전화 인증됨) → returnTo || (전문가: /expert/schedule, 일반: /home)
 *   미인증 → /auth/phone (returnTo 유지)
 * - 부가 메타 수집: members/experts 존재 여부 (응답에 포함)
 *
 * 반환:
 * {
 *   ok: true|false,
 *   uid: string,
 *   redirectTo: string,
 *   verified: boolean,           // 전화 인증 여부
 *   memberId: string|null,       // 확인된 멤버 ID
 *   hasMember: boolean,          // 멤버 존재 여부
 *   hasExpert: boolean,          // 전문가 문서 존재 여부 (experts/{phoneE164})
 *   expertStatus: string|null    // "DRAFT"|"SUBMITTED"|"REVIEWING"|"APPROVED"|"REJECTED"|"SUSPENDED"|null
 * }
 */
export async function postAuthGate(provider /* "google"|"kakao"|"naver"|"sso" */, returnTo) {
    const auth = getAuth();
    const u = auth.currentUser;
    const home = config?.postSignInRoute || "/home";
    const signOut = config?.postSignOutRoute || "/auth";
    const prov = (provider || "sso").toLowerCase();

    if (!u) {
        console.warn("[postAuthGate] no current user");
        return { ok: false, reason: "no-auth", redirectTo: signOut };
    }

    // 1) users/{uid} 최소 스키마 보정 (멱등)
    try {
        await usersService.ensureUserDoc(u.uid, {
            provider: prov,
            email: u.email || null,
            displayName: u.displayName || null,
            loginMethodToSet: prov,
        });
    } catch (e) {
        console.warn("[postAuthGate] ensureUserDoc failed:", e);
    }

    // 2) users 문서 재조회
    let doc = null;
    try {
        doc = await usersService.getUser(u.uid);
    } catch (e) {
        console.warn("[postAuthGate] getUser failed:", e);
    }

    // 3) 전화 인증 여부
    const phoneE164 = doc?.phoneE164 || null;
    const verified = !!phoneE164;

    // 4) member / expert 메타 조회 (리다이렉트 계산에 활용)
    let memberId = doc?.memberId || null;
    try {
        if (!memberId && phoneE164) {
            // users에 memberId가 아직 없으면 전화번호로 역추적
            memberId = await membersService.getMemberIdByPhone(phoneE164).catch(() => null);
        }
    } catch (e) {
        console.warn("[postAuthGate] getMemberIdByPhone failed:", e);
    }

    let expertDoc = null;
    try {
        if (phoneE164) {
            expertDoc = await expertsService.getExpertByPhone(phoneE164).catch(() => null);
        }
    } catch (e) {
        console.warn("[postAuthGate] getExpertByPhone failed:", e);
    }

    const hasMember = !!memberId;
    const hasExpert = !!expertDoc;
    const expertStatus = expertDoc?.status || null;

    // 5) 다음 경로 결정
    // - returnTo가 있으면 최우선
    // - 없고 verified=true면: 전문가 → /expert/schedule, 일반 → /home
    // - verified=false면: /auth/phone (returnTo 보존)
    let redirectTo = "";
    if (verified) {
        if (returnTo) {
            redirectTo = returnTo;
        } else {
            redirectTo = hasExpert ? "/expert/schedule" : home;
        }
    } else {
        redirectTo = `/auth/phone${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
    }

    return {
        ok: true,
        uid: u.uid,
        redirectTo,
        verified,
        memberId: memberId || null,
        hasMember,
        hasExpert,
        expertStatus,
    };
}

export default { postAuthGate };
