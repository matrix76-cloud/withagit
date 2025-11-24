/* eslint-disable */
// src/pages/auth/PhoneLoginPage.jsx
// 전화번호 입력 → DEV 코드 생성 표시 → Pass 페이지 이동
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import authDevKit from "../../services/authDevKit";

const Wrap = styled.main`
  min-height:100dvh; background:#fff; display:grid; place-items:center; padding:24px 16px; color:#111827;
`;
const Card = styled.section` width:100%; max-width:420px; display:grid; gap:16px; `;
const Title = styled.h1` margin:0; font-size:24px; font-weight:800; `;
const Input = styled.input`
  height:56px; border-radius:12px; border:1px solid #e5e7eb; padding:0 16px; font-size:16px;
  &:focus{ outline:2px solid #11182722; }
`;
const Btn = styled.button`
  height:56px; border-radius:12px; border:0; background:#111827; color:#fff; font-size:16px; font-weight:700; cursor:pointer;
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;
const Tip = styled.p` margin:0; color:#6b7280; font-size:13px; `;
const DevBox = styled.div`
  margin-top:4px; padding:12px; border-radius:10px; background:#f5f7ff; color:#1f2a44; font-size:14px; border:1px dashed #c7d2fe;
`;

function normalizeKR(input) {
    if (!input) return "";
    const only = String(input).replace(/[^\d]/g, "");
    if (only.startsWith("0")) return `+82${only.slice(1)}`;
    if (only.startsWith("82")) return `+${only}`;
    if (only.startsWith("+")) return only;
    return `+82${only}`;
}

export default function PhoneLoginPage() {
    const nav = useNavigate();
    const location = useLocation();
    const from = new URLSearchParams(location.search).get("from") || "/mypage";

    const [raw, setRaw] = useState("");
    const [busy, setBusy] = useState(false);
    const [devCode, setDevCode] = useState("");
    const phoneE164 = useMemo(() => normalizeKR(raw), [raw]);
    const valid = useMemo(() => /^\+82\d{9,11}$/.test(phoneE164), [phoneE164]);

    const onSend = async () => {
        if (!valid || busy) return;
        try {
            setBusy(true);
            const { sessionId, devTestCode } = await authDevKit.phone.send({ phoneE164 });
            setDevCode(devTestCode);
            nav(`/auth/phone/pass?session=${encodeURIComponent(sessionId)}&from=${encodeURIComponent(from)}&p=${encodeURIComponent(phoneE164)}`);
        } catch (e) {
            alert(`[auth] otp_send_failed: ${e.code || e.message}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Wrap>
            <Card>
                <Title>휴대전화 번호</Title>
                <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="예: 010-1234-5678"
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    aria-label="휴대전화 번호"
                    autoFocus
                />
                <Tip>입력값은 자동으로 E.164 형식({phoneE164 || "-"})으로 변환됩니다.</Tip>
                <Btn type="button" onClick={onSend} disabled={!valid || busy} aria-busy={busy}>
                    인증코드 받기
                </Btn>

                {devCode ? (
                    <DevBox role="note" aria-live="polite">
                        <strong>개발용 테스트 코드:</strong>{" "}
                        <span style={{ fontFamily: "monospace" }}>{devCode}</span><br />
                        이 코드를 다음 화면(6자리)에 입력하면 로그인됩니다.
                    </DevBox>
                ) : null}
            </Card>
        </Wrap>
    );
}
