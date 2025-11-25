/* eslint-disable */
// /src/pages/MembershipPurchasePage.jsx
// Withagit — 멤버십/정액권/프로그램/기타 상품 + 프로그램 상세(같은 페이지 하단 노출)

import React, { useEffect, useState, useMemo } from "react";
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

import { listOtherProducts } from "../services/snackService";
import { listProgramsForUser } from "../services/programService";
import { useUser } from "../contexts/UserContext";

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

/* ===== 상단 서브 탭바 (고정, 스크롤 연동 X - 활성 상태만 표시) ===== */

const TopTabsBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 32px 20px 0;
  background: #fffcf4;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 1000;

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
 asHist
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

/* 탑바 + 헤더 높이만큼 여백 확보용 스페이서 */
const TabsSpacer = styled.div`
  height: 100px;
`;

/* ===== 공통 섞션 래퍼 ===== */

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

/* ============ 기타 상품 카드 ============ */

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

const ProgramTitleText = styled.div`
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

/* ===== 프로그램 상단 설명 + 목록 + 상세 영역 ===== */

const ProgramImagesWrap = styled.div`
  margin-top: 16px;
  padding: 8px;
  border-radius: 18px;
  background: #f7f7f7;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgramDetailImage = styled.img`
  width: auto;
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  object-fit: contain;    /* 핵심: 절대 자르지 않음 */
`;


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

/* 썸네일/요약 카드 그리드 */

const ProgramListGrid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* 상세 섹션 전체 래퍼 */

const ProgramDetailWrapper = styled.div`
  max-width: 1120px;
  margin: 0px auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

/* 상세 레이아웃 (좌측 상세 + 우측 예약) */

const ProgramLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 3fr 2fr;
  column-gap: 40px;
  align-items: flex-start;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 24px;
  }
`;

const ProgramDetailShell = styled.div`
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 18 px 40px rgba(0, 0, 0, 0.06);
  padding: 24px 24px 28px;
  box-sizing: border-box;
  min-height: 360px;

  @media (max-width: 768px) {
    border-radius: 24px;
    padding: 20px 18px 24px;
    min-height: auto;
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
  white-space: pre-line;
`;

const DetailShellDescription = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: #444;
  white-space: pre-line;
`;

/* 오른쪽 예약 박스 */

const BookingSidebarShell = styled.div`
  position: sticky;
  top: 120px;   /* 탭바 + 헤더 높이 고려해서 고정 지점 설정 */
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  padding: 20px 20px 24px;
  min-height: 420px;
  box-sizing: border-box;
  align-self: start;  /* Grid 안에서 상단 정렬 */
  @media (max-width: 960px) {
    position: static;  /* 모바일에서는 스크롤 고정 꺼짐 */
    top: auto;
  }
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
        ? "rgba(240,122,42,0.06)"
        : "transparent"};

  color: ${({ $isSelected, $isAvailable }) =>
    $isSelected ? "#ffffff" : $isAvailable ? "#222222" : "#c8c8c8"};
`;

const CalendarDayNumber = styled.div`
  line-height: 1.3;
`;

const CalendarDot = styled.div`
  margin-top: 2px;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: ${({ $active, $available }) =>
    $active ? "#ffffff" : $available ? accent : "transparent"};
  margin-left: auto;
  margin-right: auto;
`;

const CalendarHint = styled.p`
  margin: 8px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: ${subText};
`;

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

const ChildSelectButton = styled.button`
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 13px;
  color: #222;

  &:hover {
    background: #fafafa;
  }
`;

const ChildDropdown = styled.div`
  margin-top: 8px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  max-height: 220px;
  overflow-y: auto;
`;

const ChildDropdownItem = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: ${({ $active }) =>
    $active ? "rgba(240,122,42,0.06)" : "transparent"};
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:hover {
    background: ${({ $active }) =>
    $active ? "rgba(240,122,42,0.1)" : "#f9fafb"};
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .meta {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
  }
`;



const ChildList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChildItem = styled.button`
  width: 100%;
  border: 1px solid
    ${({ $active }) => ($active ? "#f07a2a" : "rgba(0, 0, 0, 0.06)")};
  background: ${({ $active }) =>
    $active ? "rgba(240, 122, 42, 0.06)" : "#ffffff"};
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

/* ========= 상단 탭 정보 ========= */

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

function formatKRW(n) {
  const v = Number(n || 0);
  return `₩${v.toLocaleString()}`;
}

function ProgramDetail({ program, childrenList }) {
  const nav = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeId, setSelectedTimeId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);
  const [childLabel, setChildLabel] = useState("자녀를 선택해주세요");
  

  const dateSlots = Array.isArray(program.dateSlots) ? program.dateSlots : [];


  const { children: ctxChildren } = useUser() || {};
  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );


  useEffect(() => {
    if (!children || !children.length) {
      setChildLabel("자녀를 추가해 주세요");
      return;
    }
    if (!selectedChildId) {
      setChildLabel("자녀를 선택해주세요");
      return;
    }
    const found = children.find((c) => c.childId === selectedChildId);
    if (!found) {
      setChildLabel("자녀를 선택해주세요");
      return;
    }
    if (found.birth) {
      setChildLabel(`${found.name} (${found.birth})`);
    } else {
      setChildLabel(found.name || "자녀");
    }
  }, [children, selectedChildId]);


  // 최초 선택값 세팅
  useEffect(() => {
    if (!dateSlots.length) return;
    const first = dateSlots[0];
    setSelectedDate(first.date || null);
    const firstTime = first.timeSlots?.[0] || null;
    setSelectedTimeId(firstTime?.id || null);
  }, [program.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 달력용 연/월 계산
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

  const currentDateSlot =
    dateSlots.find((ds) => ds.date === selectedDate) || null;

  const timeSlots = currentDateSlot?.timeSlots || [];
  const dateLabel = selectedDate ? selectedDate.replace(/-/g, ".") : "";

  const handleClickDay = (day) => {
    const match = dateSlots.find((ds) => {
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

  const selectedSlot =
    timeSlots.find((slot) => slot.id === selectedTimeId) || null;

  // 상단 메타 텍스트
  let headerMetaText = "";
  if (selectedSlot || selectedDate) {
    const capacity = selectedSlot ? Number(selectedSlot.capacity || 0) : null;
    const reserved = selectedSlot ? Number(selectedSlot.reserved || 0) : null;
    const remain =
      capacity && capacity > 0 ? Math.max(capacity - reserved, 0) : null;

    const parts = [];
    if (dateLabel) parts.push(dateLabel);
    if (selectedSlot?.label) parts.push(selectedSlot.label);
    if (remain != null) parts.push(`잔여 ${remain}석`);

    headerMetaText = parts.join(" · ");
  }

  return (
    <ProgramDetailWrapper id="program-detail-section">
      <ProgramLayout>
        {/* 왼쪽: 프로그램 설명 */}
        <ProgramDetailShell>
          {/* 전체 프로그램 이름 */}
          <DetailShellTitle>{program.title || "프로그램"}</DetailShellTitle>

          {/* 전체 프로그램 메타: 날짜/시간/잔여석 등 */}
          <DetailShellMeta>
            {headerMetaText ||
              `총 정원 ${program.totalCapacity || 0}명 · 현재 예약 ${program.totalReserved || 0
              }명`}
          </DetailShellMeta>

          {/* 전체 프로그램 설명 */}
          <DetailShellDescription>
            {program.description || "상세 설명이 아직 등록되지 않았습니다."}
          </DetailShellDescription>

          {/* 대표 이미지 + 상세 이미지들 */}
          {(program.heroImageUrl ||
            (Array.isArray(program.detailImageUrls) &&
              program.detailImageUrls.length > 0)) && (
              <ProgramImagesWrap>
                {program.heroImageUrl && (
                  <ProgramDetailImage
                    src={program.heroImageUrl}
                    alt={`${program.title || "프로그램"} 대표 이미지`}
                  />
                )}

                {(program.detailImageUrls || []).map((url, idx) => (
                  <ProgramDetailImage
                    key={`${url}-${idx}`}
                    src={url}
                    alt={`${program.title || "프로그램"} 상세 이미지 ${idx + 1}`}
                  />
                ))}
              </ProgramImagesWrap>
            )}
        </ProgramDetailShell>


        {/* 오른쪽: 날짜/시간/자녀 선택 */}
        <BookingSidebarShell>
          {/* 날짜 선택 */}
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
                  const isAvailable = availableDays.includes(day);
                  const isSelected = selectedDayNumber === day;

                  return (
                    <CalendarDayCell
                      key={day}
                      type="button"
                      $isSelected={isSelected}
                      $isAvailable={isAvailable}
                      $clickable={isAvailable}
                      onClick={() => {
                        if (!isAvailable) return;
                        handleClickDay(day);
                      }}
                    >
                      <CalendarDayNumber>{day}</CalendarDayNumber>
                      {isAvailable && (
                        <CalendarDot
                          $active={isSelected}
                          $available={isAvailable}
                        />
                      )}
                    </CalendarDayCell>
                  );
                })}
              </CalendarGrid>
            </CalendarBox>

            <CalendarHint>
              이 프로그램의 <strong>예약 가능일</strong>은{" "}
              <strong>{availableText || "미설정"}</strong> 입니다.
              <br />
              날짜를 선택하면 아래에 세부 프로그램이 표시됩니다.
            </CalendarHint>
          </BookingSection>

          {/* 세부 프로그램 (시간 슬롯) */}
          <BookingSection>
            <BookingSectionTitle>세부 프로그램</BookingSectionTitle>
            {timeSlots.length === 0 ? (
              <BookingChildPlaceholder />
            ) : (
              <BookingProgramList>
                {timeSlots.map((slot, idx) => {
                  const slotId =
                    slot.id || `${currentDateSlot?.date || ""}-${idx}`;

                  const capacity = Number(
                    slot.capacity || program.totalCapacity || 0
                  );
                  const reserved = Number(
                    slot.reserved || program.totalReserved || 0
                  );
                  const remain =
                    capacity > 0
                      ? Math.max(capacity - (reserved || 0), 0)
                      : null;
                  const closed = capacity > 0 ? remain === 0 : false;

                  const slotTitle =
                    slot.title ||
                    slot.name ||
                    program.title ||
                    "세부 프로그램";
                  const timeLabel = slot.label || "";

                  const metaParts = [];
                  if (dateLabel) metaParts.push(dateLabel);
                  if (timeLabel) metaParts.push(timeLabel);
                  if (closed) {
                    metaParts.push("마감");
                  } else if (remain != null) {
                    metaParts.push(`잔여 ${remain}석`);
                  }
                  const metaText = metaParts.join(" · ");

                  const slotPrice =
                    typeof slot.priceKRW === "number"
                      ? slot.priceKRW
                      : typeof program.priceKRW === "number"
                        ? program.priceKRW
                        : 0;
                  const priceLabel =
                    slotPrice > 0 ? formatKRW(slotPrice) : "가격 미정";

                  const active = selectedTimeId === slotId;

                  return (
                    <BookingProgramItem
                      key={slotId}
                      type="button"
                      $active={active}
                      onClick={() => {
                        if (closed) return;
                        setSelectedTimeId(slotId);
                      }}
                    >
                      <BookingProgramContent>
                        <BookingProgramTitle>{slotTitle}</BookingProgramTitle>
                        <BookingProgramMeta>
                          {metaText || "일정 정보가 없습니다."}
                        </BookingProgramMeta>
                        <BookingProgramPrice>{priceLabel}</BookingProgramPrice>
                      </BookingProgramContent>
                    </BookingProgramItem>
                  );
                })}
              </BookingProgramList>
            )}
          </BookingSection>

          {/* 자녀 선택 */}
          <BookingSection>
            <BookingSectionTitle>자녀 선택</BookingSectionTitle>

            {/* 자녀 선택 버튼 (접힘/펼침 토글) */}
            <ChildSelectButton
              type="button"
              onClick={() => setChildDropdownOpen((prev) => !prev)}
            >
              <span>{childLabel}</span>
              <span style={{ fontSize: 12, color: "#999" }}>
                {childDropdownOpen ? "접기 ▲" : "선택 ▼"}
              </span>
            </ChildSelectButton>

            {/* 버튼 눌렀을 때만 자녀 목록 표시 */}
            {childDropdownOpen && (
              <ChildDropdown>
                {(!children || !children.length) && (
                  <div style={{ padding: "10px 12px", fontSize: 13, color: "#777" }}>
                    등록된 자녀가 없습니다. 아래 버튼을 눌러 추가해 주세요.
                  </div>
                )}

                {children &&
                  children.map((child) => {
                    const active = child.childId === selectedChildId;
                    return (
                      <ChildDropdownItem
                        key={child.childId}
                        type="button"
                        $active={active}
                        onClick={() => {
                          setSelectedChildId(child.childId);
                          setChildDropdownOpen(false);
                        }}
                      >
                        <span className="name">{child.name || "이름 미입력"}</span>
                        {child.birth && (
                          <span className="meta">{child.birth}</span>
                        )}
                      </ChildDropdownItem>
                    );
                  })}

                <ChildAddButton
                  type="button"
                  onClick={() => {
                    nav("/mypage");
                  }}
                >
                  + 자녀 추가 (마이페이지로 이동)
                </ChildAddButton>
              </ChildDropdown>
            )}
          </BookingSection>



          <BookingSubmitButton type="button">
            예약하기
          </BookingSubmitButton>
        </BookingSidebarShell>
      </ProgramLayout>
    </ProgramDetailWrapper>
  );
}


/* ================== 메인 컴포넌트 ================== */

export default function MembershipPurchasePage() {
  const [topTab, setTopTab] = useState("membership");
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);

  const nav = useNavigate();

  const [otherProducts, setOtherProducts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState("");

  const OTHER_PAGE_SIZE = 3;
  const [otherPage, setOtherPage] = useState(0);

  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);
  const [childLabel, setChildLabel] = useState("선택해주세요");

  
  const { children: ctxChildren } = useUser() || {};
  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );
  

  const selectedProgram =
    selectedProgramId &&
    programs.find((p) => p.id === selectedProgramId && p.isActive);

  const inProgramDetailMode = !!selectedProgram;


 


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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setProgramsLoading(true);
        const list = await listProgramsForUser();
        if (!alive) return;
        const filtered = list.filter((p) => p.isActive);
        setPrograms(filtered);
      } catch (e) {
        console.error("[MembershipPurchase] listProgramsForUser error", e);
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



  function MembershipSection() {
    return (
      <Section id="section-membership" $pt={72} $pb={72}>
        <SectionTitle>멤버십 구매</SectionTitle>
        <SectionSubtitle>
          가족의 라이프스타일에 맞는 멤버십을 선택해보세요.
        </SectionSubtitle>
        <MembershipPlans />
      </Section>
    );
  }

  function ChargeSection() {
    return (
      <ChargeSectionWrap id="section-charge">
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

  function ProgramSection() {
    if (programsLoading) {
      return (
        <ProgramPageWrap id="section-program">
          <ProgramHeader>
            <ProgramHeaderTitle>프로그램 예약</ProgramHeaderTitle>
            <ProgramHeaderSubtitle>
              프로그램 정보를 불러오는 중입니다...
            </ProgramHeaderSubtitle>
          </ProgramHeader>
        </ProgramPageWrap>
      );
    }

    if (programsError) {
      return (
        <ProgramPageWrap id="section-program">
          <ProgramHeader>
            <ProgramHeaderTitle>프로그램 예약</ProgramHeaderTitle>
            <ProgramHeaderSubtitle>{programsError}</ProgramHeaderSubtitle>
          </ProgramHeader>
        </ProgramPageWrap>
      );
    }

    return (
      <ProgramPageWrap id="section-program">
        <ProgramHeader>
          <ProgramHeaderTitle>프로그램 예약하기</ProgramHeaderTitle>
          <ProgramHeaderSubtitle>
            주말·방학에 진행되는 특별 프로그램을 한눈에 확인하고
            <br />
            원하는 프로그램을 선택해 자세한 정보와 예약 가능 일정을 확인해보세요.
          </ProgramHeaderSubtitle>
        </ProgramHeader>

        {/* 1단계: 프로그램 썸네일/요약 카드 목록 */}
        <ProgramListGrid>
          {programs.map((p, index) => {
            const firstDateSlot = p.dateSlots?.[0];
            const firstTimeSlot = firstDateSlot?.timeSlots?.[0];

            const summaryDateLabel = firstDateSlot?.date
              ? firstDateSlot.date.replace(/-/g, ".")
              : "";
            const summaryTimeLabel = firstTimeSlot?.label || "";
            const capacity = Number(firstTimeSlot?.capacity || p.totalCapacity || 0);
            const reserved = Number(firstTimeSlot?.reserved || p.totalReserved || 0);
            const remain =
              capacity > 0 ? Math.max(capacity - (reserved || 0), 0) : null;

            const metaParts: string[] = [];
            if (summaryDateLabel) metaParts.push(summaryDateLabel);
            if (summaryTimeLabel) metaParts.push(summaryTimeLabel);
            if (remain != null) metaParts.push(`잔여 ${remain}석`);
            const summaryMeta =
              metaParts.join(" · ") ||
              p.description ||
              "상세 정보를 확인해 주세요.";

            const priceLabel =
              typeof p.priceKRW === "number" && p.priceKRW > 0
                ? `${formatKRW(p.priceKRW)}`
                : "가격 미정";

            const isActive = p.id === selectedProgramId;

            return (
              <ProgramCard
                key={p.id || index}
                onClick={() => {
                  setSelectedProgramId(p.id);
                  window.setTimeout(() => {
                    const el = document.getElementById("program-detail-section");
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const top = rect.top + window.scrollY - 120;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }, 50);
                }}
                style={{
                  cursor: "pointer",
                  border: isActive ? `2px solid ${accent}` : "none",
                }}
              >
                {p.heroImageUrl && (
                  <ProgramThumb
                    style={{
                      backgroundImage: `url("${p.heroImageUrl}")`,
                    }}
                  />
                )}
                <ProgramBody>
                  <ProgramBadgeRow>
                    <Badge $tone="accent">프로그램</Badge>
                    {remain != null && <Badge $tone="neutral">잔여 {remain}석</Badge>}
                  </ProgramBadgeRow>
                  <ProgramTitleText>{p.title || "프로그램"}</ProgramTitleText>
                  <ProgramMeta>{summaryMeta}</ProgramMeta>
                  <ProgramPriceRow>
                    <span>{priceLabel}</span>
                    {capacity > 0 && <Muted>정원 {capacity}명</Muted>}
                  </ProgramPriceRow>
                </ProgramBody>
              </ProgramCard>
            );
          })}
        </ProgramListGrid>

        {/* 2단계: 선택된 프로그램 상세/예약 영역 (같은 페이지 하단에 노출) */}
        {selectedProgram && (
          <ProgramDetailWrapper id="program-detail-section">
            <ProgramDetail program={selectedProgram} childrenList={children} />
          </ProgramDetailWrapper>
        )}
      </ProgramPageWrap>
    );
  }

  function OthersSection() {
    return (
      <SectionGrayBg>
        <Section id="section-others" $pt={24} $pb={96}>
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
                  <ProgramTitleText>{p.title}</ProgramTitleText>
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

  if (inProgramDetailMode && selectedProgram) {
    // ✅ 상세 모드: 탭 + 프로그램 상세 화면만
    return (
      <Page>
        <TopTabsBar>
          <TopTabsInner>
            {TOP_TABS.map((tab) => {
              const isActive = tab.key === "program"; // 상세 모드에선 program만 active
              const iconSrc = isActive ? tab.activeIcon : tab.inactiveIcon;

              return (
                <TopTabButton
                  key={tab.key}
                  type="button"
                  $active={isActive}
                  onClick={() => {
                    // 다른 탭 누르면 상세 모드 종료하고 전체 뷰로 복귀
                    if (tab.key !== "program") {
                      setSelectedProgramId(null);
                      setTopTab(tab.key);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <TopTabIcon src={iconSrc} alt={tab.label} />
                  <TopTabLabel>{tab.label}</TopTabLabel>
                </TopTabButton>
              );
            })}
          </TopTabsInner>
        </TopTabsBar>

        <TabsSpacer />

        {/* 상세 전용 컴포넌트 하나만 렌더링 */}
        <ProgramDetail program={selectedProgram} childrenList={children} />

        <CheckoutChargeDialog
          open={chargeDialogOpen}
          onClose={() => setChargeDialogOpen(false)}
        />
      </Page>
    );
  }

  // ✅ 기본 모드: 멤버십 → 정액권 → 프로그램 목록(+하단 상세 자리) → 기타상품 한 페이지에 쭉
  return (
    <Page>
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
                onClick={() => {
                  setTopTab(tab.key);
                  // 탭 바꾸면 상세 선택은 유지해도 되고, 싹 지워도 되면 여기서 null로
                  if (tab.key !== "program") {
                    setSelectedProgramId(null);
                  }
                }}
              >
                <TopTabIcon src={iconSrc} alt={tab.label} />
                <TopTabLabel>{tab.label}</TopTabLabel>
              </TopTabButton>
            );
          })}
        </TopTabsInner>
      </TopTabsBar>

      <TabsSpacer />

      {/* 기존처럼 한 장에 아래로 쭉 */}
      <MembershipSection />
      <ChargeSection />
      <ProgramSection />
      <OthersSection />

      <CheckoutChargeDialog
        open={chargeDialogOpen}
        onClose={() => setChargeDialogOpen(false)}
      />
    </Page>
  );
}


