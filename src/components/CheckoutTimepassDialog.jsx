/* eslint-disable */
// src/components/CheckoutTimepassDialog.jsx
// 타임패스 상세/구매 안내 모달 (상세정보/구매하기 탭, 내용 스크롤 + 하단 CTA 고정)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
  width: min(460px, 100vw - 24px);          /* 형이 줄여놓은 폭 */
  max-height: min(720px, 100vh - 24px);    /* 높이 제한 */
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow: none;                        /* 그림자 제거 (플랫) */
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
  background: #ffffff;
  overflow-y: auto;
`;

/* ===== 상세정보 탭 스타일 ===== */
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
/* ===== 2시간권 / 4시간권 이미지 카드 (선택 기능 제거 버전) ===== */

const PassRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 420px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PassCard = styled.div`
  width: 150px;
  padding: 10px 10px 14px;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 10px;
  justify-items: center;
  box-shadow: none;
`;

const PassImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 20px;
  object-fit: contain;
`;

const PassLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  text-align: center;
`;

const PassPrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  text-align: center;
`;




const BenefitCard = styled.div`
  margin-top: 4px;
  padding: 14px 16px 12px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: none; /* 그림자 제거 */
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

/* ===== 구매하기 탭 스타일 ===== */
const SectionLabel = styled.div`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const Block = styled.div`
  margin-bottom: 18px;
`;

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
  cursor: pointer;
`;

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
  </svg>
);

const AddChildRow = styled.div`
  margin-top: 6px;
  border-radius: 16px;
  border: 1px dashed #facc15;
  background: #fff9e6;
  padding: 12px 16px;
  font-size: 14px;
  color: #92400e;
`;

const BottomNoteWrap = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f3f4f6;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.7;
`;

const RowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* ===== Footer CTA ===== */
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
  box-shadow: none;
  transition: transform 0.1s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.03);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const PurchaseWrap = styled.div`
  padding: 0 18px;   /* 구매하기 탭 전용 좌우 패딩 */
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
  const [activeTab, setActiveTab] = useState("detail");
  const [selectedKey, setSelectedKey] = useState("2h");

  // 구매하기 탭용 간단 state (나중에 CheckoutConfirmDialog 로직 연결 예정)
  const [selectedChildLabel, setSelectedChildLabel] = useState("선택해주세요");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("선택해주세요");
  const [selectedAgitLabel, setSelectedAgitLabel] = useState("선택해주세요");
  const [selectedMethodLabel, setSelectedMethodLabel] = useState("선택해주세요");

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
    setActiveTab("detail");
  }, [open]);

  if (!open || !portalEl) return null;

  const selected =
    TIMEPASS_OPTIONS.find((o) => o.key === selectedKey) || TIMEPASS_OPTIONS[0];

  const handleCTA = () => {
    // 지금은 detail/구매하기 탭 모두 같은 CTA를 사용 (타임패스 이용하기)
    // 나중에 구매하기 탭에서 직접 Checkout 로직으로 바꾸면 됨
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

  const renderDetail = () => (
    <>
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
        <PassCard>
          <PassImage src={twohourimg} alt="2시간권" />
          <PassLabel>2시간권</PassLabel>
          <PassPrice>25,000원</PassPrice>
        </PassCard>

        <PassCard>
          <PassImage src={fourhourimg} alt="4시간권" />
          <PassLabel>4시간권</PassLabel>
          <PassPrice>45,000원</PassPrice>
        </PassCard>
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
    </>
  );

  const renderPurchase = () => (
    <PurchaseWrap>
      <Block>
        <SectionLabel>자녀 연결</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={selectedChildLabel === "선택해주세요"}
          onClick={() => {
            // TODO: 자녀 선택 드롭다운 연결 (지금은 더미)
            alert("자녀 선택 드롭다운은 나중에 연결할게!");
          }}
        >
          <span>{selectedChildLabel}</span>
          <ChevronDown />
        </SelectBox>
        <AddChildRow>+ 자녀 추가</AddChildRow>
      </Block>

      <Block>
        <SectionLabel>옵션</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={selectedOptionLabel === "선택해주세요"}
          onClick={() => {
            // TODO: 옵션 선택 (2시간권/4시간권) 연결
            setSelectedOptionLabel(
              selectedKey === "2h" ? "2시간권 (25,000원)" : "4시간권 (45,000원)"
            );
          }}
        >
          <span>{selectedOptionLabel}</span>
          <ChevronDown />
        </SelectBox>
      </Block>

      <Block>
        <SectionLabel>아지트</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={selectedAgitLabel === "선택해주세요"}
          onClick={() => {
            // TODO: 아지트 지점 선택 드롭다운 연결
            alert("아지트 지점 선택은 나중에 연결할게!");
          }}
        >
          <span>{selectedAgitLabel}</span>
          <ChevronDown />
        </SelectBox>
      </Block>

      <Block>
        <SectionLabel>결제방식</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={selectedMethodLabel === "선택해주세요"}
          onClick={() => {
            // TODO: 결제수단 선택 드롭다운 연결
            alert("결제방식 선택은 나중에 연결할게!");
          }}
        >
          <span>{selectedMethodLabel}</span>
          <ChevronDown />
        </SelectBox>
      </Block>

      <Block>
        <RowBetween>
          <SectionLabel>확인하세요!</SectionLabel>
          <button
            type="button"
            style={{
              border: "0",
              background: "transparent",
              fontSize: 12,
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            이용약관/환불정책 보기
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path
                fill="#9ca3af"
                d="M9.29 6.71L13.17 10.59 9.29 14.46 10.71 15.88 15.99 10.59 10.71 5.29 9.29 6.71Z"
              />
            </svg>
          </button>
        </RowBetween>

        <BottomNoteWrap>
          유효기간 내 미사용 잔여분 환불/연장 불가 (약관 기준)
        </BottomNoteWrap>
      </Block>
    </PurchaseWrap>
  );

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
              <Tab
                $active={activeTab === "detail"}
                onClick={() => setActiveTab("detail")}
              >
                상세정보 확인
              </Tab>
              <Tab
                $active={activeTab === "buy"}
                onClick={() => setActiveTab("buy")}
              >
                구매하기
              </Tab>
            </Tabs>
          </TabsBar>
        </Header>

        <Body>
          {activeTab === "detail" ? renderDetail() : renderPurchase()}
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
