/* eslint-disable */
import { postAuthGate } from "auth-kit/utils/postAuthGate";

/** 에러 메시지 매핑 */
function mapErrorMessage(code, fallback) {
    const m = {
        "user-cancelled": "로그인이 취소되었습니다.",
        network: "네트워크 상태가 불안정합니다. 잠시 후 다시 시도해 주세요.",
        "settings-missing": "로그인 설정이 올바르지 않습니다. 관리자에게 문의해 주세요.",
        "token-exchange-failed": "토큰 처리에 실패했습니다. 다시 시도해 주세요.",
        unknown: fallback || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
    if (!code) return m.unknown;
    return m[code] || m.unknown;
}

// 중복 처리 방지(같은 uid/같은 시각의 재수신 무시)
let lastHandledAt = null;
let lastHandledUid = null;

/**
 * RN WebView → 웹 결과를 단일 진입점에서 처리
 * @param {{type:"SIGNIN_RESULT"|"SIGNIN_ERROR", ok:boolean, provider:string, uid?:string, code?:string, message?:string, at?:number}} msg
 * @param {{returnTo?:string, navigate:(path,opts?)=>void, onBeforeNavigate?:()=>void, onErrorToast?:(text:string)=>void}} opts
 */
export async function handleAuthResult(msg, opts = {}) {
    const { navigate, onBeforeNavigate, onErrorToast, returnTo } = opts;

    try {
        if (!msg || typeof msg !== "object" || !("type" in msg)) return;
        if (msg.type !== "SIGNIN_RESULT" && msg.type !== "SIGNIN_ERROR") return;

        const at = Number(msg.at || Date.now());
        if (msg.type === "SIGNIN_RESULT" && msg.ok) {
            const uid = msg.uid;
            if (lastHandledAt && lastHandledUid) {
                if (uid === lastHandledUid && Math.abs(at - lastHandledAt) < 1000) return;
            }
            lastHandledAt = at;
            lastHandledUid = uid;

            onBeforeNavigate && onBeforeNavigate();
            const provider = msg.provider || "google";
            const { redirectTo } = await postAuthGate(provider, returnTo);
            navigate && navigate(redirectTo || "/home", { replace: true });
            return;
        }

        // 실패
        if (lastHandledAt && Math.abs(at - lastHandledAt) < 1000) return;
        lastHandledAt = at;
        lastHandledUid = null;

        const text = mapErrorMessage(msg.code, msg.message);
        onBeforeNavigate && onBeforeNavigate();
        onErrorToast && onErrorToast(text);
    } catch (e) {
        console.error("[handleAuthResult] unexpected error:", e);
        onBeforeNavigate && onBeforeNavigate();
        onErrorToast && onErrorToast("예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.");
    }
}
