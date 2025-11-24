/* eslint-disable */
// src/components/CheckoutFamilyDialog.jsx
// 패밀리 멤버십 상세/구매 팝업 (타임패스 버전 기반)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { MEMBERSHIP_KIND } from "../constants/membershipDefine";

/* 형이 제공할 이미지 2개 — 여기에만 경로 넣어주면 됨 */
import familyFirstImg from "../assets/membership/family-first.png";
import familySecondImg from "../assets/membership/family-second.png";

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
  max-height: min(720px, 100vh - 24px);
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;

  display: grid;
  grid-template-rows: auto 1fr auto;

  font-family: "NanumSquareRound";
  box-shadow: none;
`;

/* ===== Header / Tabs ===== */
const Header = styled.div`
  background: #ffffff;
  padding: 10px 18px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
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

  &::after {
    content: "";
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: -2px;
    height: 2px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#fb923c" : "transparent")};
  }
`;

/* ===== Body ===== */
const Body = styled.div`
  padding: 22px 24px 24px;
  overflow-y: auto;
  background: #ffffff;
`;

/* ===== 공통 요소 ===== */
const Pill = styled.span`
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fb923c;
  color: white;
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
    font-weight: 700;
    margin-right: 8px;
    color: #d1d5db;
  }
`;

/* ===== 이미지 카드 영역 ===== */
const FamilyRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 26px;

  @media (max-width: 420px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FamilyCard = styled.div`
  width: 150px;
  padding: 10px 10px 14px;
  border-radius: 26px;
  border: 1px solid #f0f0f0;
  background: white;
  display: grid;
  gap: 10px;
  justify-items: center;
`;

const FamilyImg = styled.img`
  width: 100%;
  object-fit: contain;
  border-radius: 20px;
`;

const FamilyLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const FamilyPrice = styled.div`
  font-size: 14px;
  font-weight: 900;
`;

const DiscountTag = styled.div`
  font-size: 12px;
  background: #ffedd5;
  color: #fb923c;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
`;

/* ===== 혜택 ===== */
const BenefitBlock = styled.div`
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  display: grid;
  gap: 10px;
`;

const BenefitItem = styled.div`
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #374151;
`;

const Emoji = styled.span`
  font-size: 18px;
`;

/* ===== 확인 영역 ===== */
const CheckTitle = styled.div`
  margin: 24px 0 12px;
  font-weight: 900;
  font-size: 15px;
`;

const CheckList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;

  li {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.7;
  }
`;

/* ===== 구매하기 탭 ===== */
const Block = styled.div`
  margin-bottom: 18px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: white;

  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};

  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const AddChildRow = styled.div`
  margin-top: 6px;
  padding: 12px 16px;
  border-radius: 16px;
  background: #fff4e6;
  border: 1px dashed #fb923c;
  color: #c2410c;
`;

const PurchaseWrap = styled.div`
  padding: 0 18px;
`;

const BottomNote = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  background: #f3f4f6;
  border-radius: 16px;
  font-size: 12px;
  color: #4b5563;
`;

/* ===== Footer CTA ===== */
const Footer = styled.div`
  padding: 12px 22px 18px;
  border-top: 1px solid #e5e7eb;
  background: #f5f5f5;
`;

const CTAButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 999px;
  border: 0;
  background: #fb923c;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;

  transition: transform 0.1s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.05);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const ChevronDown = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
    </svg>
);

/* ===== Popup Component ===== */
export default function CheckoutFamilyDialog({
    open,
    onClose,
    onProceed,
}) {
    const [portalEl, setPortalEl] = useState(null);
    const [activeTab, setActiveTab] = useState("detail");

    const [selectedChild, setSelectedChild] = useState("선택해주세요");
    const [selectedAgit, setSelectedAgit] = useState("선택해주세요");
    const [selectedPay, setSelectedPay] = useState("선택해주세요");

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
        if (open) setActiveTab("detail");
    }, [open]);

    if (!open || !portalEl) return null;

    const handleCTA = () => {
        onProceed?.({
            product: {
                id: "family-2",
                name: "패밀리 멤버십",
                kind: MEMBERSHIP_KIND.FAMILY,
            },
            price: { total: 59900 },
        });
    };

    /* 상세 */
    const renderDetail = () => (
        <>
            <Pill>형제/자매 할인</Pill>
            <Title>패밀리 멤버십</Title>

            <SummaryList>
                <li>두 번째 자녀부터 <span style={{ color: "#fb923c", fontWeight: 900 }}>15% 할인</span></li>
                <li>자녀별 개별 관리, 동일 혜택 제공</li>
                <li>가족 모두 함께 누리는 돌봄 서비스</li>
            </SummaryList>

            <FamilyRow>
                <FamilyCard>
                    <FamilyImg src={familyFirstImg} alt="첫째" />
                    <FamilyLabel>첫째</FamilyLabel>
                    <FamilyPrice>월 59,900원</FamilyPrice>
                </FamilyCard>

                <FamilyCard>
                    <FamilyImg src={familySecondImg} alt="둘째부터" />
                    <FamilyLabel>둘째부터</FamilyLabel>
                    <FamilyPrice>월 50,915원</FamilyPrice>
                    <DiscountTag>15%↓</DiscountTag>
                </FamilyCard>
            </FamilyRow>

            <BenefitBlock>
                <BenefitItem>
                    <Emoji>🚀</Emoji> 인기 클래스 우선 신청
                </BenefitItem>
                <BenefitItem>
                    <Emoji>🛡️</Emoji> 배상책임보험 & 실시간 알림
                </BenefitItem>
                <BenefitItem>
                    <Emoji>💳</Emoji> 자동 결제 옵션으로 번거로움 최소화
                </BenefitItem>
            </BenefitBlock>

            <CheckTitle>확인하세요!</CheckTitle>
            <CheckList>
                <li>두 번째 자녀부터 15% 할인 적용 (정규 멤버십 기준)</li>
                <li>자녀별 프로필·학교 정보 등록 필요</li>
            </CheckList>
        </>
    );

    /* 구매 */
    const renderPurchase = () => (
        <PurchaseWrap>
            <Block>
                <SectionLabel>자녀 연결</SectionLabel>
                <SelectBox
                    $placeholder={selectedChild === "선택해주세요"}
                    onClick={() => alert("자녀 선택 연결 예정")}
                >
                    <span>{selectedChild}</span>
                    <ChevronDown />
                </SelectBox>
                <AddChildRow>+ 자녀 추가</AddChildRow>
            </Block>

            <Block>
                <SectionLabel>아지트</SectionLabel>
                <SelectBox
                    $placeholder={selectedAgit === "선택해주세요"}
                    onClick={() => alert("지점 선택 연결 예정")}
                >
                    <span>{selectedAgit}</span>
                    <ChevronDown />
                </SelectBox>
            </Block>

            <Block>
                <SectionLabel>결제 방식</SectionLabel>
                <SelectBox
                    $placeholder={selectedPay === "선택해주세요"}
                    onClick={() => alert("결제 방식 선택 예정")}
                >
                    <span>{selectedPay}</span>
                    <ChevronDown />
                </SelectBox>
            </Block>

            <BottomNote>
                유효기간 내 미사용 잔여분 환불/연장 불가 (약관 기준)
            </BottomNote>
        </PurchaseWrap>
    );

    return createPortal(
        <Backdrop onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <Dialog>
                <Header>
                    <HeaderTop>
                        <CloseBtn onClick={onClose}>✕</CloseBtn>
                    </HeaderTop>

                    <TabsBar>
                        <Tabs>
                            <Tab $active={activeTab === "detail"} onClick={() => setActiveTab("detail")}>
                                상세정보 확인
                            </Tab>
                            <Tab $active={activeTab === "buy"} onClick={() => setActiveTab("buy")}>
                                구매하기
                            </Tab>
                        </Tabs>
                    </TabsBar>
                </Header>

                <Body>
                    {activeTab === "detail" ? renderDetail() : renderPurchase()}
                </Body>

                <Footer>
                    <CTAButton onClick={handleCTA}>패밀리 이용하기</CTAButton>
                </Footer>
            </Dialog>
        </Backdrop>,
        portalEl
    );
}
