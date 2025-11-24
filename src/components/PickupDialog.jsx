// src/components/PickupDialog.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { FiUser, FiPhone, FiCalendar, FiMapPin, FiNavigation, FiMessageSquare } from "react-icons/fi";

/**
 * 픽업 신청 팝업 (createPortal 없이, 페이지 내에서 렌더)
 * props:
 *  - isOpen: boolean
 *  - branch: { id, name, address }
 *  - onClose: () => void
 *  - onSubmit?: (payload) => Promise<void> | void
 */
export default function PickupDialog({ isOpen, branch, onClose, onSubmit }) {
    const [form, setForm] = useState({
        requesterName: "",
        phone: "",
        datetime: "",
        pickupAddr: "",
        dropoffAddr: "",
        childName: "",
        note: "",
        agree: false,
        mkt: false,
    });
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const dialogRef = useRef(null);
    const titleRef = useRef(null);
    const lastFocusedRef = useRef(null);

    const minDateTime = useMemo(() => {
        const d = new Date(Date.now() + 30 * 60 * 1000);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        lastFocusedRef.current = document.activeElement;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "Tab" && dialogRef.current) {
                const f = dialogRef.current.querySelectorAll("button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])");
                if (!f.length) return;
                const first = f[0];
                const last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        };
        document.addEventListener("keydown", onKey);
        setTimeout(() => titleRef.current?.focus(), 0);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", onKey);
            lastFocusedRef.current && lastFocusedRef.current.focus?.();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const valid =
        form.requesterName.trim().length >= 2 &&
        /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(form.phone.replace(/\s/g, "")) &&
        form.datetime &&
        form.pickupAddr.trim().length >= 5 &&
        form.dropoffAddr.trim().length >= 5 &&
        form.childName.trim().length >= 1 &&
        form.agree;

    const submit = async () => {
        if (!valid || busy) return;
        setBusy(true);
        try {
            const payload = {
                branchId: branch?.id,
                branchName: branch?.name,
                requesterName: form.requesterName.trim(),
                phone: normalizePhoneKR(form.phone),
                datetime: new Date(form.datetime).toISOString(),
                pickupAddr: form.pickupAddr.trim(),
                dropoffAddr: form.dropoffAddr.trim(),
                childName: form.childName.trim(),
                note: form.note.trim(),
                agree: !!form.agree,
                mkt: !!form.mkt,
            };
            if (onSubmit) await onSubmit(payload);
            setDone(true);
        } catch (e) {
            alert("신청을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Overlay onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <Sheet role="dialog" aria-modal="true" aria-labelledby="pickupModalTitle" ref={dialogRef}>
                <Header>
                    <Title id="pickupModalTitle" tabIndex={-1} ref={titleRef}>픽업 신청하기</Title>
                    <CloseBtn onClick={onClose} aria-label="닫기">×</CloseBtn>
                </Header>

                {!done ? (
                    <Body>
                        <Intro>
                            <BranchName>{branch?.name || "지점"}</BranchName>
                            <BranchAddr>{branch?.address || ""}</BranchAddr>
                            <Tip>1분이면 신청 완료! 상담 후 일정/요금이 확정됩니다.</Tip>
                        </Intro>

                        <Grid>
                            <Field>
                                <Label><FiUser /> 신청인 이름 *</Label>
                                <Input
                                    placeholder="홍길동"
                                    value={form.requesterName}
                                    onChange={(e) => set("requesterName", e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label><FiPhone /> 휴대폰 번호 *</Label>
                                <Input
                                    inputMode="tel"
                                    placeholder="예) 010-1234-5678"
                                    value={form.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label><FiCalendar /> 원하는 픽업 일자와 시간 *</Label>
                                <Input
                                    type="datetime-local"
                                    min={minDateTime}
                                    value={form.datetime}
                                    onChange={(e) => set("datetime", e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label><FiMapPin /> 픽업 위치 *</Label>
                                <Input
                                    placeholder="예) 서울 마포구 도화동 559"
                                    value={form.pickupAddr}
                                    onChange={(e) => set("pickupAddr", e.target.value)}
                                />
                                <Hint>기관명이나 주변 상호를 함께 적어주시면 좋아요.</Hint>
                            </Field>

                            <Field>
                                <Label><FiNavigation /> 도착 위치 *</Label>
                                <Input
                                    placeholder="예) 서울 마포구 염리동 173-4"
                                    value={form.dropoffAddr}
                                    onChange={(e) => set("dropoffAddr", e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label><FiUser /> 픽업 대상 아이 이름 *</Label>
                                <Input
                                    placeholder="아이 이름"
                                    value={form.childName}
                                    onChange={(e) => set("childName", e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label><FiMessageSquare /> 기타 특이사항 (선택)</Label>
                                <Textarea
                                    rows={4}
                                    placeholder="셔틀 차량 번호, 비상연락처, 아이 특성 등 자유롭게 적어주세요."
                                    value={form.note}
                                    onChange={(e) => set("note", e.target.value)}
                                />
                            </Field>

                            <Checks>
                                <CheckLine>
                                    <input id="agree" type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} />
                                    <label htmlFor="agree">[필수] 개인정보 수집·이용에 동의합니다.</label>
                                </CheckLine>
                                <CheckLine>
                                    <input id="mkt" type="checkbox" checked={form.mkt} onChange={(e) => set("mkt", e.target.checked)} />
                                    <label htmlFor="mkt">[선택] 알림/마케팅 수신에 동의합니다.</label>
                                </CheckLine>
                            </Checks>
                        </Grid>
                    </Body>
                ) : (
                    <Body>
                        <Success>
                            <Emoji>✅</Emoji>
                            <h3>신청이 접수됐어요</h3>
                            <p>담당자가 빠르게 연락드려 일정을 확정해 드릴게요.</p>
                            <Summary>
                                <li><b>지점</b> {branch?.name}</li>
                                <li><b>일시</b> {formatLocal(form.datetime)}</li>
                                <li><b>픽업</b> {form.pickupAddr}</li>
                                <li><b>도착</b> {form.dropoffAddr}</li>
                                <li><b>연락처</b> {maskPhone(form.phone)}</li>
                            </Summary>
                        </Success>
                    </Body>
                )}

                <Footer>
                    {!done ? (
                        <>
                            <Btn onClick={onClose} aria-label="취소">취소</Btn>
                            <BtnPrimary onClick={submit} disabled={!valid || busy} aria-label="신청하기">
                                {busy ? "전송 중..." : "신청하기"}
                            </BtnPrimary>
                        </>
                    ) : (
                        <BtnPrimary onClick={onClose} aria-label="닫기">확인</BtnPrimary>
                    )}
                </Footer>
            </Sheet>
        </Overlay>
    );
}

/* helpers */
function normalizePhoneKR(raw) {
    const d = (raw || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("0")) return `010-${d.slice(-8, -4)}-${d.slice(-4)}`;
    if (d.length === 10) return `010-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length >= 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    return d;
}
function maskPhone(p) {
    const d = (p || "").replace(/\D/g, "");
    if (d.length >= 10) return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
    return p;
}
function formatLocal(dt) {
    if (!dt) return "";
    try { return new Date(dt).toLocaleString(); }
    catch { return dt; }
}

/* styles */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: saturate(120%) blur(2px);
  display: grid; place-items: center;
  z-index: 999;
`;
const Sheet = styled.section`
  width: clamp(360px, 86vw, 560px);
  max-height: 86vh; overflow: hidden;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display: grid; grid-template-rows: auto 1fr auto;
`;
const Header = styled.header`
  position: sticky; top: 0; z-index: 1;
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 8px;
  padding: 16px 22px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  background: #fff;
`;
const Title = styled.h2`
  margin: 0; font-size: 18px; font-weight: 900;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
`;
const CloseBtn = styled.button`
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff; cursor: pointer;
  font-size: 18px; line-height: 1;
  &:hover { background: #FAFAFA; }
`;

const Body = styled.div`
  overflow: auto;
  padding: 24px 24px 18px;              /* 상하좌우 여백 더 넓게 */
`;
const Intro = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 20px;                   /* 소개 블록 아래 여백 증가 */
`;
const BranchName = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
`;
const BranchAddr = styled.div`
  font-size: 13px; opacity: .8;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
`;
const Tip = styled.div`
  font-size: 12px; color: rgba(0,0,0,.65); margin-top: 6px;
`;

const Grid = styled.div`
  display: grid;
  row-gap: 24px;                         /* 필드 간 세로 간격 더 넓게 */
  column-gap: 24px;
`;
const Field = styled.div`
  display: grid;
  gap: 12px;                              /* 라벨 ↔ 입력 간격 더 여유 있게 */
`;
const Label = styled.label`
  display: inline-flex; align-items: center; gap: 8px;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; }
`;
const Input = styled.input`
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px; padding: 14px 16px;   /* 입력 높이 살짝 키움 */
  font-size: 15px; outline: none;
  &:focus { border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"}; box-shadow: 0 0 0 3px rgba(255,122,0,.18); }
`;
const Textarea = styled.textarea`
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px; padding: 14px 16px;
  font-size: 15px; line-height: 1.55; outline: none; resize: vertical;
  &:focus { border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"}; box-shadow: 0 0 0 3px rgba(255,122,0,.18); }
`;
const Hint = styled.div`
  font-size: 12px; color: rgba(0,0,0,.55);
  margin-top: 4px;                        /* 힌트와 입력칸 사이 살짝 간격 */
`;

const Checks = styled.div`
  display: grid;
  gap: 12px;                               /* 체크박스 사이 간격 */
  margin-top: 16px;                         /* 본문 필드들과의 간격 */
`;
const CheckLine = styled.label`
  display: grid; grid-template-columns: 18px 1fr; align-items: center; gap: 8px;
  input { width: 18px; height: 18px; }
`;

const Footer = styled.footer`
  position: sticky; bottom: 0; z-index: 1;
  display: grid; grid-auto-flow: column; gap: 10px;
  padding: 14px 16px; background: #fff;
  border-top: 1px solid rgba(0,0,0,.06);
`;
const Btn = styled.button`
  height: 42px; border-radius: 10px; border: 1px solid rgba(0,0,0,.12);
  background: #fff; font-weight: 800; cursor: pointer;
  &:hover { background: #FAFAFA; }
`;
const BtnPrimary = styled(Btn)`
  border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  background: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color: #fff;
`;

const Success = styled.div`
  display: grid; gap: 8px; place-items: center; text-align: center; padding: 18px 0 10px;
  h3 { margin: 6px 0 2px; font-size: 18px; font-weight: 900; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; }
  p { margin: 0; color: rgba(0,0,0,.7); font-size: 14px; }
`;
const Emoji = styled.div` font-size: 40px; line-height: 1; `;
const Summary = styled.ul`
  list-style: none; padding: 0; margin: 12px 0 0; text-align: left; width: 100%;
  display: grid; gap: 6px;
  li { font-size: 14px; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; }
  b { font-weight: 900; margin-right: 6px; }
`;
