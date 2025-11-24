/* eslint-disable */
// src/pages/auth/PhonePassPage.jsx
// OTP 포커스 이중 링/오토필 하이라이트 제거 + 고정폭 6칸 + 붙여넣기 지원
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import authDevKit from "../../services/authDevKit";

const Wrap = styled.main`
  min-height:100dvh; background:#fff; display:grid; place-items:center; padding:24px 16px; color:#111827;
`;
const Card = styled.section` width:100%; max-width:720px; display:grid; gap:16px; `;
const Title = styled.h1` margin:0; font-size:28px; font-weight:800; `;
const Desc = styled.p` margin:0; color:#6b7280; font-size:14px; `;

const OTPRow = styled.div`
  display:grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-template-columns: repeat(6, 108px); /* ← 고정폭(PC) */
  gap: 24px;
  align-items: center;
  justify-content: start;
`;

const OTP = styled.input`
  height: 72px;
  width: 108px;                   /* ← 고정폭 */
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  text-align: center;
  font-size: 28px;
  line-height: 1;
  letter-spacing: .06em;
  /* 전역 포커스/오토필 스타일 완전 리셋 */
  outline: none !important;
  box-shadow: none !important;
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  transition: border-color .15s ease, outline-color .15s ease;
  /* 커스텀 포커스 링 */
  &:focus-visible {
    border-color: #9ca3af;
    outline: 2px solid rgba(55,65,81,.28);
    outline-offset: 0;
  }
  /* 크롬 오토필 배경색 제거 */
  &:-webkit-autofill {
    -webkit-text-fill-color: #111827;
    transition: background-color 9999s ease-in-out 0s;
  }
  /* 파이어폭스 숫자 스핀 제거 대비 */
  appearance: textfield;
`;

const Btn = styled.button`
  height:64px; border-radius:12px; border:0; background:#6b7280; color:#fff;
  font-size:16px; font-weight:700; cursor:pointer; width:100%;
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;

const Bar = styled.div`
  display:flex; gap:16px; align-items:center; justify-content:space-between;
  margin-top: 8px;
`;
const Small = styled.span` font-size:13px; color:#6b7280; `;
const LinkBtn = styled.button`
  background:transparent; border:0; padding:0; color:#374151; font-size:13px; 
  text-decoration: underline; text-underline-offset: 2px; cursor:pointer;
`;

export default function PhonePassPage() {
    const nav = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session") || "";
    const from = params.get("from") || "/mypage";
    const phoneE164 = params.get("p") || "";

    const phoneMasked = useMemo(
        () => phoneE164.replace(/\d(?=\d{4})/g, "•"),
        [phoneE164]
    );

    const [digits, setDigits] = useState(Array(6).fill(""));
    const [busy, setBusy] = useState(false);
    const [left, setLeft] = useState(60);
    const inputsRef = useRef([]);

    useEffect(() => {
        const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, []);

    const code = useMemo(() => digits.join(""), [digits]);
    const valid = code.length === 6 && /^\d{6}$/.test(code);

    const onChange = (i, v) => {
        const val = v.replace(/[^\d]/g, "").slice(0, 1);
        const next = [...digits];
        next[i] = val;
        setDigits(next);
        if (val && i < 5) inputsRef.current[i + 1]?.focus();
    };

    const onKeyDown = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            inputsRef.current[i - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
    };

    // 한 번에 붙여넣기(6자리) 지원
    const onPaste = (e) => {
        const text = (e.clipboardData.getData("text") || "").replace(/[^\d]/g, "");
        if (text.length === 6) {
            e.preventDefault();
            setDigits(text.split("").slice(0, 6));
            inputsRef.current[5]?.focus();
        }
    };

    const onVerify = async () => {
        if (!valid || busy) return;
        try {
            setBusy(true);
            await authDevKit.phone.verify({ sessionId, code, phoneE164 });
            await authDevKit.ensureUserDoc({ phoneE164 });
            await authDevKit.bootstrapUserContext();
            nav("/mypage", { replace: true });
        } catch (e) {
            alert(`[auth] otp_verify_failed: ${e.code || e.message}`);
        } finally {
            setBusy(false);
        }
    };

    const onResend = async () => {
        if (busy || left > 0) return;
        try {
            setBusy(true);
            alert("코드를 다시 받으려면 전화번호 입력 화면으로 돌아가 주세요.");
            nav(`/auth/phone?from=${encodeURIComponent(from)}`, { replace: true });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Wrap>
            <Card>
                <Title>인증코드 입력</Title>
                <Desc>{phoneMasked} 번호로 전송된 6자리 코드를 입력하세요.</Desc>

                <OTPRow onPaste={onPaste}>
                    {digits.map((d, i) => (
                        <OTP
                            key={i}
                            value={d}
                            onChange={(e) => onChange(i, e.target.value)}
                            onKeyDown={(e) => onKeyDown(i, e)}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label={`인증코드 ${i + 1} 자리`}
                            ref={(el) => (inputsRef.current[i] = el)}
                            autoFocus={i === 0}
                        />
                    ))}
                </OTPRow>

                <Btn type="button" onClick={onVerify} disabled={!valid || busy} aria-busy={busy}>
                    로그인 완료
                </Btn>

                <Bar>
                    <Small>재전송 {left > 0 ? `00:${String(left).padStart(2, "0")}` : "가능"}</Small>
                    <LinkBtn type="button" onClick={onResend} disabled={busy || left > 0}>
                        인증코드 재전송
                    </LinkBtn>
                </Bar>
            </Card>
        </Wrap>
    );
}
