/* eslint-disable */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

import config from "../config/auth.config";
import { sendAlimtalkOtp } from "../providers/api/identityStub"; // 알림톡 서버 스텁
import { getAuth, signInAnonymously } from "firebase/auth";

import * as usersService from "services/usersService";
import * as membersService from "services/membersService";
import * as expertsService from "services/expertsService";

/**
 * PhoneAlimtalkPage (reCAPTCHA 제거 버전)
 */
export default function PhoneAlimtalkPage() {
    const nav = useNavigate();
    const loc = useLocation();
    const sp = new URLSearchParams(loc.search);
    const returnTo = sp.get("returnTo") || null;

    const OTP_TTL = config?.phoneAuth?.otpTtlSec ?? 180;

    const [step, setStep] = useState("input");
    const [rawPhone, setRawPhone] = useState("");
    const [e164, setE164] = useState("");
    const [otp, setOtp] = useState("");
    const [remain, setRemain] = useState(0);
    const [err, setErr] = useState("");
    const [debugCode, setDebugCode] = useState("");

    useEffect(() => {
        if (step !== "otp" || remain <= 0) return;
        const t = setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [step, remain]);

    const formatPhoneKR = (v = "") => {
        const d = v.replace(/[^\d]/g, "");
        if (d.length <= 3) return d;
        if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    };
    const normalizeE164KR = (v) => {
        const n = String(v || "").replace(/[^\d]/g, "");
        if (n.startsWith("010")) return `+82${n.slice(1)}`;
        if (n.startsWith("82")) return `+${n}`;
        return v.startsWith("+") ? v : v;
    };
    const isValidE164 = (p) => /^\+82(10\d{8})$/.test(p);
    const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

    const handleBack = () => {
        if (step === "otp") {
            setStep("input");
            setRemain(0);
            setOtp("");
            setErr("");
            setDebugCode("");
        } else if (window.history.length > 1) nav(-1);
        else nav(config?.postSignOutRoute || "/auth", { replace: true });
    };

    const handleStart = async (e) => {
        e?.preventDefault?.();
        setErr("");
        const p = normalizeE164KR(rawPhone);
        if (!isValidE164(p)) return setErr("전화번호 형식을 확인해 주세요.");
        setE164(p);

        try {
            await sendAlimtalkOtp({ phoneE164: p });
            const code = genCode(); // 로컬 테스트 코드
            setDebugCode(code);
            setOtp("");
            setRemain(OTP_TTL);
            setStep("otp");
        } catch (e) {
            console.error("[alimtalk][start]", e);
            setErr("인증을 시작할 수 없어요. 잠시 후 다시 시도해 주세요.");
        }
    };

    const handleVerify = async (e) => {
        e?.preventDefault?.();
        setErr("");

        const code = (otp || "").replace(/\D/g, "");
        if (code.length !== 6) return setErr("6자리 인증코드를 입력해 주세요.");
        if (remain <= 0) return setErr("인증 시간이 만료되었어요. 처음부터 다시 시도해 주세요.");
        if (code !== debugCode) return setErr("인증코드가 올바르지 않습니다.");

        try {
            const auth = getAuth();
            let u = auth.currentUser;
            if (!u) {
                const { user } = await signInAnonymously(auth);
                u = user;
            }

            await usersService.ensureUserDoc(u.uid, {
                provider: "phone",
                phoneE164: e164,
                loginMethodToSet: "phone",
            });

            const hasMember = await membersService.existsMemberByPhone(e164);
            const hasExpert = await expertsService.existsExpertByPhone(e164);

            const next = (hasMember || hasExpert) ? (returnTo || "/home") : "/register";
            nav(next, { replace: true });
        } catch (e2) {
            console.error("[alimtalk][verify]", e2);
            setErr("인증에 실패했어요. 다시 시도해 주세요.");
        }
    };

    const mm = String(Math.floor(remain / 60)).padStart(1, "0");
    const ss = String(remain % 60).padStart(2, "0");

    return (
        <Page>
            <Card>
                <TopRow>
                    <BackBtn type="button" onClick={handleBack} aria-label="뒤로가기">
                        <FiChevronLeft size={20} />
                        <span>뒤로</span>
                    </BackBtn>
                </TopRow>

                <Head>
                    <Title>카카오 알림톡 인증</Title>
                    <Hint>알림톡으로 받은 6자리 인증코드를 입력하세요.</Hint>
                </Head>

                {step === "input" && (
                    <form onSubmit={handleStart}>
                        <Field>
                            <FieldLabel>전화번호</FieldLabel>
                            <PhoneInput
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="010-1234-5678"
                                value={rawPhone}
                                onChange={(e) => setRawPhone(formatPhoneKR(e.target.value))}
                            />
                        </Field>
                        {err && <Err>{err}</Err>}
                        <Primary type="submit" disabled={!isValidE164(normalizeE164KR(rawPhone))}>
                            인증코드 받기
                        </Primary>
                        <Sub>인증을 시작하면 3분 이내에 인증코드를 입력해야 합니다.</Sub>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleVerify}>
                        <DebugBox aria-live="polite">
                            테스트용 코드입니다. 아래 코드를 입력해 진행하세요.
                            <CodePill onClick={() => navigator.clipboard?.writeText(debugCode)}>
                                {debugCode}
                            </CodePill>
                        </DebugBox>

                        <Field>
                            <FieldLabel>인증코드</FieldLabel>
                            <CodeInput
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="6자리 인증코드"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                                autoFocus
                            />
                            <TimerRow>
                                남은 시간 <TimerText>{mm}:{ss}</TimerText>
                            </TimerRow>
                        </Field>

                        {err && <Err>{err}</Err>}
                        <Primary type="submit" disabled={otp.replace(/\D/g, "").length !== 6 || remain <= 0}>
                            확인
                        </Primary>
                        <Sub>정식 연동 전 임시 플로우입니다.</Sub>
                    </form>
                )}
            </Card>
        </Page>
    );
}

/* styled-components */
const Page = styled.main`
  min-height: 100dvh;
  background: var(--color-bg, #faf7f3);
  color: #111;
  padding: 24px 16px;
  @media (min-width: 641px) { padding: 32px 24px; }
`;

const Card = styled.section`
  width: 100%;
  max-width: 560px;
  min-height: calc(100dvh - 48px);
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  border-radius: 16px;
  border: 1px solid var(--color-border, #eee3d8);
  @media (min-width: 641px) { padding: 28px 24px; }
`;

const TopRow = styled.div`
  display: flex; align-items: center;
  margin-bottom: 16px;
`;

const BackBtn = styled.button`
  display: inline-grid; grid-auto-flow: column; gap: 6px; align-items: center;
  border: 1px solid var(--color-border, #e6e0d8); background: #fff; border-radius: 12px;
  height: 36px; padding: 0 12px; font-size: 13px; cursor: pointer;
  &:active { transform: translateY(1px); }
`;

const Head = styled.header`
  margin: 6px 0 20px;
`;

const Title = styled.h1`
  margin: 0 0 8px; font-size: 20px; letter-spacing: -0.01em;   /* font-weight 없음 */
`;

const Hint = styled.p`
  margin: 0; color: #666; font-size: 13px;
`;

const Field = styled.label`
  display: grid; gap: 8px; margin: 16px 0 10px; font-size: 13px;
`;

const FieldLabel = styled.span`
  color: #333; font-size: 13px;
`;

const PhoneInput = styled.input`
  height: 52px; border-radius: 12px; border: 1px solid var(--color-border);
  padding: 0 16px; font-size: 16px; text-align: center; letter-spacing: 1px;
  ::placeholder { color: rgba(0,0,0,0.28); }
  &:focus{ border-color: var(--color-primary,#d9a679);
    box-shadow: 0 0 0 3px rgba(217,166,121,.25); outline: none; }
`;

const CodeInput = styled(PhoneInput)`
  letter-spacing: 6px;                   /* font-weight 제거 */
`;

const TimerRow = styled.div`
  margin-top: 8px; font-size: 12px; color: #666;
`;

const TimerText = styled.span`
  padding-left: 6px; color: #333;
`;

const Err = styled.div`
  color: #e03131; font-size: 12px; margin-top: 6px;
`;

const Primary = styled.button`
  height: 50px; width: 100%; border: none; border-radius: 14px;
  background: var(--color-accent,#E6C39E); color: #fff; font-size: 15px;
  margin-top: 12px; cursor: pointer;
  &:disabled { opacity: .6; cursor: default; }
`;

const Sub = styled.p`
  margin: 10px 0 0; font-size: 12px; color: #777;
`;

const DebugBox = styled.div`
  background: #fff7e6; border: 1px solid #ffe0a3; color: #7A4A00;
  border-radius: 12px; padding: 12px 14px; font-size: 12px; line-height: 1.6;
  margin: 0 0 12px;
`;

const CodePill = styled.button`
  margin-left: 8px; border: 1px dashed #d9a679; background: #fff; color: #5a3a2e;
  letter-spacing: 2px; padding: 2px 8px; border-radius: 8px; cursor: pointer;
`;
