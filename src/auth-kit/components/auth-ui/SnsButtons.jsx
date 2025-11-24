/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { SiNaver, SiKakaotalk, SiApple } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { toast } from "auth-kit/utils/toast";
import config from "auth-kit/config/auth.config";

// ✅ 이번만: 성공 후 라우팅/메타 결정을 여기로 위임
import { postAuthGate } from "auth-kit/utils/postAuthGate";
import { ensureAnonWeb } from "services/firebase";

// // ✅ Firebase Web Auth (익명 로그인 보장 — 이 파일 내에서만 사용)
// import {
//   getAuth,
//   setPersistence,
//   browserLocalPersistence,
//   onAuthStateChanged,
//   signInAnonymously,
// } from "firebase/auth";

// /* ===== (inline) 익명 로그인 보장 ===== */
// async function ensureAnonInline() {
//   const auth = getAuth();
//   try {
//     await setPersistence(auth, browserLocalPersistence);
//   } catch { }
//   if (auth.currentUser) return auth.currentUser;
//   await signInAnonymously(auth);
//   return await new Promise((resolve) => {
//     const off = onAuthStateChanged(auth, (u) => {
//       if (u) {
//         off();
//         resolve(u);
//       }
//     });
//   });
// }

/* ===== WEB↔APP BRIDGE HELPERS (로그 강화) ===== */
const BRIDGE = (() => {
  const DEBUG_BRIDGE = true;
  const hasRN = !!(window?.ReactNativeWebView?.postMessage);
  const hasIOSHandler = !!(window?.webkit?.messageHandlers?.rnBridge?.postMessage);
  const hasAndroidObj = !!(window?.AndroidBridge?.postMessage);
  const isBridge = hasRN || hasIOSHandler || hasAndroidObj;

  const tag = "[BRIDGE]";
  const log = (...a) => DEBUG_BRIDGE && console.log(tag, ...a);
  const warn = (...a) => DEBUG_BRIDGE && console.warn(tag, ...a);
  const err = (...a) => DEBUG_BRIDGE && console.error(tag, ...a);

  const send = (message) => {
    try {
      const payload = typeof message === "string" ? message : JSON.stringify(message);
      if (hasRN) {
        window.ReactNativeWebView.postMessage(payload);
        log("[WEB->RN] sent:", payload);
        return true;
      }
      if (hasIOSHandler) {
        window.webkit.messageHandlers.rnBridge.postMessage(payload);
        log("[WEB->IOS] sent:", payload);
        return true;
      }
      if (hasAndroidObj) {
        window.AndroidBridge.postMessage(payload);
        log("[WEB->ANDROID] sent:", payload);
        return true;
      }
      warn("No bridge endpoints found");
      return false;
    } catch (e) {
      err("send error:", e);
      return false;
    }
  };

  // ✅ window / document 모두 수신 (RN WebView 호환)
  const addListener = (fn) => {
    try {
      const handler = (ev) => {
        try {
          console.log("[BRIDGE][RX] origin:", ev.origin || "(unknown)");
          console.log("[BRIDGE][RX] raw   :", ev.data);

          let data = ev.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch {
              /* ignore parse error */
            }
          }
          fn && fn(data);
        } catch (e) {
          console.warn("[BRIDGE][RX] handler error:", e);
          try {
            fn && fn(ev.data);
          } catch { }
        }
      };

      window.addEventListener("message", handler);
      if (document.addEventListener) {
        document.addEventListener("message", handler);
      }
      console.log("[BRIDGE] listener added");

      return () => {
        try {
          window.removeEventListener("message", handler);
          if (document.removeEventListener) {
            document.removeEventListener("message", handler);
          }
          console.log("[BRIDGE] listener removed");
        } catch (e) {
          console.warn("[BRIDGE] listener remove failed:", e);
        }
      };
    } catch (e) {
      console.warn("[BRIDGE] addListener failed:", e);
      return () => { };
    }
  };

  return { isBridge, send, addListener };
})();

/* ===== SNS BUTTONS MAIN ===== */
export default function SnsButtons({
  variant = "circle",
  size = 44,
  providers = ["google", "kakao"],
  returnTo = "/home",
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toRef = useRef(null);
  const BRIDGE_TIMEOUT = Math.max(
    10000,
    Number(config?.authKit?.bridge?.timeoutMs || 60000)
  );
  const clearTO = () => {
    try {
      clearTimeout(toRef.current);
    } catch { }
    toRef.current = null;
  };

  const handleClick = (provider) => {
    if (loading) return;

    if (!BRIDGE.isBridge) {
      toast("앱에서만 이용 가능합니다. 앱 내에서 다시 시도해 주세요.");
      return;
    }
    setLoading(true);

    const msg = { type: "START_SIGNIN", payload: { provider } };
    if (provider === "naver") {
      const redirectUri =
        config?.authKit?.naver?.redirectUri ||
        `${window.location.origin}/auth/callback/naver`;
      msg.payload.redirectUri = redirectUri;
      msg.payload.state = String(Date.now());
    }

    const ok = BRIDGE.send(msg);
    if (!ok) {
      setLoading(false);
      toast("브릿지 연결을 찾을 수 없어요. 앱에서 다시 시도해 주세요.");
      return;
    }

    try {
      clearTimeout(toRef.current);
    } catch { }
    toRef.current = setTimeout(() => {
      setLoading(false);
      toast("로그인 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.");
    }, BRIDGE_TIMEOUT);
  };

  // ✅ RN → WEB 응답 수신: 익명 확보 → postAuthGate → 이동
  useEffect(() => {
    const off = BRIDGE.addListener(async (data) => {
      if (data?.type !== "SIGNIN_RESULT") return;

      try {
        clearTimeout(toRef.current);
      } catch { }
      setLoading(false);

      const res = data.payload || {};
      if (!res?.success) {
        toast(res?.error_message || "로그인에 실패했어요. 다시 시도해 주세요.");
        return;
      }

      // 1) 익명 세션 확보 (가드/규칙 통과를 위해)
      // try {
      //   await ensureAnonInline();
      // } catch (e) {
      //   console.warn("[SnsButtons] ensureAnonInline failed", e);
      // }

      try {
          await ensureAnonWeb();
      } catch (e) {
          console.warn("[SnsButtons] ensureAnonWeb failed", e);
      }
      

      // 2) postAuthGate로 최종 리다이렉트 결정
      let redirect = "/home";
      try {
        const safeReturn =
          returnTo && returnTo.startsWith("/") ? returnTo : null;
        const g = await postAuthGate(res.provider || "sso", safeReturn);
        console.log("[SnsButtons] postAuthGate:", g);
        redirect =
          g?.redirectTo && g.redirectTo.startsWith("/")
            ? g.redirectTo
            : redirect;
      } catch (e) {
        console.warn("[SnsButtons] postAuthGate error:", e);
        redirect =
          (returnTo && returnTo.startsWith("/")) ?
            returnTo :
            (config?.postSignInRoute?.startsWith("/") ? config.postSignInRoute : "/home");
      }

      // 3) 이동
      navigate(redirect, { replace: true });
    });

    return () => {
      off?.();
      clearTO();
    };
  }, [navigate, returnTo]);

  return (
    <Wrap $variant={variant}>
      {providers.map((p) => {
        const Btn = btnByProvider[p] || GenericBtn;
        const icon = iconByProvider[p] || null;
        const label = labelByProvider[p] || p;
        return (
          <Btn
            key={p}
            type="button"
            aria-label={`${label}로 계속하기`}
            $size={size}
            $variant={variant}
            onClick={() => handleClick(p)}
            disabled={loading}
          >
            {icon}
            {variant === "pill" && <span>{label}로 계속하기</span>}
          </Btn>
        );
      })}
    </Wrap>
  );
}

/* ===== UI ===== */
const labelByProvider = {
  google: "구글",
  naver: "네이버",
  kakao: "카카오",
  apple: "Apple",
};
const iconByProvider = {
  google: <FcGoogle size={22} />,
  naver: <SiNaver size={18} color="#FFFFFF" />,
  kakao: <SiKakaotalk size={20} color="#000000" />,
  apple: <SiApple size={20} color="#FFFFFF" />,
};

const Wrap = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  ${({ $variant }) =>
    $variant === "pill" &&
    css`
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    `}
`;

const BaseBtn = styled.button`
  border: none;
  cursor: pointer;
  font-weight: 800;
  display: grid;
  place-items: center;
  transition: transform 120ms ease;
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  ${({ $size, $variant }) =>
    $variant === "circle"
      ? css`
          width: ${$size || 44}px;
          height: ${$size || 44}px;
          border-radius: 50%;
          font-size: 18px;
        `
      : css`
          height: ${$size || 44}px;
          border-radius: 12px;
          padding: 0 14px;
          display: inline-grid;
          grid-auto-flow: column;
          grid-gap: 8px;
          place-content: center;
          place-items: center;
          font-size: 14px;
        `}
`;

const GoogleBtn = styled(BaseBtn)`
  background: #fff;
  color: #111;
  border: 1px solid #e6e0d8;
`;
const NaverBtn = styled(BaseBtn)`
  background: #03c75a;
  color: #fff;
`;
const KakaoBtn = styled(BaseBtn)`
  background: #fee500;
  color: #000;
`;
const AppleBtn = styled(BaseBtn)`
  background: #000;
  color: #fff;
`;
const GenericBtn = styled(BaseBtn)`
  background: #fff;
  color: #111;
  border: 1px solid #e6e0d8;
`;
const btnByProvider = {
  google: GoogleBtn,
  naver: NaverBtn,
  kakao: KakaoBtn,
  apple: AppleBtn,
};
