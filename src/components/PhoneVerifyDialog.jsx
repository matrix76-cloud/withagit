/* eslint-disable */
// /src/components/PhoneVerifyDialog.jsx
// 안전한 모달 포털(모든 PC/브라우저에서 확실히 뜨도록)
// - 포털 루트 동기 확보(useLayoutEffect)
// - 포털 준비 전엔 직접 렌더 폴백(놓침 방지)
// - body 스크롤 락, 백드롭 클릭 닫기
// - 테스트 번호 구간(010-6214-1000 ~ 010-6214-2000)에서는 서버 호출 생략 + devCode 노출
// - props: open, onClose, onVerified(phoneE164), title?, description?, variant?, containerId?

import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";

/* ===== Backdrop & Position ===== */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2147483647; /* 어떤 헤더/오버레이보다 위로 */
  overflow-y: auto;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  padding: 24px 22px 26px;
  box-sizing: border-box;
`;

/* ============ Styles ============ */
const Title = styled.h3`
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
`;
const Field = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
`;
const Label = styled.label`
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.2px;
`;
const InputWrap = styled.div`
  position: relative;
  background: #f7f8fb;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;

  &:focus-within {
    background: #fff;
    border-color: #cbd5e1;
  }

  input {
    flex: 1;
    border: 0;
    outline: none;
    background: transparent;
    font-size: 18px;
    color: #111;
  }
`;
const Hint = styled.div`
  font-size: 12px;
  color: #6b7280;
`;
const Error = styled.div`
  font-size: 13px;
  color: #b91c1c;
`;
const Buttons = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 8px;
`;
const BaseBtn = styled.button`
  height: 56px;
  border-radius: 16px;
  border: 0;
  font-size: 16px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.12s, transform 0.05s, background-color 0.15s,
    opacity 0.15s;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
const SendBtn = styled(BaseBtn)`
  background: #f6ddcc;
  color: #1f2937;
`;
const VerifyBtn = styled(BaseBtn)`
  background: linear-gradient(180deg, #111827 0%, #0b1222 100%);
  color: #fff;
`;

/* ===== Config ===== */
const SMS_API_URL = "https://sendsms-v6bdtk44vq-du.a.run.app"; // Cloud Run 엔드포인트(실서버로 교체 가능)
const TEST_RANGE_START = "01062141000";
const TEST_RANGE_END = "01062142000";
const TEST_EXTRA = "01039239669"; // ✅ 추가: 단일 허용 번호

/* ===== Utils ===== */
const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");
const leftPad11 = (d = "") => d.padStart(11, "0");
const inTestRange = (rawDigits = "") => {
    const d = leftPad11(onlyDigits(rawDigits));
    return (d >= TEST_RANGE_START && d <= TEST_RANGE_END) || d === TEST_EXTRA;
};
const formatKRPhone = (raw) => {
    let d = onlyDigits(raw);
    if (d.startsWith("82")) d = "0" + d.slice(2);
    if (d.length >= 11)
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    if (d.length >= 10)
        return d.startsWith("02")
            ? `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`
            : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
    if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return d;
};
const toE164KR = (raw) => {
    const d = onlyDigits(raw);
    if (!d) return "";
    const local = d.startsWith("0") ? d.slice(1) : d;
    return `+82${local}`;
};
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/* ===== Portal helper ===== */
function ensurePortal(containerId = "modal-root") {
    if (typeof document === "undefined") return null;
    let el = document.getElementById(containerId);
    if (!el) {
        el = document.createElement("div");
        el.id = containerId;
        // 포털 자체가 숨김 처리되지 않도록 최소 스타일 방지
        el.style.position = "relative";
        el.style.zIndex = "2147483646";
        document.body.appendChild(el);
    }
    return el;
}

/**
 * Props
 * - open: boolean
 * - onClose: () => void
 * - onVerified: (phoneE164: string) => void
 * - title?: string
 * - description?: string
 * - variant?: "login" | "signup"
 * - containerId?: string ("modal-root" 기본)
 */
export default function PhoneVerifyDialog({
    open,
    onClose,
    onVerified,
    title = "전화번호 인증",
    description,
    variant = "login",
    containerId = "modal-root",
}) {
    /* ===== Portal 준비 (동기 확보 + 폴백) ===== */
    const [portalEl, setPortalEl] = useState(null);
    useLayoutEffect(() => {
        setPortalEl(ensurePortal(containerId));
    }, [containerId]);

    /* ===== Refs & State ===== */
    const phoneRef = useRef(null);
    const codeRef = useRef(null);

    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [devCode, setDevCode] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [sentTo, setSentTo] = useState("");

    const digits = useMemo(() => onlyDigits(phone), [phone]);
    const canSend = digits.length === 10 || digits.length === 11;
    const canVerify =
        code.length === 6 && sentTo && toE164KR(phone) === sentTo;

    /* ===== Body scroll lock ===== */
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    /* ===== Resend countdown ===== */
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [secondsLeft]);

    /* ===== Handlers ===== */
    const handlePhoneInput = (e) => {
        const d = onlyDigits(e.target.value).slice(0, 11);
        setPhone(formatKRPhone(d));
        setError("");
    };
    const handleCodeInput = (e) => {
        const d = onlyDigits(e.target.value).slice(0, 6);
        setCode(d);
        setError("");
    };

    const sendCode = async () => {
        if (!canSend || sending) return;
        try {
            setSending(true);
            setError("");
            const otp = genOtp();
            const e164 = toE164KR(phone);
            const isDev = inTestRange(digits);

            setDevCode(otp);
            setSentTo(e164);
            setSecondsLeft(60);
            setTimeout(() => codeRef.current?.focus(), 50);

            if (isDev) return; // 테스트 구간은 서버 호출 생략

            const resp = await fetch(SMS_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: digits,
                    templateId: "VERIFY_CODE",
                    variables: { code: otp },
                }),
            });

            let data = null;
            try {
                data = await resp.json();
            } catch {
                /**/
            }
            if (!resp.ok || data?.ok === false) {
                const msg =
                    (data && (data.error || data.result?.message)) ||
                    `발송 실패(${resp.status})`;
                setError(`인증 코드를 전송하지 못했습니다. ${msg}`);
            }
        } catch {
            setError(
                "코드 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setSending(false);
        }
    };

    const verifyAndLogin = async () => {
        if (!canVerify || verifying) return;
        try {
            setVerifying(true);
            setError("");
            if (code !== devCode) {
                setError("인증 코드가 올바르지 않습니다.");
                return;
            }
            const e164 = sentTo;
            onVerified?.(e164); // SSOT 전달
        } catch {
            setError("인증 처리 중 오류가 발생했습니다.");
        } finally {
            setVerifying(false);
        }
    };

    /* ===== Render ===== */
    if (!open) return null;

    const content = (
        <Backdrop
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
            role="dialog"
            aria-modal="true"
        >
            <Sheet onClick={(e) => e.stopPropagation()} aria-labelledby="pv-title">
                <Title id="pv-title">{title}</Title>
                {description && (
                    <Hint style={{ margin: "-4px 0 16px" }}>{description}</Hint>
                )}

                <Field>
                    <Label htmlFor="pv-phone">전화번호</Label>
                    <InputWrap>
                        <input
                            id="pv-phone"
                            ref={phoneRef}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="010-1234-5678"
                            value={phone}
                            onChange={handlePhoneInput}
                            autoFocus
                        />
                    </InputWrap>
                    <Hint>숫자만 입력하면 자동으로 형식이 맞춰집니다.</Hint>
                </Field>

                <Buttons>
                    <SendBtn
                        onClick={sendCode}
                        disabled={!canSend || sending || secondsLeft > 0}
                    >
                        {secondsLeft > 0 ? `재전송 (${secondsLeft}s)` : "인증 코드 받기"}
                    </SendBtn>
                    {inTestRange(digits) && !!devCode && (
                        <Hint>
                            <strong>개발모드 코드:</strong> {devCode} ({toE164KR(phone)})
                        </Hint>
                    )}
                </Buttons>

                <Field style={{ marginTop: 16 }}>
                    <Label htmlFor="pv-code">인증 코드</Label>
                    <InputWrap>
                        <input
                            id="pv-code"
                            ref={codeRef}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="6자리 숫자"
                            value={code}
                            onChange={handleCodeInput}
                            maxLength={6}
                        />
                    </InputWrap>
                </Field>

                {error ? <Error>{error}</Error> : null}

                <Buttons>
                    <VerifyBtn
                        onClick={verifyAndLogin}
                        disabled={!canVerify || verifying}
                    >
                        확인하고 로그인
                    </VerifyBtn>
                </Buttons>
            </Sheet>
        </Backdrop>
    );

    // 포털 준비되면 포털로, 아니면 즉시 렌더(폴백)
    return portalEl ? createPortal(content, portalEl) : content;
}
