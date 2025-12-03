/* eslint-disable */
// src/pages/PickupApplyPage.jsx
// Withagit — 픽업 예약하기 (왼쪽: 자녀/날짜/시간, 오른쪽: 지점 선택 + 장바구니 + 결제)

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import {
  MEMBERSHIP_KIND,
  MEMBERSHIP_STATUS,
} from "../constants/membershipDefine";
import { listPlaces } from "../services/pickupPlacesService";
import CheckoutPickupDialog from "../components/CheckoutPickupDialog";
import pickupSearchIcon from "../assets/pickup/pickup-banner.png"; // 실제 경로에 맞게 수정
import pickupSwapIcon from "../assets/pickup/pickup-swap.png"; // 경로는 형 프로젝트에 맞게

/* ================== 공통 색상/토큰 ================== */

const primaryText = "#111827";
const subText = "#6b7280";
const borderSoft = "#E5E5E5";
const accent = "#F97316";
const cardBg = "#FFFFFF";


const HANGUL_INITIALS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function getInitialConsonant(ch) {
  if (!ch) return null;
  const code = ch.charCodeAt(0);
  // 한글 범위 밖이면 null
  if (code < 0xac00 || code > 0xd7a3) return null;
  const index = Math.floor((code - 0xac00) / 588);
  return HANGUL_INITIALS[index] || null;
}

function getPlaceGroupLabel(place) {
  const name = (place.placeName || "").trim();
  const firstChar = name[0];
  const initial = getInitialConsonant(firstChar);
  if (initial) {
    return `${initial}으로 시작하는 정류소`;
  }
  return "기타 정류소";
}


/* ================== 페이지 레이아웃 ================== */

const Page = styled.main`
  background: #fff;
  min-height: 100vh;
  padding-bottom: 120px;
`;

const PageInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 100px 20px 40px;

  @media (max-width: 768px) {
    padding: 18px 16px 32px;
  }
`;



/* 🔸 모바일에서는 페이지 타이틀/서브텍스트 숨김 */
const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px;
  color: ${primaryText};

  @media (max-width: 768px) {
    display: none;
  }
`;

const PageSub = styled.p`
  margin: 0 0 18px;
  font-size: 14px;
  color: ${subText};

  @media (max-width: 768px) {
    display: none;
  }
`;

// 메인 2컬럼 레이아웃
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
  gap: 28px;
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* ================== 왼쪽 컬럼 스타일 ================== */
const LeftWrap = styled.aside`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;

  /* 🔸 바깥 카드 느낌 제거 */
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;

  @media (max-width: 960px) {
    padding: 0;
  }
`;


/* 🔸 모바일에서는 섹션 헤더(자녀/날짜·시간 설명) 숨김 */
const SectionHeader = styled.div`
  margin-bottom: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PickupMainCard = styled.div`
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  padding: 16px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionDividerLine = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0 -16px;   /* 카드 padding(16px)을 상쇄해서 전체 폭으로 쭉 */
`;

const PickupSubSection = styled.div`
  & + & {
    margin-top: 16px;
  }
`;



const ChildAddRowWrap = styled.div`
  position: relative;
  margin-top: 8px;
  padding-bottom: 16px;

  /* 🔸 자녀 추가 바로 밑에, 카드 전체 폭으로 라인 */
  &::after {
    content: "";
    position: absolute;
    left: -16px;    /* PickupMainCard 패딩만큼 밖으로 */
    right: -16px;
    bottom: 0;
    height: 1px;
    background: #e5e7eb;
  }
`;


const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${primaryText};
`;

const SectionSub = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${subText};
`;

const Block = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  color: ${primaryText};
  margin-bottom: 6px;
`;

/* --- 자녀 드롭다운 --- */

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
  cursor: pointer;
`;

const ChildDropdown = styled.div`
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  max-height: 260px;
  overflow-y: auto;
`;

const ChildItemButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #f9fafb;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
    color: ${primaryText};
  }
  .meta {
    font-size: 12px;
    color: ${subText};
    margin-top: 2px;
  }
  .badge-row {
    margin-top: 4px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #b45309;
    font-weight: 600;
  }
`;

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
  </svg>
);

const AddChildRow = styled.button`
  width: calc(100% - 24px);
  margin: 0 12px;                 /* 위/아래 마진은 래퍼가 처리 */
  padding: 8px 14px 9px;
  border-radius: 999px;
  border: 1px dashed #f97316;
  background: #fff7ed;
  font-size: 13px;
  font-weight: 700;
  color: #9a3412;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  cursor: pointer;
`;


/* --- 날짜/시간 선택 --- */

const DateTimeBlock = styled.div`
  margin-bottom: 12px;
`;

const BlockLabelRow = styled.div`
  position: relative;
  margin: 0 0 8px;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;

  /* 🔸 위/아래 라인 – 카드 패딩(16px)을 넘어서 끝까지 */
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: -16px;
    right: -16px;
    height: 1px;
    background: #e5e7eb;
  }

  &::before {
    top: 0;      /* 라벨 위 라인 */
  }

  &::after {
    bottom: 0;   /* 라벨 아래 라인 */
  }
`;



const BlockHint = styled.div`
  font-size: 11px;
  color: ${subText};
`;

/* 캘린더 */

const CalendarShell = styled.div`
  border-radius: 18px;
  border: 1px solid #f3f4f6;
  background: #fdfdfd;
  padding: 12px 14px 10px;
  margin-bottom: 16px;
`;

const CalendarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const MonthLabelText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${primaryText};
`;

const MonthNav = styled.div`
  display: flex;
  gap: 4px;
`;

const MonthNavBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
  text-align: center;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.button`
  border: none;
  background: ${({ $selected }) => ($selected ? accent : "transparent")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#111827")};
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 0;
  cursor: pointer;
  margin: 1px 0;

  &:hover {
    background: ${({ $selected }) =>
    $selected ? accent : "rgba(249, 115, 22, 0.06)"};
  }

  &:disabled {
    color: #d1d5db;
    cursor: default;
    background: transparent;
  }
`;

/* 시간 선택 */

const TimeHeaderRow = styled.div`
  position: relative;
  margin: 16px 0 8px;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* 🔸 위/아래 라인 – 카드 패딩(16px) 밖까지 확장 */
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: -16px;
    right: -16px;
    height: 1px;
    background: #e5e7eb;
  }

  &::before {
    top: 0;      /* 시간 라벨 위 라인 */
  }

  &::after {
    bottom: 0;   /* 시간 라벨 아래 라인 */
  }
`;


const TimeHeaderTitle = styled.div`
  font-size: 13px;

  color: ${primaryText};
`;

const TimeApplyButton = styled.button`
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;


const TimePickerBox = styled.div`
  border-radius: 18px;
  border: 1px solid #eee2cf;
  background: #fff;
  padding: 12px 16px 14px;
  box-sizing: border-box;
  margin-bottom: 12px;
`;

const TimePickerLabels = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
`;

const TimePickerLabel = styled.div`
  text-align: center;
`;

const TimeColumns = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  align-items: stretch;
  gap: 8px;
`;



const TimeWheelWrapper = styled.div`
  position: relative;
  border-radius: 14px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  overflow: hidden;
`;

const TimeWheelViewport = styled.div`
  max-height: 160px;
  padding: 64px 0; /* 위/아래 여유를 줘서 가운데 줄에 숫자가 오도록 */
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
`;

const TimeWheelItem = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center;
  font-size: 17px;
  font-weight: ${({ $active }) => ($active ? 800 : 500)};
  color: ${({ $active }) => ($active ? primaryText : "#9ca3af")};
`;

const TimeWheelCenterLines = styled.div`
  position: absolute;
  left: 8px;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  pointer-events: none;
`;


const AmPmColumn = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid ${borderSoft};
  overflow: hidden;
`;

const AmPmButton = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active }) =>
    $active ? "rgba(249, 115, 22, 0.08)" : "#ffffff"};
  color: ${({ $active }) => ($active ? accent : primaryText)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  padding: 6px 4px;

  &:not(:last-child) {
    border-bottom: 1px solid ${borderSoft};
  }
`;

const WheelColumn = styled.div`
  border-radius: 14px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const WheelRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
`;

const WheelNumberWrapper = styled.div`
  width: 100%;
  padding: 4px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WheelNumber = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${primaryText};
`;

const WheelArrowRow = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 4px;
`;

const WheelArrowBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 4px;
`;

const TimeResetLink = styled.button`
  border: none;
  background: transparent;
  font-size: 11px;
  color: ${subText};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const SelectedSlotsRow = styled.div`
  margin: 6px 0 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SlotChip = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 10px 10px 8px;
  font-size: 12px;
  background: #fee2e2;
  color: #b91c1c;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
`;

const ChipRemove = styled.span`
  font-size: 11px;
`;

/* 캘린더 유틸 */

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

/* ================== 오른쪽 컬럼 스타일 ================== */

const RightWrap = styled.aside`
  flex: 1 1 0;
  min-width: 0;
  padding: 24px;
  border-radius: 24px;
  background: ${cardBg};
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  height: 100%;

  @media (max-width: 960px) {
    border-radius: 20px;
    padding: 18px 16px 22px;
  }
`;

const SummaryChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const SearchBlock = styled.div`
  margin-bottom: 12px;
`;

const SearchFieldsWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;
const SwapButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  padding: 0;
  z-index: 2;
`;

const SwapIconImg = styled.img`
  width: 18px;
  height: 18px;
  display: block;
`;


const SearchRow = styled.div`
  width: 100%;
  margin-bottom: 8px;
`;

const SearchInputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 46px;
  border-radius: 999px;
  border: 1px solid ${borderSoft};
  padding: 0 42px 0 16px;   /* 오른쪽에 아이콘 들어갈 여유 */
  font-size: 13px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${accent};
  }
`;

const SearchIconButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
`;

const SearchIconImg = styled.img`
  width: 18px;
  height: 18px;
  display: block;
`;


const SwapLine = styled.div`
  position: absolute;
  left: 50%;
  top: 6px;
  bottom: 6px;
  width: 1px;
  transform: translateX(-50%);
  background: #e5e7eb;
`;



const SwapIconSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M8 5l-3 3h14"
      stroke="#9ca3af"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M16 19l3-3H5"
      stroke="#9ca3af"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);


const SearchBtn = styled.button`
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #e5e7eb;
  }
`;

const ListBtn = styled.button`
  height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const HintText = styled.div`
  font-size: 11px;
  color: ${subText};
`;

const MapBox = styled.div`
  margin-top: 12px;
  margin-bottom: 14px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 18px;
  overflow: hidden;
  background: #e5e7eb;
`;

const DistanceRow = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${subText};
`;

const MemoLabel = styled.div`
  margin-top: 18px;
  font-size: 13px;
  font-weight: 700;
  color: ${primaryText};
`;

const MemoArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 18px;
  border: 1px solid ${borderSoft};
  padding: 10px 12px;
  font-size: 13px;
  resize: vertical;
  margin-top: 10px;
  font-family: inherit;
  color: ${primaryText};
  box-sizing: border-box;

  &::placeholder {
    color: #c4c4c4;
  }
`;

const RightSlotChip = styled.button`
  position: relative;
  border: 1px solid ${accent};
  border-radius: 24px;
  padding: 8px 28px 8px 14px;
  min-width: 180px;
  background: #fff3e6;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;

  .topline {
    font-size: 12px;
    font-weight: 700;
    color: ${accent};
  }

  .bottomline {
    margin-top: 3px;
    font-size: 14px;
    font-weight: 800;
    color: ${accent};
  }

  .close {
    position: absolute;
    top: 6px;
    right: 10px;
    font-size: 12px;
    color: ${accent};
  }
`;

/* 장바구니 버튼 + 카드 */

const CartActionsRow = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const CartButton = styled.button`
  height: 34px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: #e6e6e6;
  color: #666666;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;

const CartList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CartCard = styled.div`
  border-radius: 18px;
  border: 1px solid #fee2e2;
  background: #fff7ed;
  padding: 10px 12px;
  font-size: 12px;
  color: ${primaryText};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CartLineTop = styled.div`
  font-weight: 700;
`;

const CartLineMiddle = styled.div`
  color: ${subText};
`;

const CartLineBottom = styled.div`
  font-size: 11px;
  color: ${subText};
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  border-radius: 24px;
  background: #ffffff;
  padding: 24px 20px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
`;

const ModalHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ModalTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${primaryText};
`;

const ModalCloseBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
`;

const ModalSearchWrap = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

const ModalSearchInput = styled.input`
  width: 100%;
  height: 52px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 0 44px 0 18px;  /* 오른쪽 여백 넉넉히 (아이콘 자리) */
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: ${accent};
    box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.16);
  }
`;

const ModalSearchIcon = styled.img`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
`;


const ModalSection = styled.div`
  margin-bottom: 14px;
`;

const ModalSectionHeader = styled.div`
  padding: 8px 10px;
  border-radius: 10px;
  background: #e6e6e6;
  font-size: 12px;
  font-weight: 700;
  color: ${primaryText};
  margin-bottom: 6px;
`;

const ModalBannerWrap = styled.div`
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: center;
`;

const ModalBannerImage = styled.img`
  max-width: 100%;
  border-radius: 14px;
  display: block;
`;




const ModalList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
`;

const ModalItem = styled.button`
  width: 100%;
  text-align: left;
  border: none;
  background: #ffffff;
  padding: 10px 6px;
  border-radius: 14px;
  cursor: pointer;

  &:hover {
    background: #fff7ed;
  }
`;

const ModalItemName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${primaryText};
`;

const ModalItemAddress = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${subText};
`;

const ModalEmpty = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: ${subText};
`;

const CartPriceLine = styled.div`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 800;
  color: ${accent};
`;

/* ================== 왼쪽 컬럼 컴포넌트 ================== */





const TIME_WHEEL_ITEM_HEIGHT = 32;

function ScrollWheelColumn({ items, value, onChange, renderItem }) {
  const viewportRef = React.useRef(null);
  const timerRef = React.useRef(null);

  // 현재 선택된 값으로 스크롤 위치 맞추기
  React.useEffect(() => {
    const idx = items.findIndex((v) => v === value);
    if (idx < 0 || !viewportRef.current) return;

    viewportRef.current.scrollTo({
      top: idx * TIME_WHEEL_ITEM_HEIGHT,
      behavior: "smooth",
    });
  }, [items, value]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (!el) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 스크롤 멈춘 뒤에 가장 가까운 칸으로 스냅 + 값 반영
    timerRef.current = setTimeout(() => {
      const rawIndex = el.scrollTop / TIME_WHEEL_ITEM_HEIGHT;
      let idx = Math.round(rawIndex);
      if (idx < 0) idx = 0;
      if (idx > items.length - 1) idx = items.length - 1;

      const nextValue = items[idx];
      if (nextValue !== value) {
        onChange(nextValue);
      }

      el.scrollTo({
        top: idx * TIME_WHEEL_ITEM_HEIGHT,
        behavior: "smooth",
      });
    }, 80);
  };

  return (
    <TimeWheelWrapper>
      <TimeWheelViewport ref={viewportRef} onScroll={handleScroll}>
        {items.map((item, index) => (
          <TimeWheelItem
            key={index}
            $active={item === value}
          >
            {renderItem ? renderItem(item) : String(item)}
          </TimeWheelItem>
        ))}
      </TimeWheelViewport>
      {/* 가운데 가로 라인 제거 */}
    </TimeWheelWrapper>
  );
}


const KRW = (n = 0) => (n || 0).toLocaleString("ko-KR");

function PickupLeftColumn({ slots, onChangeSlots }) {
  const { children: ctxChildren, memberships: ctxMemberships } = useUser() || {};
  const navigate = useNavigate();
  const children = Array.isArray(ctxChildren) ? ctxChildren : [];

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const agitzSet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(ctxMemberships)) {
      ctxMemberships.forEach((m) => {
        if (
          m &&
          m.kind === MEMBERSSHIP_KIND.AGITZ &&
          (m.status === MEMBERSHIP_STATUS.ACTIVE ||
            m.status === MEMBERSHIP_STATUS.FUTURE) &&
          m.childId
        ) {
          set.add(m.childId);
        }
      });
    }
    return set;
  }, [ctxMemberships]);

  const familySet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(ctxMemberships)) {
      ctxMemberships.forEach((m) => {
        if (
          m &&
          m.kind === MEMBERSHIP_KIND.FAMILY &&
          (m.status === MEMBERSHIP_STATUS.ACTIVE ||
            m.status === MEMBERSHIP_STATUS.FUTURE) &&
          m.childId
        ) {
          set.add(m.childId);
        }
      });
    }
    return set;
  }, [ctxMemberships]);

  const childItems = useMemo(
    () =>
      children.map((c, index) => {
        const id = c.childId || c.id || "child-" + index;
        const name = c.name || c.childName || "";
        const birth = c.birth || c.birthDate || "";
        return {
          id,
          name,
          birth,
          isDefault: index === 0,
          hasAgitz: agitzSet.has(id),
          hasFamily: familySet.has(id),
        };
      }),
    [children, agitzSet, familySet]
  );

  const [activeChildId, setActiveChildId] = useState(null);
  const [childLabel, setChildLabel] = useState("선택해주세요");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!childItems.length) {
      setActiveChildId(null);
      setChildLabel("선택해주세요");
      return;
    }
    if (!activeChildId) {
      const first = childItems[0];
      setActiveChildId(first.id);
      setChildLabel(
        first.birth ? `${first.name} (${first.birth})` : first.name || "선택해주세요"
      );
    } else {
      const cur = childItems.find((c) => c.id === activeChildId);
      if (cur) {
        setChildLabel(
          cur.birth ? `${cur.name} (${cur.birth})` : cur.name || "선택해주세요"
        );
      }
    }
  }, [childItems, activeChildId]);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const monthCells = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

  // 🔸 휠용 상태
  const [ampm, setAmPm] = useState("AM");
  const [hour, setHour] = useState(1);
  const [minute, setMinute] = useState(0);

  const ampmItems = ["AM", "PM"];
  const hourItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );
  const minuteItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i * 5), // 0,5,10,...55
    []
  );

  const formattedMonth = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth() + 1;
    return `${y}년 ${m}월`;
  }, [currentMonth]);

  const moveMonth = (diff) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + diff);
      return next;
    });
  };

  const selectDate = (d) => {
    if (!d) return;
    setSelectedDate(d);
  };

  const addSlot = () => {
    if (!selectedDate || !activeChildId) {
      alert("자녀와 날짜를 먼저 선택해 주세요.");
      return;
    }

    let h24 = hour % 12;
    if (ampm === "PM") h24 += 12;

    const iso =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    const newSlot = {
      id:
        iso +
        "-" +
        String(h24).padStart(2, "0") +
        String(minute).padStart(2, "0") +
        "-" +
        activeChildId +
        "-" +
        Date.now(),
      childId: activeChildId,
      date: iso,
      hour: h24,
      minute,
      ampm,
    };

    const nextSlots = [...slots, newSlot];
    onChangeSlots(nextSlots);
  };

  const removeSlot = (slotId) => {
    const next = slots.filter((s) => s.id !== slotId);
    onChangeSlots(next);
  };

  const clearSlots = () => {
    onChangeSlots([]);
  };

  return (
    <LeftWrap>
      <SectionHeader>
        <SectionTitle>자녀 / 날짜 · 시간</SectionTitle>
        <SectionSub>
          여러 자녀, 여러 날짜를 한 번에 담아 픽업을 신청할 수 있어요.
        </SectionSub>
      </SectionHeader>

      <PickupMainCard>
        {/* 1) 자녀 선택 섹션 */}
        <PickupSubSection>
          <SectionLabel>자녀 선택</SectionLabel>

          <SelectBox
            type="button"
            $placeholder={!activeChildId}
            onClick={() => {
              if (!childItems.length) {
                alert(
                  "등록된 자녀가 없습니다. 마이페이지에서 자녀를 먼저 등록해 주세요."
                );
                return;
              }
              setDropdownOpen((prev) => !prev);
            }}
          >
            <span>{childLabel}</span>
            <ChevronDown />
          </SelectBox>

          {dropdownOpen && childItems.length > 0 && (
            <ChildDropdown>
              {childItems.map((c) => {
                const isActive = c.id === activeChildId;
                return (
                  <ChildItemButton
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveChildId(c.id);
                      setChildLabel(
                        c.birth
                          ? `${c.name} (${c.birth})`
                          : c.name || "선택해주세요"
                      );
                      setDropdownOpen(false);
                    }}
                    style={{
                      backgroundColor: isActive
                        ? "rgba(240,122,42,0.06)"
                        : "transparent",
                    }}
                  >
                    <span className="name">{c.name || "(이름 없음)"}</span>
                    {c.birth && <span className="meta">{c.birth}</span>}
                    {(c.hasAgitz || c.hasFamily) && (
                      <div className="badge-row">
                        {c.hasAgitz && (
                          <span className="badge">정규 멤버십</span>
                        )}
                        {c.hasFamily && (
                          <span className="badge">패밀리 멤버십</span>
                        )}
                      </div>
                    )}
                  </ChildItemButton>
                );
              })}
            </ChildDropdown>
          )}

        <ChildAddRowWrap>
          <AddChildRow
            type="button"
            onClick={() => {
              const isMobile =
                typeof window !== "undefined" &&
                window.matchMedia &&
                window.matchMedia("(max-width: 768px)").matches;

              if (isMobile) {
                navigate("/m/account");
              } else {
                navigate("/mypage");
              }
            }}
          >
            <span>+</span>
            <span>자녀 추가</span>
          </AddChildRow>
        </ChildAddRowWrap>

        </PickupSubSection>

        {/* 2) 날짜 선택 섹션 */}
        <PickupSubSection>
          <BlockLabelRow>
            <SectionLabel>날짜를 선택해주세요</SectionLabel>
          </BlockLabelRow>

          <CalendarShell>
            <CalendarHeaderRow>
              <MonthNavBtn type="button" onClick={() => moveMonth(-1)}>
                ‹
              </MonthNavBtn>
              <MonthLabelText>{formattedMonth}</MonthLabelText>
              <MonthNavBtn type="button" onClick={() => moveMonth(1)}>
                ›
              </MonthNavBtn>
            </CalendarHeaderRow>

            <WeekRow>
              {WEEK_LABELS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </WeekRow>

            <DayGrid>
              {monthCells.map((d, idx) => {
                if (!d) return <div key={"empty-" + idx} />;

                const isSelected =
                  selectedDate &&
                  d.getFullYear() === selectedDate.getFullYear() &&
                  d.getMonth() === selectedDate.getMonth() &&
                  d.getDate() === selectedDate.getDate();

                const thisDate = new Date(d);
                thisDate.setHours(0, 0, 0, 0);
                const isPast = thisDate < today;

                return (
                  <DayCell
                    key={d.toISOString()}
                    type="button"
                    $selected={isSelected}
                    disabled={isPast}
                    onClick={() => {
                      if (isPast) return;
                      selectDate(d);
                    }}
                  >
                    {d.getDate()}
                  </DayCell>
                );
              })}
            </DayGrid>
          </CalendarShell>
        </PickupSubSection>

        {/* 3) 시간 선택 섹션 */}
        <PickupSubSection>
          <TimeHeaderRow>
            <TimeHeaderTitle>시간을 선택해주세요</TimeHeaderTitle>
            <TimeApplyButton type="button" onClick={addSlot}>
              이대로 담기
            </TimeApplyButton>
          </TimeHeaderRow>

          <TimePickerBox>
            <TimePickerLabels>
              <TimePickerLabel>오전 / 오후</TimePickerLabel>
              <TimePickerLabel>시간</TimePickerLabel>
              <TimePickerLabel>분</TimePickerLabel>
            </TimePickerLabels>

            <TimeColumns>
              <ScrollWheelColumn
                items={ampmItems}
                value={ampm}
                onChange={setAmPm}
                renderItem={(v) => (v === "PM" ? "오후" : "오전")}
              />
              <ScrollWheelColumn
                items={hourItems}
                value={hour}
                onChange={setHour}
                renderItem={(v) => String(v).padStart(2, "0")}
              />
              <ScrollWheelColumn
                items={minuteItems}
                value={minute}
                onChange={setMinute}
                renderItem={(v) => String(v).padStart(2, "0")}
              />
            </TimeColumns>
          </TimePickerBox>

          <TimeResetLink type="button" onClick={clearSlots}>
            선택한 시간 모두 지우기
          </TimeResetLink>
        </PickupSubSection>
      </PickupMainCard>

      <SelectedSlotsRow>
        {slots.map((s) => (
          <SlotChip key={s.id} type="button" onClick={() => removeSlot(s.id)}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>{s.date}</div>
              <div>
                {s.ampm === "PM" ? "오후" : "오전"}{" "}
                {String((s.hour % 12) || 12).padStart(2, "0")}:
                {String(s.minute).padStart(2, "0")}
              </div>
            </div>
            <ChipRemove>×</ChipRemove>
          </SlotChip>
        ))}
      </SelectedSlotsRow>
    </LeftWrap>
  );

}

/* ================== 오른쪽 컬럼 (지도 + 정류장 모달 + 장바구니) ================== */

function PickupRightColumn({ slots, onChangeSlots, cartItems, onChangeCartItems }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");

  const [startPlace, setStartPlace] = useState(null);
  const [endPlace, setEndPlace] = useState(null);

  const [distanceKm, setDistanceKm] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(7000);
  const [memo, setMemo] = useState("");

  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [placesTarget, setPlacesTarget] = useState("start");
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesSearch, setPlacesSearch] = useState("");

  const { children: ctxChildren } = useUser() || {};
  const children = Array.isArray(ctxChildren) ? ctxChildren : [];

  const childMap = useMemo(() => {
    const map = {};
    children.forEach((c) => {
      const id = c.childId || c.id;
      if (!id) return;
      map[id] = (c.name || c.childName || "") || "";
    });
    return map;
  }, [children]);

  // "위드아지트" 정류장 찾기
  const sujichoPlace = useMemo(() => {
    if (!places.length) return null;
    const byName = places.find((p) => (p.placeName || "").includes("위드아지트"));
    if (byName) return byName;
    const byBranch = places.find((p) => (p.branchName || "").includes("위드아지트"));
    if (byBranch) return byBranch;
    const byAddr = places.find((p) => (p.address || "").includes("위드아지트"));
    if (byAddr) return byAddr;
    return null;
  }, [places]);

  // 지도 초기화 — SDK/DOM 준비될 때까지 재시도
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const MAX_TRIES = 40; // 40번 × 250ms ≒ 10초

    const tryInitMap = () => {
      if (cancelled) return;

      const kakao = window.kakao;
      const hasKakao = !!(kakao && kakao.maps);
      const hasRef = !!mapRef.current;

      if (!hasRef || !hasKakao) {
        tries += 1;
        console.log(
          "[PickupRightColumn] mapRef / kakao 미준비, retry:",
          tries,
          "hasRef:",
          hasRef,
          "hasKakao:",
          hasKakao
        );
        if (tries < MAX_TRIES) {
          setTimeout(tryInitMap, 250);
        }
        return;
      }

      if (mapInstanceRef.current) {
        console.log("[PickupRightColumn] 지도 이미 초기화됨");
        return;
      }

      const center = new kakao.maps.LatLng(37.314760, 127.085600);
      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      });

      mapInstanceRef.current = map;
      console.log("[PickupRightColumn] kakao 지도 초기화 완료");
    };

    tryInitMap();

    return () => {
      cancelled = true;
    };
  }, []);


  // 출발/도착 변경 시 마커/라인 + 거리/요금 + 라벨 뱃지
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !kakao.maps || !map) return;

    // 기존 라인/마커 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }

    // 아무것도 없으면 초기화
    if (!startPlace && !endPlace) {
      setDistanceKm(0);
      setEstimatedFare(0);
      return;
    }

    const bounds = new kakao.maps.LatLngBounds();
    const path = [];

    // 공용: 라벨 오버레이 만드는 헬퍼
    const makeLabelOverlay = (position, text, bgColor, zIndex) => {
      const el = document.createElement("div");
      el.innerText = text;
      el.style.padding = "6px 10px";
      el.style.borderRadius = "999px";
      el.style.background = bgColor;
      el.style.color = "#ffffff";
      el.style.fontSize = "12px";
      el.style.fontWeight = "700";
      el.style.boxShadow = "0 3px 6px rgba(0,0,0,0.25)";
      el.style.whiteSpace = "nowrap";
      el.style.transform = "translateY(-8px)"; // 살짝 위로 띄우기

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1,
        zIndex: zIndex ?? 10,
      });

      overlay.setMap(map);
      return overlay;
    };

    // 출발지
    if (startPlace && startPlace.lat && startPlace.lng) {
      const pos = new kakao.maps.LatLng(startPlace.lat, startPlace.lng);
      const overlay = makeLabelOverlay(pos, "출발", "#f97316", 20);
      startMarkerRef.current = overlay;

      bounds.extend(pos);
      path.push(pos);
    }

    // 도착지
    if (endPlace && endPlace.lat && endPlace.lng) {
      const pos = new kakao.maps.LatLng(endPlace.lat, endPlace.lng);
      const overlay = makeLabelOverlay(pos, "도착", "#2563eb", 20);
      endMarkerRef.current = overlay;

      bounds.extend(pos);
      path.push(pos);
    }

    // 선 긋기 + 거리/요금 계산
    if (path.length >= 2) {
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: "#22c55e",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      polylineRef.current = polyline;

      const lengthM = polyline.getLength();
      const km = lengthM / 1000;
      setDistanceKm(km);

      // 정류장 price 우선, 없으면 거리 기반 요금
      const priceFromStart =
        startPlace && typeof startPlace.price === "number"
          ? startPlace.price
          : null;
      const priceFromEnd =
        endPlace && typeof endPlace.price === "number"
          ? endPlace.price
          : null;

      if (priceFromStart != null || priceFromEnd != null) {
        const fare = priceFromStart ?? priceFromEnd ?? 0;
        setEstimatedFare(Number(fare) || 0);
      } else {
        const base = 7000;
        const extra = Math.max(0, km - 2) * 500;
        const fare = base + extra;
        setEstimatedFare(Math.round(fare / 100) * 100);
      }
    } else {
      setDistanceKm(0);
      setEstimatedFare(0);
    }

    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  }, [startPlace, endPlace]);


  const openPlacesModal = async (target, initialKeyword = "") => {
    setPlacesTarget(target);
    setShowPlacesModal(true);
    setPlacesSearch(initialKeyword || "");

    if (!places.length) {
      try {
        setPlacesLoading(true);
        const rows = await listPlaces("전체");
        setPlaces(rows || []);
      } catch (e) {
        console.error("[PickupRightColumn] listPlaces error", e);
        alert("정류장 목록을 불러오지 못했습니다.");
      } finally {
        setPlacesLoading(false);
      }
    }
  };

  const handleSearchClick = (target) => {
    const keyword = target === "start" ? startQuery : endQuery;
    openPlacesModal(target, keyword);
  };


  const handleSwapStartEnd = () => {
    // 인풋 값 스왑
    const newStartQuery = endQuery;
    const newEndQuery = startQuery;
    setStartQuery(newStartQuery);
    setEndQuery(newEndQuery);

    // 선택된 장소 정보도 같이 스왑
    setStartPlace(endPlace);
    setEndPlace(startPlace);
  };

  const handleSearchOrList = (target) => {
    const keywordRaw = target === "start" ? startQuery : endQuery;
    const keyword = (keywordRaw || "").trim();

    if (!keyword) {
      // 입력이 없으면 전체 목록 모달
      openPlacesModal(target);
    } else {
      // 입력이 있으면 해당 키워드로 검색 모달
      openPlacesModal(target, keyword);
    }
  };



  const filteredPlaces = useMemo(() => {
    const keyword = (placesSearch || "").trim();
    if (!keyword) return places;
    const lower = keyword.toLowerCase();
    return places.filter((p) => {
      const name = (p.placeName || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      return name.includes(lower) || addr.includes(lower);
    });
  }, [places, placesSearch]);



  const groupedPlaces = useMemo(() => {
    if (!filteredPlaces || !filteredPlaces.length) return [];

    const map = new Map();

    filteredPlaces.forEach((p) => {
      const label = getPlaceGroupLabel(p);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label).push(p);
    });

    // 섹션 순서: ㄱ~ㅎ 정렬, 기타 정류소는 맨 뒤
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === "기타 정류소") return 1;
        if (b === "기타 정류소") return -1;
        return a.localeCompare(b, "ko-KR");
      })
      .map(([label, items]) => ({ label, items }));
  }, [filteredPlaces]);


  const handleSelectPlace = (place) => {
    const label = place.placeName || place.address || "";
    const lat = place.lat != null ? Number(place.lat) : null;
    const lng = place.lng != null ? Number(place.lng) : null;
    const price = place.price != null ? Number(place.price) : null; // 정류장 가격

    if (!lat || !lng) {
      alert("위치 정보가 올바르지 않습니다.");
      return;
    }

    // 선택한 정류장 정보
    const selectedPlace = {
      name: label,
      address: place.address || "",
      lat,
      lng,
      price,
    };

    // 항상 위드아지트(수지초점)를 반대편으로 세팅
    const agit = sujichoPlace
      ? {
        name: sujichoPlace.placeName || sujichoPlace.address || "",
        address: sujichoPlace.address || "",
        lat: Number(sujichoPlace.lat),
        lng: Number(sujichoPlace.lng),
        price:
          sujichoPlace.price != null ? Number(sujichoPlace.price) : null,
      }
      : null;

    if (placesTarget === "start") {
      // 출발지를 사용자가 선택 → 도착지는 항상 위드아지트
      setStartQuery(label);
      setStartPlace(selectedPlace);

      if (agit) {
        setEndQuery(agit.name);
        setEndPlace(agit);
      }
    } else {
      // 도착지를 사용자가 선택 → 출발지는 항상 위드아지트
      setEndQuery(label);
      setEndPlace(selectedPlace);

      if (agit) {
        setStartQuery(agit.name);
        setStartPlace(agit);
      }
    }

    setShowPlacesModal(false);
  };


  const slotChips = useMemo(
    () =>
      slots.map((s) => {
        const h12 = (s.hour % 12) || 12;
        const ampmLabel = s.ampm === "PM" ? "오후" : "오전";
        const datePretty = s.date.replace(/-/g, ".");
        return {
          id: s.id,
          top: `${datePretty}`,
          bottom: `${ampmLabel} ${String(h12).padStart(2, "0")}:${String(
            s.minute
          ).padStart(2, "0")}`,
        };
      }),
    [slots]
  );

  const handleAddToCart = () => {
    if (!slots.length) {
      alert("왼쪽에서 날짜·시간을 먼저 담아 주세요.");
      return;
    }
    if (!startQuery.trim() || !endQuery.trim()) {
      alert("출발지와 도착지를 모두 선택해 주세요.");
      return;
    }

    const next = [...(cartItems || [])];

    slots.forEach((s) => {
      const childName = childMap[s.childId] || "자녀";
      const h12 = (s.hour % 12) || 12;
      const ampmLabel = s.ampm === "PM" ? "오후" : "오전";
      const timeText = `${ampmLabel} ${String(h12).padStart(2, "0")}:${String(
        s.minute
      ).padStart(2, "0")}`;

      next.push({
        id: `cart-${s.id}-${Date.now()}`,
        childId: s.childId,
        childName,
        date: s.date,
        timeText,
        startLabel: startQuery,
        endLabel: endQuery,
        memo,
        priceKRW: estimatedFare || 0, // 🔥 정류장 price 기준
      });
    });

    onChangeCartItems(next);
  };

  return (
    <>
      <RightWrap>
        <SearchBlock>
          <SectionLabel>출발지 / 도착지</SectionLabel>
          <SearchFieldsWrap>
            <SearchRow>
              <SearchInputWrap>
                <SearchInput
                  placeholder="출발지 검색"
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchOrList("start");
                    }
                  }}
                />
                <SearchIconButton
                  type="button"
                  onClick={() => handleSearchOrList("start")}
                >
                  <SearchIconImg src={pickupSearchIcon} alt="검색" />
                </SearchIconButton>
              </SearchInputWrap>
            </SearchRow>

            <SearchRow>
              <SearchInputWrap>
                <SearchInput
                  placeholder="도착지 검색"
                  value={endQuery}
                  onChange={(e) => setEndQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchOrList("end");
                    }
                  }}
                />
                <SearchIconButton
                  type="button"
                  onClick={() => handleSearchOrList("end")}
                >
                  <SearchIconImg src={pickupSearchIcon} alt="검색" />
                </SearchIconButton>
              </SearchInputWrap>
            </SearchRow>

            {/* 🔁 가운데 스왑 버튼 + 세로 라인 */}

            <SwapButton type="button" onClick={handleSwapStartEnd}>
              <SwapIconImg src={pickupSwapIcon} alt="출발/도착 전환" />
            </SwapButton>
          </SearchFieldsWrap>


        </SearchBlock>

        <MemoLabel>메모 (선택)</MemoLabel>
        <MemoArea
          placeholder="픽업시 필요한 내용을 자유롭게 남겨주세요."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <CartActionsRow>
          <CartButton type="button" onClick={handleAddToCart}>
            장바구니에 담기
          </CartButton>
        </CartActionsRow>

        <CartList>
          {(cartItems || []).map((item) => (
            <CartCard key={item.id}>
              <CartLineTop>
                {item.childName} · {item.date}
              </CartLineTop>
              <CartLineMiddle>{item.timeText}</CartLineMiddle>
              <CartLineBottom>
                출발: {item.startLabel} / 도착: {item.endLabel}
              </CartLineBottom>

              <CartPriceLine>
                요금 {KRW(item.priceKRW)}원
              </CartPriceLine>
            </CartCard>
          ))}
        </CartList>
      </RightWrap>

      {showPlacesModal && (
        <ModalBackdrop
          onClick={() => {
            setShowPlacesModal(false);
          }}
        >
          <ModalCard
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ModalHeaderRow>
              <ModalTitle>픽업 정류소 선택</ModalTitle>
              <ModalCloseBtn onClick={() => setShowPlacesModal(false)}>
                ×
              </ModalCloseBtn>
            </ModalHeaderRow>

            <ModalSearchWrap>
              <ModalSearchInput
                placeholder="정류소 이름 또는 주소를 검색해 보세요"
                value={placesSearch}
                onChange={(e) => setPlacesSearch(e.target.value)}
              />
              <ModalSearchIcon src={pickupSearchIcon} alt="검색" />
            </ModalSearchWrap>

            <ModalList>
              {placesLoading ? (
                <ModalEmpty>정류장 목록을 불러오는 중입니다...</ModalEmpty>
              ) : !groupedPlaces.length ? (
                <ModalEmpty>조건에 맞는 정류장이 없습니다.</ModalEmpty>
              ) : (
                <>
                  {groupedPlaces.map((section) => (
                    <ModalSection key={section.label}>
                      <ModalSectionHeader>{section.label}</ModalSectionHeader>
                      {section.items.map((p) => (
                        <ModalItem
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPlace(p)}
                        >
                          <ModalItemName>{p.placeName || "이름 없음"}</ModalItemName>
                          <ModalItemAddress>{p.address || ""}</ModalItemAddress>
                        </ModalItem>
                      ))}
                    </ModalSection>
                  ))}

          
                </>
              )}
            </ModalList>

          </ModalCard>
        </ModalBackdrop>
      )}
    </>
  );
}


/* ================== 하단 안내/CTA ================== */

const InfoBoxWrap = styled.div`
  margin-top: 40px;
  padding: 26px 24px 24px;
  border-radius: 24px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${primaryText};
`;

const InfoList = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
  font-size: 13px;
  color: ${primaryText};
  line-height: 1.8;
`;

const InfoItem = styled.li`
  position: relative;
  padding-left: 18px;

  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 2px;
    font-size: 12px;
    color: #d1d5db;
  }

  .strong-link {
    color: #f97316;
    font-weight: 700;
    cursor: pointer;
  }
`;
const BottomBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  justify-content: center;
  pointer-events: none;     /* 안 보이는 영역 클릭 막기 */
  z-index: 50;

  @media (max-width: 768px) {
    bottom: 100px;
  }
`;

const ApplyButton = styled.button`
  width: 90%;
  max-width: 480px;
  height: 50px;
  border-radius: 999px;
  border: none;
  background: #e5e5e5;
  color: #4b5563;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0 24px;
  pointer-events: auto;     /* 버튼은 클릭 가능하게 */

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }

  @media (min-width: 960px) {
    max-width: 420px;
  }
`;


/* ================== 페이지 컴포넌트 ================== */

export default function PickupApplyPage() {
  const [slots, setSlots] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    // 진입 로깅 등 필요하면 여기
  }, []);

  return (
    <Page>
      <PageInner>
        <PageTitle>픽업 신청</PageTitle>
        <PageSub>
          안전하고 믿을 수 있는 픽업 서비스 — 여러 건을 한 번에 신청할 수 있어요.
        </PageSub>

        <MainGrid>
          <PickupLeftColumn slots={slots} onChangeSlots={setSlots} />
          <PickupRightColumn
            slots={slots}
            onChangeSlots={setSlots}
            cartItems={cartItems}
            onChangeCartItems={setCartItems}
          />
        </MainGrid>

        <InfoBoxWrap>
          <InfoTitleRow>
            <InfoTitle>안내 사항</InfoTitle>
          </InfoTitleRow>
          <InfoList>
            <InfoItem>
              매 달 1일~15일에 다음 달 선예약이 오픈됩니다. 16일 이후는 상황에 따라 픽업 예약이
              불가능 할 수 있습니다.
            </InfoItem>
            <InfoItem>
              리스트에 없는 픽업, 도착 장소는{" "}
              <span
                className="strong-link"
                onClick={() => alert("다른 픽업 장소 요청 페이지로 이동 예정")}
              >
                다른 픽업 장소 요청
              </span>
              을 통해 요청해 주세요. 1:1 상담을 통해 확정됩니다.
            </InfoItem>
            <InfoItem>
              픽업 출발 혹은 도착지 중 한 곳은 위드아지트로 설정 필요합니다. 추후 학원 ↔ 학원,
              위드아지트 ↔ 자택, 택시 서비스 등 오픈 예정
            </InfoItem>
            <InfoItem>
              <span
                className="strong-link"
                onClick={() => alert("다른 픽업 장소 요청하기 이동")}
              >
                다른 픽업 장소 요청하기
              </span>{" "}
              버튼 /{" "}
              <span
                className="strong-link"
                onClick={() => alert("수지초 아지트 정류장 확인하기 이동")}
              >
                수지초 아지트 정류장 확인하기
              </span>{" "}
              버튼
            </InfoItem>
          </InfoList>
        </InfoBoxWrap>

        <BottomBar>
          <ApplyButton
            type="button"
            onClick={() => {
              if (!cartItems.length) {
                alert("장바구니에 담긴 픽업 예약이 없습니다.");
                return;
              }
              setCheckoutOpen(true);
            }}
          >
            픽업 신청하기
          </ApplyButton>
        </BottomBar>
      </PageInner>

      <CheckoutPickupDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onProceed={(res) => {
          if (res?.ok) {
            // 결제 완료 시 장바구니/슬롯 초기화 정도만
            setCartItems([]);
            setSlots([]);
          }
        }}
      />
    </Page>
  );
}
