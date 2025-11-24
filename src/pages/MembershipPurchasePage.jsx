/* eslint-disable */
// /src/pages/MembershipPurchasePage.jsx
// Withagit — 멤버십 구매/정액권/프로그램/기타 상품 탭 구조

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import MembershipPlans from "../components/MembershipPlans";
import CheckoutChargeDialog from "../components/CheckoutChargeDialog";

import tabMembershipOn from "../assets/membership/tab-membership-on.png";
import tabMembershipOff from "../assets/membership/tab-membership-off.png";

import tabChargeOn from "../assets/membership/tab-charge-on.png";
import tabChargeOff from "../assets/membership/tab-charge-off.png";

import tabProgramOn from "../assets/membership/tab-program-on.png";
import tabProgramOff from "../assets/membership/tab-program-off.png";

import tabOthersOn from "../assets/membership/tab-others-on.png";
import tabOthersOff from "../assets/membership/tab-others-off.png";

import iconPickup from "../assets/membership/icon-pickup.png";
import iconToy from "../assets/membership/icon-toy.png";
import iconSnack from "../assets/membership/icon-snack.png";
import iconProgram from "../assets/membership/icon-program.png";

import {
  getNearestSpecialEvent,
  listMenuBySections,
  listOtherProducts,
} from "../services/snackService";

// ✅ 프로그램 실데이터 서비스
import { listPrograms } from "../services/programService";

// 색상 토큰
const accent = "var(--color-accent, #F07A2A)";
const primaryText = "#222";
const subText = "#777";
const cardBg = "#FFFFFF";
const borderSoft = "#E5E5E5";

/* ================== Layout ================== */

const Page = styled.main`
  background: #ffffff;
  min-height: 100dvh;
`;

/* ===== 페이지 안 상단 서브 탭바 ===== */

const TopTabsBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 32px 20px 0;
  background:#FFFCF4;

  @media (max-width: 768px) {
    padding: 24px 16px 0;
  }
`;

const TopTabsInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee3cf;
`;

const TopTabButton = styled.button`
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  position: relative;

  font-family: "NanumSquareRound";
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  color: ${({ $active }) => ($active ? "#222222" : "#c2c2c2")};

  &::after {
    content: "";
    position: absolute;
    left: 20%;
    right: 20%;
    bottom: 0;
    height: 3px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#f07a2a" : "transparent")};
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 8px 0 10px;
    gap: 6px;
  }
`;

const TopTabIcon = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
`;

const TopTabLabel = styled.span`
  line-height: 1.3;
`;

/* ===== 공통 섹션 래퍼 ===== */

const Section = styled.section`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${({ $pt = 80, $pb = 80 }) => `${$pt}px 20px ${$pb}px`};

  @media (max-width: 768px) {
    padding: ${({ $pt = 56, $pb = 56 }) => `${$pt}px 16px ${$pb}px`};
  }
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  line-height: 1.3;
  text-align: center;
  color: ${primaryText};
  margin: 0 0 12px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  color: ${subText};
  margin: 0 0 40px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

/* ===== 정액권 전체 래퍼 ===== */

const ChargeSectionWrap = styled.section`
  max-width: 1120px;
  margin: 30px auto;
  padding: 64px 20px 80px;
  background: #f7f8fc;
  border-radius: 40px;
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 40px 16px 48px;
    border-radius: 28px;
  }
`;

const ChargeSectionInner = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 980px;
  margin: 0 auto;
  transform: translateX(24px);

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
    gap: 28px;
    max-width: 100%;
    transform: none;
  }
`;

/* ===== 왼쪽 2×2 아이콘 그리드 ===== */

const IconGrid = styled.div`
  flex: 0 0 45%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;

  @media (max-width: 960px) {
    flex: 1 1 auto;
  }

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const IconCard = styled.div`
  width: 100%;
  margin: 0;

  background: #ffffff;
  border-radius: 40px;
  padding: 40px 32px;
  box-shadow: 0 10px 26px rgba(15, 35, 75, 0.04);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  @media (max-width: 768px) {
    border-radius: 28px;
    padding: 28px 22px;
  }
`;

const IconImage = styled.img`
  width: 96px;
  height: auto;
  display: block;

  @media (max-width: 768px) {
    width: 84px;
  }
`;

const IconTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #222;
  text-align: center;
  letter-spacing: -0.02em;
`;

/* ===== 오른쪽 정액권 설명 영역 ===== */

const ChargePanel = styled.div`
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 8px 8px 24px;

  @media (max-width: 960px) {
    flex: 1 1 auto;
    padding: 0;
  }

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const ChargeTitle = styled.h3`
  margin: 0 0 20px;
  font-size: 38px;
  font-weight: 900;
  color: #222;
  letter-spacing: -0.03em;

  @media (max-width: 960px) {
    font-size: 34px;
  }

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const ChargeTitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 4px 10px 10px;

  &::before {
    content: "";
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 6px;
    height: 22px;
    background: #ffd87a;
    border-radius: 999px;
    z-index: -1;
  }
`;

const ChargeSubtitle = styled.p`
  margin: 0 0 32px;
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  max-width: 360px;

  @media (max-width: 768px) {
    font-size: 14px;
    max-width: none;
  }
`;

const ChargeButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  min-width: 220px;
  width: 60%;
  border-radius: 999px;
  border: none;
  outline: none;
  background: #f07a2a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  transition: transform 0.08s ease-out, box-shadow 0.08s ease-out;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 22px rgba(240, 122, 42, 0.35);
  }

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const PrimaryButton = styled.button`
  align-self: flex-end;
  min-width: 160px;
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;

  color: #111;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.08s ease-out, box-shadow 0.08s ease-out;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  @media (max-width: 768px) {
    align-self: center;
  }
`;

/* ============ 프로그램/기타 상품 카드 ============ */

const CardsRow = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const ProgramCard = styled.div`
  border-radius: 16px;
  background: ${cardBg};
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ProgramThumb = styled.div`
  width: 100%;
  padding-top: 62%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const ProgramBody = styled.div`
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProgramBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $tone = "accent" }) =>
    $tone === "accent" ? "rgba(240, 122, 42, 0.12)" : "#eee"};
  color: ${({ $tone = "accent" }) => ($tone === "accent" ? accent : "#666")};
`;

const ProgramTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${primaryText};
`;

const ProgramMeta = styled.div`
  font-size: 12px;
  color: ${subText};
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
`;

const ProgramPriceRow = styled.div`
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${primaryText};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Muted = styled.span`
  font-size: 11px;
  color: ${subText};
`;

const SectionGrayBg = styled.div`
  background: #f5f5f5;
`;

const OtherHeaderRow = styled.div`
  margin: 24px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CarouselControls = styled.div`
  display: flex;
  gap: 8px;
`;

const RoundNavButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  color: #555;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);

  &:disabled {
    opacity: 0.35;
    cursor: default;
    box-shadow: none;
  }
`;

const CarouselPageIndicator = styled.div`
  margin-top: 10px;
  text-align: right;
  font-size: 12px;
  color: ${subText};
`;

/* ============ FAQ 섹션 ============ */

const FaqList = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FaqItem = styled.div`
  width: 100%;
  max-width: 980px;
  padding: 18px 28px;
  border-radius: 18px;
  background: ${({ $tone = "gray" }) =>
    $tone === "white" ? "#ffffff" : "#f7f7f7"};
  border: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 12px;
  row-gap: 6px;
  font-size: 15px;
  color: ${primaryText};

  @media (max-width: 768px) {
    padding: 14px 18px;
    border-radius: 14px;
    font-size: 14px;
  }
`;

const FaqQ = styled.div`
  font-weight: 700;
  font-size: 16px;
`;

const FaqA = styled.div`
  grid-column: 2 / 3;
  color: ${subText};
  font-size: 14px;
  line-height: 1.7;
`;

const FaqItemWhite = styled(FaqItem)`
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 32px;

  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

/* ===== 프로그램 예약 탭 전용 레이아웃 ===== */

const ProgramPageWrap = styled.section`
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 80px;

  @media (max-width: 768px) {
    padding: 32px 16px 64px;
  }
`;

const ProgramHeader = styled.div`
  text-align: left;
`;

const ProgramHeaderTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.3;
  color: ${primaryText};

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const ProgramHeaderSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: ${subText};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ProgramLayout = styled.div`
  margin-top: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  column-gap: 40px;
  align-items: flex-start;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 24px;
  }
`;

/* ----- 왼쪽 상세 영역 ----- */

const ProgramDetailShell = styled.div`
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  padding: 24px 24px 28px;
  box-sizing: border-box;

  /* ✅ 높이 고정 + 내부 스크롤 */
  max-height: 850px;       /* 필요하면 600~700 선에서 수치 조절 */
  overflow-y: auto;

  @media (max-width: 768px) {
    border-radius: 24px;
    padding: 20px 18px 24px;
    max-height: none;      /* 모바일에서는 전체 스크롤로 풀어줄 수도 있음 */
    overflow-y: visible;
  }
`;

const DetailShellTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${primaryText};
  margin-bottom: 6px;
`;

const DetailShellMeta = styled.div`
  font-size: 13px;
  color: ${subText};
  margin-bottom: 18px;
`;

const DetailHeroImage = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 24px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #e9e9e9;
  margin-bottom: 16px;
`;


const DetailPageImage = styled.div`
  width: 100%;
  max-height: 450px;        /* ProgramDetailShell 안에서만 스크롤 */
  border-radius: 18px;
  background-color: #f3f3f3;
  overflow-y: auto;
  padding: 8px;
  box-sizing: border-box;
`;

const DetailPageImageInner = styled.img`
  width: 100%;
  display: block;
  border-radius: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;


/* ----- 오른쪽 예약 패널 ----- */

const BookingSidebarShell = styled.div`
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  padding: 20px 20px 24px;
  min-height: 420px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    border-radius: 20px;
    padding: 18px 16px 22px;
  }
`;

const BookingSection = styled.div`
  & + & {
    margin-top: 20px;
  }
`;

const BookingSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${primaryText};
  margin-bottom: 8px;
`;

/* ----- 달력 박스 ----- */

const CalendarBox = styled.div`
  border-radius: 18px;
  border: 1px solid #eee2cf;
  background: #fff;
  padding: 16px 18px 14px;
  box-sizing: border-box;
`;

const CalendarHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  color: ${primaryText};
`;

const CalendarMonthLabel = styled.span`
  font-weight: 700;
`;

const CalendarNav = styled.div`
  display: flex;
  gap: 4px;
  font-size: 12px;
`;

const CalendarNavButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: transparent;
  cursor: default;
  color: #bbb;
`;

const CalendarWeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 11px;
  color: #b3b3b3;
  margin-bottom: 6px;
`;

const CalendarWeekCell = styled.div`
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 6px;
  column-gap: 0;
`;
const CalendarDayCell = styled.button`
  border: none;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  padding: 6px 0 4px;
  text-align: center;
  font-size: 12px;
  position: relative;
  box-sizing: border-box;
  border-radius: 999px;

  background: ${({ $isSelected, $isAvailable }) =>
    $isSelected
      ? "#0003"
      : $isAvailable
        ? "rgba(240,122,42,0.06)"   // 프로그램 있는 날 배경 살짝 강조
        : "transparent"};

  color: ${({ $isSelected, $isAvailable }) =>
    $isSelected ? "#ffffff" : $isAvailable ? "#222222" : "#c8c8c8"}; // 없는 날은 연한 회색
`;

const CalendarDayNumber = styled.div`
  line-height: 1.3;
`;

const CalendarHint = styled.p`
  margin: 8px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: ${subText};
`;

/* ----- 시간 슬롯 리스트 ----- */

const TimeSlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimeSlotItem = styled.button`
  width: 100%;
  border-radius: 999px;
  border: 1px solid
    ${({ $active, $closed }) =>
    $closed ? "#e0e0e0" : $active ? accent : "#e5e5e5"};
  background: ${({ $active, $closed }) =>
    $closed ? "#f7f7f7" : $active ? "rgba(240,122,42,0.06)" : "#ffffff"};
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ $closed }) => ($closed ? "default" : "pointer")};
  opacity: ${({ $closed }) => ($closed ? 0.45 : 1)};
`;

const TimeSlotTime = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${primaryText};
`;

const TimeSlotMeta = styled.span`
  font-size: 11px;
  color: ${subText};
`;

/* ----- 프로그램 리스트 / 자녀 / 버튼 ----- */

const BookingProgramList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BookingProgramItem = styled.button`
  width: 100%;
  border: 1px solid
    ${({ $active }) => ($active ? accent : "rgba(0, 0, 0, 0.06)")};
  background: ${({ $active }) =>
    $active ? "rgba(240, 122, 42, 0.06)" : "#fff"};
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
`;

const BookingProgramThumb = styled.div`
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
`;

const BookingProgramContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BookingProgramTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${primaryText};
  margin-bottom: 2px;
`;

const BookingProgramMeta = styled.div`
  font-size: 11px;
  color: ${subText};
`;

const BookingProgramPrice = styled.div`
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: ${primaryText};
`;

const BookingChildPlaceholder = styled.div`
  border-radius: 14px;
  background: #f7f7f7;
  height: 64px;
`;

const BookingSubmitButton = styled.button`
  margin-top: 24px;
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: #f07a2a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

const ChildList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChildItem = styled.button`
  width: 100%;
  border: 1px solid
    ${({ $active }) => ($active ? "#f07a2a" : "rgba(0,0,0,0.06)")};
  background: ${({ $active }) =>
    $active ? "rgba(240,122,42,0.06)" : "#ffffff"};
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const ChildInfo = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #222;
`;

const ChildBirth = styled.div`
  font-size: 11px;
  color: #777;
`;

const ChildAddButton = styled.button`
  width: 100%;
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed #bbb;
  background: #fff;
  font-size: 13px;
  color: #777;
  cursor: pointer;
`;

/* ================== Mock Data ================== */

const ICON_ITEMS = [
  { key: "pickup", title: "픽업비용", img: iconPickup },
  { key: "toy", title: "유료 교구", img: iconToy },
  { key: "snack", title: "간식", img: iconSnack },
  { key: "program", title: "프로그램 예약", img: iconProgram },
];

const FAQ_ITEMS = [
  {
    q: "프로그램 예약은 언제까지 취소할 수 있나요?",
    a: "예약 후 24시간 전까지는 무료 취소가 가능합니다.",
  },
  {
    q: "정액권으로도 프로그램을 예약할 수 있나요?",
    a: "정액권 잔액이 있을 경우, 프로그램 결제 시 함께 사용할 수 있습니다.",
  },
  {
    q: "결제 중인데 잔여석이 없어졌다고 나와요. 왜 그런가요?",
    a: "프로그램 잔여석은 실시간으로 변동될 수 있어, 동시에 결제하는 다른 보호자에 의해 마감될 수 있습니다.",
  },
];

const TOP_TABS = [
  {
    key: "membership",
    label: "멤버십 구매",
    activeIcon: tabMembershipOn,
    inactiveIcon: tabMembershipOff,
  },
  {
    key: "charge",
    label: "정액권 충전",
    activeIcon: tabChargeOn,
    inactiveIcon: tabChargeOff,
  },
  {
    key: "program",
    label: "프로그램 예약",
    activeIcon: tabProgramOn,
    inactiveIcon: tabProgramOff,
  },
  {
    key: "others",
    label: "기타 상품",
    activeIcon: tabOthersOn,
    inactiveIcon: tabOthersOff,
  },
];

/* ================== Helper ================== */

function formatKRW(n) {
  const v = Number(n || 0);
  return `₩${v.toLocaleString()}`;
}

/* ================== Component ================== */

export default function MembershipPurchasePage() {
  const [topTab, setTopTab] = useState("membership");

  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgPayload, setDlgPayload] = useState(null);

  const nav = useNavigate();

  const [otherProducts, setOtherProducts] = useState([]);

  // 프로그램 실데이터
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const items = await listOtherProducts({ limit: 30 });
        if (!alive) return;
        setOtherProducts(items);
      } catch (e) {
        console.error("[MembershipPurchase] listOtherProducts error", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 프로그램 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setProgramsLoading(true);
        const list = await listPrograms();
        if (!alive) return;
        // 노출 활성화된 것만
        const filtered = list.filter((p) => p.isActive);
        setPrograms(filtered);
      } catch (e) {
        console.error("[MembershipPurchase] listPrograms error", e);
        if (!alive) return;
        setProgramsError("프로그램 정보를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setProgramsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== 기타 상품(3개씩 슬라이드)용 상태 =====
  const OTHER_PAGE_SIZE = 3;
  const [otherPage, setOtherPage] = useState(0);

  const otherPageCount = Math.ceil(otherProducts.length / OTHER_PAGE_SIZE) || 1;
  const safeOtherPage =
    otherPage >= otherPageCount ? otherPageCount - 1 : otherPage;

  const otherStartIndex = safeOtherPage * OTHER_PAGE_SIZE;
  const otherPageItems = otherProducts.slice(
    otherStartIndex,
    otherStartIndex + OTHER_PAGE_SIZE
  );

  const handleOtherPrev = () => {
    if (otherPageCount <= 1) return;
    setOtherPage((p) => (p - 1 + otherPageCount) % otherPageCount);
  };

  const handleOtherNext = () => {
    if (otherPageCount <= 1) return;
    setOtherPage((p) => (p + 1) % otherPageCount);
  };

  const handleChargeClick = () => {
    setChargeDialogOpen(true);
  };

  const handleOtherProductsClick = () => {
    nav("/snack");
  };

  function MembershipTabSection() {
    return (
      <Section $pt={72} $pb={72}>
        <SectionTitle>멤버십 구매</SectionTitle>
        <SectionSubtitle>
          가족의 라이프스타일에 맞는 멤버십을 선택해보세요.
        </SectionSubtitle>
        <MembershipPlans />
      </Section>
    );
  }

  function ChargeTabSection() {
    return (
      <ChargeSectionWrap>
        <ChargeSectionInner>
          <IconGrid>
            {ICON_ITEMS.map((item) => (
              <IconCard key={item.key}>
                <IconImage src={item.img} alt={item.title} />
                <IconTitle>{item.title}</IconTitle>
              </IconCard>
            ))}
          </IconGrid>

          <ChargePanel>
            <ChargeTitle>
              <ChargeTitleHighlight>정액권 충전하기</ChargeTitleHighlight>
            </ChargeTitle>
            <ChargeSubtitle>
              원하는 금액만큼 충전해두고,
              <br />
              픽업/간식/프로그램에서 편리하게 사용해보세요.
            </ChargeSubtitle>

            <ChargeButton type="button" onClick={handleChargeClick}>
              충전하러 가기
            </ChargeButton>
          </ChargePanel>
        </ChargeSectionInner>
      </ChargeSectionWrap>
    );
  }

  const CHILDREN = [
    { id: "c1", name: "김나나", birth: "2022-02-22" },
    { id: "c2", name: "김다다", birth: "2022-02-22" },
  ];

  function ProgramTabSection({ programs, loading, error }) {
    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null); // yyyy-mm-dd
    const [selectedTimeId, setSelectedTimeId] = useState(null);
    const [selectedChild, setSelectedChild] = useState(null);

    // 프로그램/날짜/시간 초기 선택
    useEffect(() => {
      if (!programs || !programs.length) return;
      const first = programs[0];
      setSelectedProgramId(first.id);
      const firstDate = first.dateSlots?.[0]?.date || null;
      setSelectedDate(firstDate);
      const firstTime = first.dateSlots?.[0]?.timeSlots?.[0] || null;
      setSelectedTimeId(firstTime?.id || null);
    }, [programs]);

    const selectedProgram =
      programs.find((p) => p.id === selectedProgramId) || null;

    const dateSlots = selectedProgram?.dateSlots || [];

    // 캘린더 기준 년/월
    let calendarYear;
    let calendarMonth;
    if (dateSlots.length && dateSlots[0].date) {
      const [y, m] = dateSlots[0].date.split("-");
      calendarYear = parseInt(y, 10);
      calendarMonth = parseInt(m, 10);
    } else {
      const now = new Date();
      calendarYear = now.getFullYear();
      calendarMonth = now.getMonth() + 1;
    }

    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const availableDays = dateSlots
      .map((ds) => {
        if (!ds.date) return null;
        const [y, m, d] = ds.date.split("-");
        if (
          parseInt(y, 10) === calendarYear &&
          parseInt(m, 10) === calendarMonth
        ) {
          return parseInt(d, 10);
        }
        return null;
      })
      .filter((d) => d != null);

    const selectedDayNumber = selectedDate
      ? parseInt(selectedDate.split("-")[2] || "0", 10)
      : null;

    const availableText = dateSlots
      .map((ds) => {
        if (!ds.date) return null;
        const [, , d] = ds.date.split("-");
        return `${parseInt(d, 10)}일`;
      })
      .filter(Boolean)
      .join(", ");



    // 현재 선택된 날짜에 해당하는 dateSlot
    const currentDateSlot =
      dateSlots.find((ds) => ds.date === selectedDate) || null;

    // 그 날짜의 시간대만 사용
    const timeSlots = currentDateSlot?.timeSlots || [];

    const handleSelectProgram = (programId) => {
      const p = programs.find((pr) => pr.id === programId);
      setSelectedProgramId(programId);
      if (p) {
        const firstDate = p.dateSlots?.[0]?.date || null;
        setSelectedDate(firstDate);
        const firstTime = p.dateSlots?.[0]?.timeSlots?.[0] || null;
        setSelectedTimeId(firstTime?.id || null);
      }
    };
    const handleClickDay = (day) => {
      if (!selectedProgram) return;

      // 선택 월/연도 기준으로 dateSlots 중 해당 날짜 찾기
      const match = (selectedProgram.dateSlots || []).find((ds) => {
        if (!ds.date) return false;
        const [y, m, d] = ds.date.split("-");
        return (
          parseInt(y, 10) === calendarYear &&
          parseInt(m, 10) === calendarMonth &&
          parseInt(d, 10) === day
        );
      });

      if (!match) return;

      setSelectedDate(match.date);

      const firstTime = match.timeSlots?.[0] || null;
      setSelectedTimeId(firstTime?.id || null);
    };

    if (loading) {
      return (
        <ProgramPageWrap>
          <ProgramHeader>
            <ProgramHeaderTitle>프로그램 예약하기</ProgramHeaderTitle>
            <ProgramHeaderSubtitle>
              프로그램 정보를 불러오는 중입니다...
            </ProgramHeaderSubtitle>
          </ProgramHeader>
        </ProgramPageWrap>
      );
    }

    if (error) {
      return (
        <ProgramPageWrap>
          <ProgramHeader>
            <ProgramHeaderTitle>프로그램 예약하기</ProgramHeaderTitle>
            <ProgramHeaderSubtitle>{error}</ProgramHeaderSubtitle>
          </ProgramHeader>
        </ProgramPageWrap>
      );
    }

    if (!programs.length) {
      return (
        <ProgramPageWrap>
          <ProgramHeader>
            <ProgramHeaderTitle>프로그램 예약하기</ProgramHeaderTitle>
            <ProgramHeaderSubtitle>
              현재 예약 가능한 프로그램이 없습니다.
            </ProgramHeaderSubtitle>
          </ProgramHeader>
        </ProgramPageWrap>
      );
    }

    return (
      <ProgramPageWrap>
        <ProgramHeader>
          <ProgramHeaderTitle>프로그램 예약하기</ProgramHeaderTitle>
          <ProgramHeaderSubtitle>
            주말·방학에 진행되는 특별 프로그램을 한눈에 확인하고
            <br />
            날짜와 시간을 선택해 예약할 수 있어요.
          </ProgramHeaderSubtitle>
        </ProgramHeader>

        <ProgramLayout>
          {/* 왼쪽: 프로그램 상세 영역 */}
          <ProgramDetailShell>
            <DetailShellTitle>
              {selectedProgram ? selectedProgram.title : "프로그램 상세"}
            </DetailShellTitle>
            <DetailShellMeta>
              {selectedProgram?.description
                ? selectedProgram.description
                : selectedProgram
                  ? `총 정원 ${selectedProgram.totalCapacity || 0}명 · 현재 예약 ${selectedProgram.totalReserved || 0
                  }명`
                  : "프로그램 정보를 불러오는 중입니다."}
            </DetailShellMeta>

            {/* 메인 이미지 */}
            <DetailHeroImage
              style={
                selectedProgram?.heroImageUrl
                  ? {
                    backgroundImage: `url("${selectedProgram.heroImageUrl}")`,
                  }
                  : undefined
              }
            />

            {/* 상세 이미지 중 첫 장 */}
            <DetailPageImage>
              {(selectedProgram?.detailImageUrls || []).map((url, idx) => (
                <DetailPageImageInner
                  key={`${url}-${idx}`}
                  src={url}
                  alt={`${selectedProgram?.title || "프로그램 상세"}-${idx + 1}`}
                />
              ))}
            </DetailPageImage>

          </ProgramDetailShell>

          {/* 오른쪽: 예약 패널 */}
          <BookingSidebarShell>
            {/* 1) 날짜 선택 */}
            <BookingSection>
              <BookingSectionTitle>날짜를 선택해주세요</BookingSectionTitle>

              <CalendarBox>
                <CalendarHeaderRow>
                  <CalendarMonthLabel>
                    {calendarYear}년 {calendarMonth}월
                  </CalendarMonthLabel>
                  <CalendarNav>
                    <CalendarNavButton type="button">‹</CalendarNavButton>
                    <CalendarNavButton type="button">›</CalendarNavButton>
                  </CalendarNav>
                </CalendarHeaderRow>

                <CalendarWeekRow>
                  {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                    <CalendarWeekCell key={d}>{d}</CalendarWeekCell>
                  ))}
                </CalendarWeekRow>
                <CalendarGrid>
                  {days.map((day) => {
                    const isAvailable = availableDays.includes(day);  // 해당 달에 프로그램 있는 날
                    const isSelected = selectedDayNumber === day;

                    return (
                      <CalendarDayCell
                        key={day}
                        type="button"
                        $isSelected={isSelected}
                        $isAvailable={isAvailable}
                        $clickable={isAvailable}
                        onClick={() => {
                          if (!isAvailable) return;     // 프로그램 없는 날은 클릭 무시
                          handleClickDay(day);         // 아래에서 정의
                        }}
                      >
                        <CalendarDayNumber>{day}</CalendarDayNumber>
                      </CalendarDayCell>
                    );
                  })}
                </CalendarGrid>
              </CalendarBox>

              <CalendarHint>
                이 프로그램의 <strong>예약 가능일</strong>은{" "}
                <strong>{availableText || "미설정"}</strong> 입니다.
              </CalendarHint>
            </BookingSection>

            {/* 2) 시간 선택 */}
            <BookingSection>
              <BookingSectionTitle>시간을 선택해주세요</BookingSectionTitle>
              {timeSlots.length === 0 ? (
                <BookingChildPlaceholder />
              ) : (
                <TimeSlotList>
                  {timeSlots.map((slot, idx) => {
                    const slotId = slot.id || `${currentDateSlot.date}-${idx}`;
                    const capacity = Number(slot.capacity || 0);
                    const reserved = Number(slot.reserved || 0);
                    const remain =
                      capacity > 0 ? Math.max(capacity - reserved, 0) : null;
                    const closed = capacity > 0 ? remain === 0 : false;
                    const meta = closed
                      ? "마감"
                      : remain != null
                        ? `잔여 ${remain}석`
                        : "";

                    const active = selectedTimeId === slotId;

                    return (
                      <TimeSlotItem
                        key={slotId}
                        type="button"
                        $active={active}
                        $closed={closed}
                        onClick={() => {
                          if (closed) return;
                          setSelectedTimeId(slotId);
                        }}
                      >
                        <TimeSlotTime>{slot.label}</TimeSlotTime>
                        <TimeSlotMeta>{meta}</TimeSlotMeta>
                      </TimeSlotItem>
                    );
                  })}
                </TimeSlotList>
              )}
            </BookingSection>


            {/* 3) 프로그램 선택 리스트 */}
            <BookingSection>
              <BookingSectionTitle>프로그램을 선택해주세요</BookingSectionTitle>
              <BookingProgramList>
                {programs.map((p) => {
                  const active = p.id === selectedProgramId;
                  const firstSlot = p.dateSlots?.[0] || null;
                  const firstTime = firstSlot?.timeSlots?.[0] || null;
                  const meta = firstSlot
                    ? `${firstSlot.date}${firstTime ? ` · ${firstTime.label}` : ""
                    }`
                    : "운영일 미설정";
                  const capacity = Number(p.totalCapacity || 0);
                  const reserved = Number(p.totalReserved || 0);
                  const remain =
                    capacity > 0 ? Math.max(capacity - reserved, 0) : null;
                  const remainText =
                    remain != null ? `잔여 ${remain}명` : "";

                  return (
                    <BookingProgramItem
                      key={p.id}
                      type="button"
                      $active={active}
                      onClick={() => handleSelectProgram(p.id)}
                    >
                      <BookingProgramThumb
                        style={
                          p.heroImageUrl
                            ? { backgroundImage: `url("${p.heroImageUrl}")` }
                            : undefined
                        }
                      />
                      <BookingProgramContent>
                        <BookingProgramTitle>{p.title}</BookingProgramTitle>
                        <BookingProgramMeta>{meta}</BookingProgramMeta>
                        <BookingProgramPrice>
                          {formatKRW(p.priceKRW)}{" "}
                          {remainText && `· ${remainText}`}
                        </BookingProgramPrice>
                      </BookingProgramContent>
                    </BookingProgramItem>
                  );
                })}
              </BookingProgramList>
            </BookingSection>

            {/* 4) 자녀 선택 – 더미 */}
            <BookingSection>
              <BookingSectionTitle>자녀 선택</BookingSectionTitle>
              <ChildList>
                {CHILDREN.map((child) => {
                  const active = child.id === selectedChild;
                  return (
                    <ChildItem
                      key={child.id}
                      type="button"
                      $active={active}
                      onClick={() => setSelectedChild(child.id)}
                    >
                      <div>
                        <ChildInfo>{child.name}</ChildInfo>
                        <ChildBirth>{child.birth}</ChildBirth>
                      </div>
                    </ChildItem>
                  );
                })}

                <ChildAddButton type="button">+ 자녀 추가</ChildAddButton>
              </ChildList>
            </BookingSection>

            {/* 5) 예약 버튼 (아직 실제 예약 로직 X) */}
            <BookingSubmitButton type="button">
              예약하기
            </BookingSubmitButton>
          </BookingSidebarShell>
        </ProgramLayout>
      </ProgramPageWrap>
    );
  }

  function OthersTabSection() {
    return (
      <SectionGrayBg>
        <Section $pt={24} $pb={96}>
          <SectionTitle>기타 상품 이용하기</SectionTitle>
          <SectionSubtitle>
            다양한 상품을 정액권과 함께 편하게 이용해보세요.
          </SectionSubtitle>

          <OtherHeaderRow>
            <PrimaryButton type="button" onClick={handleOtherProductsClick}>
              상품 보러 가기
            </PrimaryButton>

            {otherPageCount > 1 && (
              <CarouselControls>
                <RoundNavButton
                  type="button"
                  onClick={handleOtherPrev}
                  aria-label="이전 상품"
                >
                  ‹
                </RoundNavButton>
                <RoundNavButton
                  type="button"
                  onClick={handleOtherNext}
                  aria-label="다음 상품"
                >
                  ›
                </RoundNavButton>
              </CarouselControls>
            )}
          </OtherHeaderRow>

          <CardsRow>
            {otherPageItems.map((p) => (
              <ProgramCard key={`${p.key}-other`}>
                <ProgramThumb
                  style={{
                    backgroundImage: `url("${p.thumb}")`,
                  }}
                />
                <ProgramBody>
                  <ProgramBadgeRow>
                    <Badge $tone="neutral">기타 상품</Badge>
                  </ProgramBadgeRow>
                  <ProgramTitle>{p.title}</ProgramTitle>
                  <ProgramMeta>
                    <span>{p.place}</span>
                    <span>·</span>
                    <span>{p.time}</span>
                  </ProgramMeta>
                  <ProgramPriceRow>
                    <span>{p.price}</span>
                    <Muted>{p.remain}</Muted>
                  </ProgramPriceRow>
                </ProgramBody>
              </ProgramCard>
            ))}
          </CardsRow>

          <CarouselPageIndicator>
            {otherPageCount > 0 && (
              <span>
                {safeOtherPage + 1} / {otherPageCount}
              </span>
            )}
          </CarouselPageIndicator>

          <FaqList>
            {FAQ_ITEMS.map((item, idx) => (
              <FaqItemWhite key={`other-${idx}`}>
                <FaqQ>Q.</FaqQ>
                <div>{item.q}</div>
                <FaqA>{item.a}</FaqA>
              </FaqItemWhite>
            ))}
          </FaqList>
        </Section>
      </SectionGrayBg>
    );
  }

  return (
    <Page>
      {/* 상단 서브 탭바 */}
      <TopTabsBar>
        <TopTabsInner>
          {TOP_TABS.map((tab) => {
            const isActive = topTab === tab.key;
            const iconSrc = isActive ? tab.activeIcon : tab.inactiveIcon;

            return (
              <TopTabButton
                key={tab.key}
                type="button"
                $active={isActive}
                onClick={() => setTopTab(tab.key)}
              >
                <TopTabIcon src={iconSrc} alt={tab.label} />
                <TopTabLabel>{tab.label}</TopTabLabel>
              </TopTabButton>
            );
          })}
        </TopTabsInner>
      </TopTabsBar>

      {/* 탭별 본문 렌더링 */}
      {topTab === "membership" && <MembershipTabSection />}
      {topTab === "charge" && <ChargeTabSection />}
      {topTab === "program" && (
        <ProgramTabSection
          programs={programs}
          loading={programsLoading}
          error={programsError}
        />
      )}
      {topTab === "others" && <OthersTabSection />}

      {/* 정액권 충전 다이얼로그 (탭과 무관하게 공통) */}
      <CheckoutChargeDialog
        open={chargeDialogOpen}
        onClose={() => setChargeDialogOpen(false)}
        onProceed={(payload) => {
          const buyerDefault = {
            name: (profile?.displayName || "").trim(),
            phoneE164: (phoneE164 || "").trim(),
            email: (profile?.email || "").trim(),
          };

          setDlgPayload({
            ...payload,
            buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
          });

          setChargeDialogOpen(false);
          setDlgOpen(true);
        }}
      />
    </Page>
  );
}
