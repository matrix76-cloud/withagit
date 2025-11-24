/* eslint-disable */
// src/components/CheckoutTimepassDialog.jsx
// 타임패스 상세/구매 안내 모달 (한 장짜리, 내용 스크롤 + 하단 CTA 고정)

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import { MEMBERSHIP_KIND } from "../constants/membershipDefine";

import twohourimg from "../assets/membership/twohour.png";
import fourhourimg from "../assets/membership/fourhour.png";


/* ===== Layout ===== */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
`;

const Dialog = styled.div`
 width: min(460px, 100vw - 24px);
  max-height: min(720px, 100vh - 24px); /* 🔸 820 → 720 로 축소 */
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow: none; /* 🔸 그림자 제거 */
  font-family: "NanumSquareRound", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
`;

/* ===== Header / Tabs ===== */
const Header = styled.div`
  background: #ffffff;
  padding: 10px 18px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const TabsBar = styled.div`
  display: flex;
  justify-content: center;
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 40px;
  padding-bottom: 6px;
`;

const Tab = styled.button`
  position: relative;
  min-width: 120px;
  border: 0;
  background: transparent;
  padding: 10px 0 12px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  color: ${({ $active }) => ($active ? "#111111" : "#9ca3af")};
  cursor: pointer;
  text-align: center;

  &::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -2px;
    height: 2px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#facc15" : "transparent")};
  }
`;

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
  padding: 8px;
`;

/* ===== Body (scroll 영역) ===== */
const Body = styled.div`
  padding: 20px 24px 24px;
  background: #ffffff; /* 바디 전체 흰색 */
  overflow-y: auto;
`;

/* ===== 상단 타임패스 정보 ===== */
const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: #facc15;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  margin: 6px auto 14px;
`;

const Title = styled.h3`
  margin: 0 0 14px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  letter-spacing: -0.03em;
`;

const SummaryList = styled.ul`
  margin: 0 0 26px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;

  li {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.8;
  }

  li::before {
    content: "✓";
    color: #d1d5db;
    margin-right: 8px;
    font-weight: 700;
  }
`;

/* ===== 2시간권 / 4시간권 카드 ===== */
const PassRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 420px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PassCard = styled.button`
  width: 132px;
  padding: 12px 10px 12px;
  border-radius: 26px;
  border: 2px solid ${({ $active }) => ($active ? "#fbbf24" : "#f3f4f6")};
  background: #ffffff;
  cursor: pointer;
  display: grid;
  gap: 8px;
  justify-items: center;
  /* 🔸 그림자 제거 */
  box-shadow: none;
  transition: border-color 0.12s ease, transform 0.08s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const PassIcon = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 24px;
  background: #fef9c3;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #f59e0b;
  font-size: 20px;
`;

const PassLabel = styled.div`
  font-size: 13px;
  color: #4b5563;
`;

const PassPrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
`;

/* ===== 혜택 포인트 섹션 ===== */
const BenefitCard = styled.div`
  margin-top: 4px;
  padding: 14px 16px 12px;
  border-radius: 22px;
  background: #ffffff;
  /* 🔸 그림자 제거 */
  box-shadow: none;
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #374151;
  border: 1px solid #f3f4f6;
`;

const BenefitItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const BenefitEmoji = styled.span`
  font-size: 16px;
  line-height: 1.4;
`;

const BenefitText = styled.span`
  line-height: 1.7;
`;

/* ===== 확인하세요 섹션 ===== */
const CheckTitle = styled.div`
  margin: 22px 0 10px;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
`;

const CheckList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;

  li {
    line-height: 1.7;
  }

  li strong {
    font-weight: 900;
  }
`;

/* ===== 하단 CTA ===== */
const Footer = styled.div`
  padding: 12px 22px 18px;
  background: #f5f5f5;
  border-top: 1px solid #e5e7eb;
`;

const CTAButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 999px;
  border: 0;
  background: #facc15;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  /* 🔸 버튼 그림자 제거 */
  box-shadow: none;
  transition: transform 0.1s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.03);
  }

  &:active {
    transform: translateY(1px);
  }
`;

/* ===== 타임패스 옵션 ===== */
const TIMEPASS_OPTIONS = [
    { key: "2h", label: "2시간권", hours: "2h", minutes: 120, price: 25000 },
    { key: "4h", label: "4시간권", hours: "4h", minutes: 240, price: 45000 },
];

const KRW = (n) => n.toLocaleString("ko-KR");

export default function CheckoutTimepassDialog({
    open,
    onClose,
    onProceed, // (payload) => 최종 CheckoutConfirmDialog 열기
}) {
    const [portalEl, setPortalEl] = useState(null);
    const [activeTab] = useState("detail"); // 지금은 상세정보 탭만 사용
    const [selectedKey, setSelectedKey] = useState("2h");

    useEffect(() => {
        let el = document.getElementById("modal-root");
        if (!el) {
            el = document.createElement("div");
            el.id = "modal-root";
            document.body.appendChild(el);
        }
        setPortalEl(el);
    }, []);

    useEffect(() => {
        if (!open) return;
        setSelectedKey("2h");
    }, [open]);

    if (!open || !portalEl) return null;

    const selected =
        TIMEPASS_OPTIONS.find((o) => o.key === selectedKey) || TIMEPASS_OPTIONS[0];

    const handleCTA = () => {
        if (!selected) return;
        const payload = {
            product: {
                id: `timepass-${selected.key}`,
                name:
                    selected.key === "2h"
                        ? "타임패스 멤버십(2시간권)"
                        : "타임패스 멤버십(4시간권)",
                kind: MEMBERSHIP_KIND.TIMEPASS,
                variant: selected.key,
                minutes: selected.minutes,
            },
            price: { total: selected.price },
        };
        onProceed?.(payload);
    };

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    return createPortal(
        <Backdrop onClick={handleBackdrop}>
            <Dialog role="dialog" aria-modal="true" aria-label="타임패스 멤버십 상세">
                <Header>
                    <HeaderTop>
                        <CloseBtn type="button" aria-label="닫기" onClick={onClose}>
                            ✕
                        </CloseBtn>
                    </HeaderTop>
                    <TabsBar>
                        <Tabs>
                            <Tab $active={activeTab === "detail"}>상세정보 확인</Tab>
                            <Tab $active={false}>구매하기</Tab>
                        </Tabs>
                    </TabsBar>
                </Header>

                <Body>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <Pill>시간권</Pill>
                        <Title>타임패스 멤버십</Title>
                    </div>

                    <SummaryList>
                        <li>시간 단위로 원하는 만큼</li>
                        <li>단기·체험 고객 추천</li>
                        <li>간단한 예약, 부담 없는 이용</li>
                    </SummaryList>

                    <PassRow>
                        {TIMEPASS_OPTIONS.map((opt) => (
                            <PassCard
                                key={opt.key}
                                type="button"
                                $active={selectedKey === opt.key}
                                onClick={() => setSelectedKey(opt.key)}
                            >
                                <PassIcon>{opt.hours}</PassIcon>
                                <PassLabel>{opt.label}</PassLabel>
                                <PassPrice>{KRW(opt.price)}원</PassPrice>
                            </PassCard>
                        ))}


                        
                    </PassRow>

                    <BenefitCard>
                        <BenefitItem>
                            <BenefitEmoji>📣</BenefitEmoji>
                            <BenefitText>체험용/단기 이용 최적</BenefitText>
                        </BenefitItem>
                        <BenefitItem>
                            <BenefitEmoji>⏰</BenefitEmoji>
                            <BenefitText>입장·퇴장, 간식 및 공간 이용 실시간 알림</BenefitText>
                        </BenefitItem>
                        <BenefitItem>
                            <BenefitEmoji>✅</BenefitEmoji>
                            <BenefitText>잔여 시간 확인 가능</BenefitText>
                        </BenefitItem>
                    </BenefitCard>

                    <CheckTitle>확인하세요!</CheckTitle>
                    <CheckList>
                        <li>필요할 때만 가볍게 이용</li>
                        <li>
                            평일 이용 2시간/4시간 선택, <strong>유효기간 1개월</strong>
                        </li>
                        <li>
                            자녀 1인 기준, 잔여 시간 <strong>분 단위 차감</strong>
                        </li>
                        <li>
                            포함 서비스: 아지트 공간 &amp; 교구 무제한 이용
                            <span style={{ color: "#6b7280" }}> (픽업 서비스 이용 불가)</span>
                        </li>
                        <li>추가 결제 항목: 간식, 유료 교구 및 프로그램</li>
                    </CheckList>
                </Body>

                <Footer>
                    <CTAButton type="button" onClick={handleCTA}>
                        타임패스 이용하기
                    </CTAButton>
                </Footer>
            </Dialog>
        </Backdrop>,
        portalEl
    );
}
