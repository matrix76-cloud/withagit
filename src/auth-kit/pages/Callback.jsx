/* eslint-disable */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";

import { handleRedirectResultGoogle } from "../providers/firebase/services/googleWeb";
import {
    exchangeNaverCode,
    exchangeKakaoCode,
    signInWithCustomTokenWeb,
} from "../providers/firebase/services/customTokenWeb";
import { postAuthGate } from "../utils/postAuthGate";

/* ── inline spinner ui ─────────────────────────────────────────── */
const spin = keyframes`to { transform: rotate(360deg); }`;
const SpinnerWrap = styled.div`
  padding: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  color: var(--color-text, #111);
`;
const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-top-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
const Msg = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

/**
 * AuthKit SNS Callback
 * --------------------------------------------------------
 * - /auth/callback/:provider (google / kakao / naver)
 * - 로그인 완료 후 postAuthGate()를 통해 리다이렉트
 */
export default function Callback() {
    const { provider } = useParams(); // 'google' | 'kakao' | 'naver'
    const { search, pathname, hash } = useLocation();
    const nav = useNavigate();
    const [msg, setMsg] = useState("로그인 처리 중...");
    const ran = useRef(false);


    useEffect(() => {
        (async () => {


            console.log("[ENV] NAVER_EP =", process.env.REACT_APP_AUTH_ENDPOINT_NAVER);
            
            if (ran.current) return;
            ran.current = true;

            const params = new URLSearchParams(search);
            const code = params.get("code");
            const state = params.get("state") || "";

            const stripQuery = () => nav({ pathname, search: "", hash }, { replace: true });

            try {
                /* ========== Google ========== */
                if (provider === "google") {
                    const res = await handleRedirectResultGoogle(); // { user, isNew } | null
                    const user = res?.user || res;
                    if (!user) {
                        setMsg("처리할 로그인 정보가 없어요. 다시 시도해주세요.");
                        return;
                    }
                    stripQuery();
                    const { redirectTo } = await postAuthGate("google");
                    return nav(redirectTo, { replace: true });
                }

                /* ========== Kakao ========== */
                if (provider === "kakao" || state.startsWith("KK_")) {
                    if (!code) return setMsg("코드가 없습니다. 다시 시도해주세요.");
                    const token = await exchangeKakaoCode(code, state);
                    await signInWithCustomTokenWeb(token, "kakao");
                    stripQuery();
                    const { redirectTo } = await postAuthGate("kakao");
                    return nav(redirectTo, { replace: true });
                }

                /* ========== Naver ========== */
                if (provider === "naver" || state.startsWith("NV_")) {
                    if (!code) return setMsg("코드가 없습니다. 다시 시도해주세요.");
                    const token = await exchangeNaverCode(code, state);
                    await signInWithCustomTokenWeb(token, "naver");
                    stripQuery();
                    const { redirectTo } = await postAuthGate("naver");
                    return nav(redirectTo, { replace: true });
                }

                setMsg("알 수 없는 로그인 제공업체입니다.");
            } catch (e) {
                console.error(`[Callback:${provider}]`, e);
                setMsg("로그인에 실패했어요. 잠시 후 다시 시도해주세요.");
            }
        })();
    }, [provider, search, nav, pathname, hash]);

    return (
        <SpinnerWrap>
            <Spinner aria-label="loading" />
            <Msg>{msg}</Msg>
        </SpinnerWrap>
    );
}
