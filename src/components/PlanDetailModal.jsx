// src/components/PlanDetailModal.jsx
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

/* ===== Overlay & Panel ===== */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.32);
  display: ${({ $open }) => ($open ? "grid" : "none")};
  place-items: center;
  z-index: 1000;
`;

const Panel = styled.div`
  width: min(720px, 92vw);
  max-height: 86vh;
  background: #fff7f0;
  border-radius: 18px;
  box-shadow: 0 18px 64px rgba(0,0,0,.25);
  border: 1.5px solid #f2d5b8;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;

const Head = styled.div`
  background: #fff2e6;
  color: #e7752d;
  padding: 18px 20px;
  position: relative;
  border-bottom: 1px solid rgba(0,0,0,.06);
  letter-spacing: .4px;
  font-size: 22px;
`;

const Close = styled.button`
  position: absolute; right: 16px; top: 14px;
  width: 36px; height: 36px; border-radius: 10px;
  border: 0; background: rgba(0,0,0,.06);
  cursor: pointer;
  transition: background .15s;
  &:hover { background: rgba(0,0,0,.12); }
`;

const Body = styled.div`
  padding: 22px 22px 0;
  overflow: auto;
`;

/* ===== Typo (no font-weight) ===== */
const H2 = styled.div`
  font-size: 28px; line-height: 1.35;
  color: #111;
  margin: 0 0 6px;
  letter-spacing: -0.2px;
`;

const Meta = styled.div`
  font-size: 14px; line-height: 1.7;
  color: #8a8f99;
  margin-bottom: 14px;
`;

const Rule = styled.div`
  height: 1px; background: rgba(0,0,0,.06);
  margin: 16px 0;
`;

const List = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 12px;
  li { color: #4f5562; font-size: 16px; line-height: 1.7; }
  li[data-strong="1"] {
    color: #111;
    letter-spacing: .1px;
  }
  /* 체크 마커 */
  li::before{
    content: "✓";
    color: #e7752d;
    margin-right: 10px;
  }
  /* 보조 라인(설명) */
  li small{
    display: block; color: #8a8f99; font-size: 14px; line-height: 1.6; margin-left: 22px;
  }
`;

const Note = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  background: #fff;
  border: 1px dashed #e8c8aa;
  border-radius: 12px;
  color: #6b7280;
  font-size: 14px; line-height: 1.7;
`;

/* ===== Footer: 옵션 + 결제 ===== */
const Footer = styled.div`
  padding: 18px 22px 22px;
  display: grid; grid-template-columns: 1fr 140px; gap: 12px;
  align-items: center;
  background: #fff7f0;
  border-top: 1px solid rgba(0,0,0,.06);
`;

const SelectBox = styled.div`
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 10px;
  background: #fff; border: 1.5px solid #e4e7eb; border-radius: 14px;
  padding: 12px 14px;
`;

const Select = styled.select`
  appearance: none; border: 0; background: transparent;
  font-size: 16px; color: #111; width: 100%; outline: none;
`;

const Chevron = styled.span`
  width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent;
  border-top: 8px solid #8a8f99;
`;

const Pay = styled.button`
  height: 48px; border-radius: 14px; border: 0;
  background: #f07a2a; color: #fff; cursor: pointer;
  font-size: 18px; letter-spacing: .2px;
  box-shadow: 0 10px 24px rgba(240,122,42,.35);
  transition: transform .05s, background .15s;
  &:hover{ background: #e86e1d; }
  &:active{ transform: translateY(1px); }
`;

/* ===== Component ===== */
export default function PlanDetailModal({
    open = false,
    onClose = () => { },
    plan = "timepass", // 'timepass' | 'subscription' | 'prepaid'
}) {
    // 플랜별 표시 텍스트(필요 시 추후 Firestore로 이관)
    const data = useMemo(() => {
        if (plan === "subscription") {
            return {
                head: "간략히 보기",
                title: "정규 멤버십 (월정액)",
                meta: "월 정액 / 우선 예약권",
                points: [
                    { t: "정기 이용에 적합", strong: 0 },
                    { t: "주 5회, 1회 최대 2시간 이용", strong: 0 },
                    { t: "간식·픽업 별도 과금", strong: 0 },
                    { t: "프리미엄 돌봄 서비스", strong: 1 },
                ],
                extra: [
                    "24시간 문의 응대",
                    "예약/퇴장 및 공간 이용 실시간 알림",
                ],
                options: [
                    { v: "m-59900", label: "월정액 (59,900원)" },
                ],
                cta: "결제",
                note: "패밀리 멤버십(형제/자매)은 정규 멤버십 활성 상태가 필요합니다.",
            };
        }
        if (plan === "prepaid") {
            return {
                head: "간략히 보기",
                title: "패밀리 멤버십 (월정액)",
                meta: "선불 충전 / 형제·자매 할인",
                points: [
                    { t: "충전해서 사용하는 선불 방식", strong: 0 },
                    { t: "멤버십 할인 적용", strong: 0 },
                    { t: "사용 내역 관리", strong: 1 },
                ],
                extra: [
                    "정규 멤버십 기준 2인째부터 20% 할인",
                    "예: 59,000원 + 47,200원 = 106,200원/월",
                ],
                options: [
                    { v: "pre-100", label: "충전 100,000원" },
                    { v: "pre-200", label: "충전 200,000원" },
                ],
                cta: "결제",
                note: "패밀리 멤버십은 활성 ‘아지트(정규 구독)’가 있어야 구매 가능합니다.",
            };
        }
        // default: timepass
        return {
            head: "간략히 보기",
            title: "라이트 멤버십 (시간권)",
            meta: "2시간권 / 4시간권",
            points: [
                { t: "필요할 때만 가볍게 이용", strong: 0 },
                { t: "평일 이용, 2시간/4시간 선택 · 유효기간 1개월", strong: 0 },
                { t: "자녀 1인 기준, 참여 시간 분 단위 차감", strong: 1 },
                { t: "포함 서비스 (픽업 서비스 이용 불가)", strong: 1 },
                { t: "아지트 공간 & 교구 무제한 이용", strong: 0 },
            ],
            extra: [
                "간식·유료 교구 및 프로그램 🍿",
                "체험용/단기 이용 최적 🤖",
                "입장/퇴장, 간식 및 공간 이용 실시간 알림",
                "체험용/단기 이용 최적 🚌",
                "잔여 시간 확인 가능",
            ],
            options: [
                { v: "2h-25000", label: "2시간권 (25,000원)" },
                { v: "4h-45000", label: "4시간권 (45,000원)" },
            ],
            cta: "결제",
            note: "시간권은 픽업 서비스가 포함되지 않습니다.",
        };
    }, [plan]);

    const [opt, setOpt] = useState(data.options?.[0]?.v || "");
    useEffect(() => { setOpt(data.options?.[0]?.v || ""); }, [data]);

    // ESC 닫기
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <Overlay $open={open} onClick={onClose}>
            <Panel onClick={(e) => e.stopPropagation()}>
                <Head>
                    {data.head}
                    <Close aria-label="닫기" onClick={onClose}>✕</Close>
                </Head>

                <Body>
                    <H2>{data.title}</H2>
                    <Meta>{data.meta}</Meta>

                    <List>
                        {data.points.map((p, i) => (
                            <li key={i} data-strong={p.strong ? 1 : 0}>
                                {p.t}
                            </li>
                        ))}
                    </List>

                    <Rule />

                    <H2 style={{ fontSize: 22, color: "#1a1d21", letterSpacing: ".1px" }}>추가 결제 항목</H2>
                    <List>
                        {data.extra.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </List>

                    {data.note && <Note>{data.note}</Note>}
                </Body>

                <Footer>
                    <SelectBox>
                        <Select value={opt} onChange={(e) => setOpt(e.target.value)}>
                            {data.options.map((o) => (
                                <option key={o.v} value={o.v}>{o.label}</option>
                            ))}
                        </Select>
                        <Chevron />
                    </SelectBox>

                    <Pay onClick={() => alert(`${data.cta} - ${opt}`)}>{data.cta}</Pay>
                </Footer>
            </Panel>
        </Overlay>
    );
}
