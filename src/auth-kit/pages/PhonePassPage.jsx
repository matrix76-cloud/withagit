/* eslint-disable */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

import config from "../config/auth.config";
import { startPassVerification } from "../providers/api/identityStub"; // 서버 요청 스텁
import { getAuth, signInAnonymously } from "firebase/auth";

import * as usersService from "services/usersService";
import * as membersService from "services/membersService";
import expertsService from "services/expertsService";

/**
 * PhonePassPage (PASS 본인확인, reCAPTCHA 제거 버전)
 * - 010-8888-9900 ~ 010-8888-9999 : 인증코드/문자 발송 없이 즉시 통과
 * - 그 외 번호 : 기존 PASS 시작 + (필요 시) 문자 발송 연동 포인트 유지
 */
export default function PhonePassPage() {
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

  // ----------------------------------
  // Helpers
  // ----------------------------------

  const toLocalKR = (e164 = "") => {
    const s = String(e164 || "");
    if (s.startsWith("+82")) return "0" + s.slice(3).replace(/[^\d]/g, "");
    return s.replace(/[^\d]/g, "");
  };

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

  /** 010-8888-9900 ~ 010-8888-9999 (100개) 범위면 true */
  const isDevBypassPhone = (pE164 = "") => {
    // +821088889900 ~ +821088889999
    return /^\+8210888899\d{2}$/.test(pE164);
  };

  const handleBack = () => {
    nav("/auth", { replace: true });
  };

  // (필요 시 Cloud Functions/Run 호출 지점 — 현재는 제거/보류)
  async function sendVerifySms(toE164, code) {
    const SMS_ENDPOINT = process.env.REACT_APP_SMS_ENDPOINT || (window?.__SMS_ENDPOINT__);
    if (!SMS_ENDPOINT) throw new Error("no_sms_endpoint");

    const to = toLocalKR(toE164); // 알리고는 국내형식(010…) 권장
    const payload = {
      to,
      templateId: "VERIFY_CODE",
      variables: { code: String(code) }
    };

    const resp = await fetch(SMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 401/403이면 엔드포인트가 비공개임(브라우저 직호출 불가)
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("unauthorized_endpoint"); // 서버 경유 필요(아래 참고)
    }

    const json = await resp.json().catch(() => ({}));
    if (!json?.ok) {
      throw new Error(json?.error || "sms_failed");
    }
    return json;
  }

  // ✅ OTP 없이 바로 통과 처리 공통 루틴
  async function completeWithoutOtp(pE164) {
    const auth = getAuth();
    let u = auth.currentUser;
    if (!u) {
      const { user } = await signInAnonymously(auth);
      u = user;
    }
    await usersService.ensureUserDoc(u.uid, {
      provider: "phone",
      phoneE164: pE164,
      loginMethodToSet: "phone",
    });
    const hasMember = await membersService.existsMemberByPhone(pE164);
    const hasExpert = await expertsService.existsExpertByPhone(pE164);
    const next = hasMember || hasExpert ? returnTo || "/home" : "/register";
    nav(next, { replace: true });
  }

  const handleStart = async (e) => {
    e?.preventDefault?.();
    setErr("");
    const p = normalizeE164KR(rawPhone);
    if (!isValidE164(p)) return setErr("전화번호 형식을 확인해 주세요.");
    setE164(p);

    try {
      // ✅ 1) 개발자 테스트 구간(100개 범위): 문자/코드 없이 즉시 완료
      if (isDevBypassPhone(p)) {
        await completeWithoutOtp(p);
        return;
      }

      // ✅ 2) 일반 구간: PASS 시작 (필요 시 이후 문자 발송 연동)
      await startPassVerification({ returnUrl: window.location.href });

      // (선택) 서버에서 문자 발송 연동 지점 — 현재는 유지만
      const code = genCode();
      await sendVerifySms(p, code);

      // OTP 입력 단계로 전환(디버그코드 노출 없음)
      setDebugCode("");
      setOtp("");
      setRemain(OTP_TTL);
      setStep("otp");
    } catch (e2) {
      console.error("[pass][start]", e2);
      setErr("인증을 시작할 수 없어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    setErr("");

    // 개발자 범위는 OTP 화면까지 안 오므로, 여기선 일반 케이스만 처리
    const code = (otp || "").replace(/\D/g, "");
    if (code.length !== 6) return setErr("6자리 인증코드를 입력해 주세요.");
    if (remain <= 0) return setErr("인증 시간이 만료되었어요. 처음부터 다시 시도해 주세요.");

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

      const next = hasMember || hasExpert ? returnTo || "/home" : "/register";
      nav(next, { replace: true });
    } catch (e3) {
      console.error("[pass][verify]", e3);
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
          <Title>전화번호 본인확인</Title>
          <Hint>본인 명의 휴대전화로 안전하게 인증합니다.</Hint>
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
              본인확인
            </Primary>

          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerify}>
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
  border: 1px solid var(--color-border,#e6e0d8); background: #fff; border-radius: 12px;
  height: 36px; padding: 0 12px; font-size: 13px; cursor: pointer;
  &:active { transform: translateY(1px); }
`;
const Head = styled.header`
  margin: 6px 0 20px;
`;
const Title = styled.h1`
  margin: 0 0 8px; font-size: 20px; letter-spacing: -0.01em;
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
  letter-spacing: 6px;
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
