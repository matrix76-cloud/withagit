/* eslint-disable */
import * as React from "react";
import { handleAuthResult } from "auth-kit/bridge/handleAuthResult";

/**
 * RN WebView로부터의 message를 수신하여 공통 처리로 넘긴다.
 * @param {{returnTo?:string, navigate:(path,opts?)=>void, clearBridgeTimeout?:()=>void, onErrorToast?:(text:string)=>void}} opts
 */
export function useBridgeAuth(opts = {}) {
    const { returnTo, navigate, clearBridgeTimeout, onErrorToast } = opts;
    const ranRef = React.useRef(false);

    React.useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const parse = (raw) => {
            try {
                const data = typeof raw === "string" ? JSON.parse(raw) : raw;
                if (!data || typeof data !== "object") return null;
                if (data.type === "SIGNIN_RESULT" || data.type === "SIGNIN_ERROR") return data;
                return null;
            } catch (_) {
                return null;
            }
        };

        const onMessage = async (ev) => {
            const raw = (ev && ev.data) ?? (ev && ev.nativeEvent && ev.nativeEvent.data);
            const msg = parse(raw);
            if (!msg) return;
            await handleAuthResult(msg, {
                returnTo,
                navigate,
                onBeforeNavigate: () => {
                    try { clearBridgeTimeout && clearBridgeTimeout(); } catch (_) { }
                },
                onErrorToast,
            });
        };

        window.addEventListener("message", onMessage);
        document.addEventListener("message", onMessage); // RN 호환

        return () => {
            try { window.removeEventListener("message", onMessage); } catch (_) { }
            try { document.removeEventListener("message", onMessage); } catch (_) { }
        };
    }, [returnTo, navigate, clearBridgeTimeout, onErrorToast]);
}


// 앱 → 웹 메시지 수신 바인딩
export function addAppMessageListener(handler) {
    const onDocMessage = (e) => {
        try {
            const raw = e?.data ?? e;
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (msg && typeof msg === "object") handler?.(msg, e);
        } catch { }
    };

    const onWindowMessage = (e) => {
        try {
            const raw = e?.data ?? e;
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;

            // 🔒 DevTools / 기타 확장 메시지 필터링
            if (raw?.source === "react-devtools-content-script") return;
            if (!msg || typeof msg.type !== "string") return;

            handler?.(msg, e);
        } catch { }
    };

    document.addEventListener("message", onDocMessage); // Android RN WebView
    window.addEventListener("message", onWindowMessage); // iOS / 일반 브라우저

    return () => {
        document.removeEventListener("message", onDocMessage);
        window.removeEventListener("message", onWindowMessage);
    };
}

