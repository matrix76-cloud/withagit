// src/auth-kit/pages/PhoneMethodRouter.jsx
/* eslint-disable */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import config from "../config/auth.config";

/**
 * /auth/phone 진입점
 * - ✅ 로그인/가입 여부와 무관하게, 설정된 방식(PASS/알림톡) 인증 페이지로 즉시 라우팅
 * - (기존 '이미 인증된 계정이면 홈으로' 최적화는 요구사항에 따라 제거)
 */
export default function PhoneMethodRouter() {
    const nav = useNavigate();
    const method = config?.phoneAuth?.method || "pass"; // "pass" | "alimtalk"

    useEffect(() => {
        nav(method === "pass" ? "/auth/phone/pass" : "/auth/phone/alimtalk", {
            replace: true,
        });
    }, [nav, method]);

    return (
        <Wrap>
            <Spinner aria-label="loading" />
            <p>인증 화면으로 이동합니다…</p>
        </Wrap>
    );
}

const Wrap = styled.div`
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: var(--color-text, #111);
`;

const Spinner = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid rgba(0,0,0,.15);
  border-top-color: rgba(0,0,0,.7);
  border-radius: 50%;
  animation: spin .9s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
