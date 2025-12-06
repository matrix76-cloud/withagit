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
    top: -60px;
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
  margin: 8px 12px 10px;
  padding: 8px 14px 9px;
  border-radius: 999px;
  border: 1px dashed #facc15;
  background: #fff9e6;
  font-size: 13px;
  font-weight: 700;
  color: #b45309;
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
  margin-top: 12px;
  padding: 18px 12px 14px;     /* ⬅️ 상단·좌우·하단 여백 넉넉하게 */
  border-radius: 18px;
  background: #ffffff;
`;

const CalendarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;                   /* 좌우 버튼·텍스트 간격 */
  margin-bottom: 18px;         /* 헤더와 요일 줄 사이 여백 */
`;

const MonthLabelText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${primaryText};
`;

const MonthNav = styled.div`
  display: flex;
  gap: 6px;
`;

const MonthNavBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  font-size: 18px;
  color: #111827;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;


  &:disabled {
    opacity: 0.4;
    cursor: default;

  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 10px;
  text-align: center;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 8px;                /* 날짜 사이 세로 간격 */
`;

const DayCell = styled.button`
  border: none;
  background: ${({ $selected }) => ($selected ? accent : "transparent")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#111827")};
  border-radius: 999px;
  font-size: 14px;
  padding: 10px 0;             /* 날짜 원 크기 ↑ */
  margin: 2px 0;
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) =>
    $selected ? accent : "rgba(249,115,22,0.06)"};
  }

  &:disabled {
    color: #d1d5db;
    cursor: default;
    background: transparent;
  }
`;




const SelectedDateText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${accent};
  letter-spacing: -0.03em;   /* 🔸 자간 살짝 좁게 */
`;

const ChildCard = styled.div`
  margin-top: 8px;
  border-radius: 24px;
  border: 1.5px solid #111827;
  background: #ffffff;
  overflow: hidden;
`;

const ChildCardHeader = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
`;

const ChildDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 8px;
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
  border-radius: 12px;
  border: 1px solid ${({ $primary }) => ($primary ? accent : "#f0eded")};
  background: ${({ $primary }) => ($primary ? accent : "#f0eded")};
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $primary }) => ($primary ? "#ffffff" : "#4b5563")};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
    border-color: #e5e7eb;
    background: #f3f4f6;
    color: #9ca3af;
  }
`;



const TimePickerBox = styled.div`
  border-radius: 18px;
  background: #fff;
  padding: 2px 16px 4px;
  box-sizing: border-box;
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
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
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
  margin: 10px 0 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SlotChip = styled.button`
  flex: 0 0 calc(50% - 5px);   /* 🔸 한 줄에 두 개 */
  box-sizing: border-box;
  position: relative;
  border-radius: 24px;
  border: 1px solid ${accent};
  padding: 10px 28px 10px 14px;
  background: #fff3e6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;

  .date-line {
    font-size: 12px;
    font-weight: 600;
    color: ${accent};
    letter-spacing: -0.03em;   /* 🔸 숫자 자간 줄이기 */
  }

  .time-line {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 700;
    color: ${accent};
    letter-spacing: -0.03em;   /* 🔸 숫자 자간 줄이기 */
  }
`;

const ChipRemove = styled.span`
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 24px;
  color: ${accent};
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

function formatSelectedDateLabel(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const weekday = WEEK_LABELS[date.getDay()];
  return `${y}. ${String(m).padStart(2, "0")}. ${String(d).padStart(
    2,
    "0"
  )} (${weekday})`;
}
function formatChipDateLabel(iso) {
  if (!iso) return "";
  const [yStr, mStr, dStr] = iso.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return iso;

  const dt = new Date(y, m - 1, d);
  const weekday = WEEK_LABELS[dt.getDay()];
  return `${y}. ${String(m).padStart(2, "0")}. ${String(d).padStart(
    2,
    "0"
  )}(${weekday})`;
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
const SwapButton = styled.div`
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border:none;
  padding: 0;
  z-index: 2;
`;

const SwapIconImg = styled.img`
  width: 30px;
  height: 30px;
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
  height: 180px;              /* 🔹 고정 높이 (피그마 느낌으로 적당히) */
  border-radius: 8px;
  border: none;              /* 외곽선 제거 */
  background: #f3f4f6;       /* 🔹 피그마처럼 연한 회색 배경 */
  padding: 12px 14px;
  font-size: 13px;
  font-family: inherit;
  color: ${primaryText};
  box-sizing: border-box;
  resize: none;              /* 🔹 크기 조정 아이콘 제거 */
  margin-top: 10px;
  outline: none;

  &::placeholder {
    color: #666;
  }

  &:focus {
    background: #f3f4f6;     /* 포커스 시 살짝만 밝게 */
    box-shadow: 0 0 0 1px #e5e7eb;
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

/* 장바구니 버튼 + 카드 */

const CartActionsRow = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const CartButton = styled.button`
  height: 40px;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  background: ${({ $primary }) => ($primary ? accent : "#e6e6e6")};
  color: ${({ $primary }) => ($primary ? "#ffffff" : "#666666")};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const CartList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* 피그마 스타일 예약 카드 */

const CartCard = styled.div`
  border-radius: 18px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  padding: 14px 16px 12px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);

  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CartHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const CartBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${accent};
  background: #fff3e6;
`;

const CartCloseBtn = styled.button`
  border: none;
  background: transparent;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 14px;
    height: 14px;
    color: #9ca3af;
  }

  &:hover {
    background: #f3f4f6;
  }
`;

const CartMainDateTime = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${primaryText};
  margin-bottom: 4px;
`;

const CartInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: ${primaryText};
  margin-top: 2px;
`;

const CartInfoKey = styled.span`
  flex: 0 0 auto;
  color: #9ca3af;
  font-weight: 500;
`;

const CartInfoVal = styled.span`
  flex: 1 1 auto;
  text-align: right;
  color: #4b5563;
  white-space: pre-line;
`;

const CartPriceLine = styled.div`
  margin-top: 6px;
  font-size: 13px;
  font-weight: 800;
  color: ${accent};
  text-align: right;
`;

/* 총 예상 가격 */
const CartTotalRow = styled.div`
  margin-top: 16px;              /* ⬅️ 윗부분과 간격 더 벌리기 */
  text-align: right;
  font-size: 13px;
  color: #111827;

  .label {
    font-weight: 400;
  }

  .value {
    margin-left: 6px;
    font-size: 15px;             /* ⬅️ 금액 폰트 더 큼 */
    font-weight: 800;            /* ⬅️ 금액만 굵게 */
  }
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

  /* 🔹 자녀별 보유 멤버십 태그 계산
     - 정규 멤버십(AGITZ)
     - 패밀리 멤버십(FAMILY)
     - 필요하면 타임패스/정액권도 확장 가능 */
  const membershipTagsByChild = useMemo(() => {
    const map = new Map();

    (ctxMemberships || []).forEach((m) => {
      if (!m || !m.childId) return;

      const status = m.status || MEMBERSHIP_STATUS.ACTIVE;
      if (
        status !== MEMBERSHIP_STATUS.ACTIVE &&
        status !== MEMBERSHIP_STATUS.FUTURE
      ) {
        return;
      }

      const list = map.get(m.childId) || [];

      switch (m.kind) {
        case MEMBERSHIP_KIND.AGITZ:
          if (!list.includes("정규 멤버십")) list.push("아지트 멤버십");
          break;
        case MEMBERSHIP_KIND.FAMILY:
          if (!list.includes("패밀리 멤버십")) list.push("패밀리 멤버십");
          break;
        case MEMBERSHIP_KIND.TIMEPASS:
          if (!list.includes("타임패스")) list.push("타임패스");
          break;
        case MEMBERSHIP_KIND.CASHPASS:
          if (!list.includes("정액권")) list.push("정액권");
          break;
        default:
          break;
      }

      map.set(m.childId, list);
    });

    return map;
  }, [ctxMemberships]);

  // 🔹 드롭다운에 쓸 자녀 리스트
  const childItems = useMemo(
    () =>
      children.map((c, index) => {
        const id = c.childId || c.id || "child-" + index;
        const name = c.name || c.childName || "";
        const birth = c.birth || c.birthDate || "";
        const tags = membershipTagsByChild.get(id) || [];

        return {
          id,
          name,
          birth,
          isDefault: index === 0,
          tags,
        };
      }),
    [children, membershipTagsByChild]
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

  // 🔹 달력/시간 상태 (원래 코드 그대로 유지)
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const monthCells = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

  const [ampm, setAmPm] = useState("AM");
  const [hour, setHour] = useState(1);
  const [minute, setMinute] = useState(0);

  const ampmItems = ["AM", "PM"];
  const hourItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );
  const minuteItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i * 5),
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

  const canAddSlot = !!(activeChildId && selectedDate);


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

          <ChildAddRowWrap>
            <ChildCard>
              {/* 상단: 선택 박스 */}
              <ChildCardHeader
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
              </ChildCardHeader>

              {/* 드롭다운 목록 */}
              {dropdownOpen && childItems.length > 0 && (
                <>
                  <ChildDivider />
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

                          {/* 🔹 여기서 멤버십 뱃지 표시 */}
                          {c.tags.length > 0 && (
                            <div className="badge-row">
                              {c.tags.map((label) => (
                                <span key={label} className="badge">
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </ChildItemButton>
                      );
                    })}
                  </ChildDropdown>
                </>
              )}

              {/* + 자녀 추가 버튼 */}
              <AddChildRow
                type="button"
                onClick={() => {
                  const isMobile =
                    typeof window !== "undefined" &&
                    window.matchMedia &&
                    window.matchMedia("(max-width: 768px)").matches;

                  navigate(isMobile ? "/m/account/children" : "/mypage");
                }}
              >
                <span>+</span>
                <span>자녀 추가</span>
              </AddChildRow>
            </ChildCard>
          </ChildAddRowWrap>
        </PickupSubSection>

        {/* 2) 날짜 선택 섹션 */}
        <PickupSubSection>
          <BlockLabelRow>
            {selectedDate ? (
              <SelectedDateText>
                {formatSelectedDateLabel(selectedDate)}
              </SelectedDateText>
            ) : (
              <SectionLabel>날짜를 선택해주세요</SectionLabel>
            )}
          </BlockLabelRow>

          <CalendarShell>
            <CalendarHeaderRow>
              <MonthNavBtn type="button" onClick={() => moveMonth(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M15 4L9 12L15 20"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </MonthNavBtn>
              <MonthLabelText>{formattedMonth}</MonthLabelText>
              <MonthNavBtn type="button" onClick={() => moveMonth(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M9 4L15 12L9 20"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
            <TimeApplyButton
              type="button"
              onClick={addSlot}
              disabled={!canAddSlot}
              $primary={canAddSlot}
            >
              이대로 담기
            </TimeApplyButton>
          </TimeHeaderRow>
          <TimePickerBox>
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
        </PickupSubSection>
      </PickupMainCard>

      {/* 담긴 슬롯 리스트 */}
      <SelectedSlotsRow>
        {slots.map((s) => (
          <SlotChip key={s.id} type="button" onClick={() => removeSlot(s.id)}>
            <div className="date-line">{formatChipDateLabel(s.date)}</div>
            <div className="time-line">
              {s.ampm === "PM" ? "오후" : "오전"}{" "}
              {String((s.hour % 12) || 12).padStart(2, "0")}:
              {String(s.minute).padStart(2, "0")}
            </div>
            <ChipRemove>×</ChipRemove>
          </SlotChip>
        ))}
      </SelectedSlotsRow>
    </LeftWrap>
  );
}


/* ================== 오른쪽 컬럼 (지도 + 정류장 모달 + 장바구니) ================== */

function PickupRightColumn({ slots, onChangeSlots, cartItems, hasPickupMembership, onChangeCartItems,
  onExposeChildMap,          // ← 추가
  onExposePickupChildIds     // ← 추가
 }) {
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

  
  const { children: ctxChildren, memberships: ctxMemberships } = useUser() || {};
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


 const pickupEligibleChildIds = useMemo(() => {
   const set = new Set();
   const list = Array.isArray(ctxMemberships) ? ctxMemberships : [];

   list.forEach((m) => {
     if (!m || !m.childId) return;

     const kind = m.kind;
     const status = m.status;

     const isPickupKind =
       kind === MEMBERSHIP_KIND.AGITZ ||
       kind === "agitz" ||
       kind === MEMBERSHIP_KIND.FAMILY ||
       kind === "family";

     const isActive =
       !status ||
       status === MEMBERSHIP_STATUS.ACTIVE ||
       status === "active" ||
       status === MEMBERSHIP_STATUS.FUTURE ||
       status === "future";

     if (isPickupKind && isActive) {
       set.add(m.childId);
     }
   });

   console.groupCollapsed("[PickupRightColumn] pickupEligibleChildIds");
   console.log("memberships:", list);
   console.log("eligible childIds:", Array.from(set));
   console.groupEnd();

   return set;
 }, [ctxMemberships]);

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

  // 지도 초기화
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const MAX_TRIES = 40;

    const tryInitMap = () => {
      if (cancelled) return;

      const kakao = window.kakao;
      const hasKakao = !!(kakao && kakao.maps);
      const hasRef = !!mapRef.current;

      if (!hasRef || !hasKakao) {
        tries += 1;
        if (tries < MAX_TRIES) {
          setTimeout(tryInitMap, 250);
        }
        return;
      }

      if (mapInstanceRef.current) {
        return;
      }

      const center = new kakao.maps.LatLng(37.31476, 127.0856);
      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      });

      mapInstanceRef.current = map;
    };

    tryInitMap();

    return () => {
      cancelled = true;
    };
  }, []);

  // 출발/도착 변경 시 마커/라인 + 거리/요금
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !kakao.maps || !map) return;

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

    if (!startPlace && !endPlace) {
      setDistanceKm(0);
      setEstimatedFare(0);
      return;
    }

    const bounds = new kakao.maps.LatLngBounds();
    const path = [];

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
      el.style.transform = "translateY(-8px)";

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1,
        zIndex: zIndex ?? 10,
      });

      overlay.setMap(map);
      return overlay;
    };

    if (startPlace && startPlace.lat && startPlace.lng) {
      const pos = new kakao.maps.LatLng(startPlace.lat, startPlace.lng);
      const overlay = makeLabelOverlay(pos, "출발", "#f97316", 20);
      startMarkerRef.current = overlay;
      bounds.extend(pos);
      path.push(pos);
    }

    if (endPlace && endPlace.lat && endPlace.lng) {
      const pos = new kakao.maps.LatLng(endPlace.lat, endPlace.lng);
      const overlay = makeLabelOverlay(pos, "도착", "#2563eb", 20);
      endMarkerRef.current = overlay;
      bounds.extend(pos);
      path.push(pos);
    }

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

  const handleSearchOrList = (target) => {
    const keywordRaw = target === "start" ? startQuery : endQuery;
    const keyword = (keywordRaw || "").trim();

    if (!keyword) {
      openPlacesModal(target);
    } else {
      openPlacesModal(target, keyword);
    }
  };

  const handleSwapStartEnd = () => {
    const newStartQuery = endQuery;
    const newEndQuery = startQuery;
    setStartQuery(newStartQuery);
    setEndQuery(newEndQuery);

    setStartPlace(endPlace);
    setEndPlace(startPlace);
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
    const price = place.price != null ? Number(place.price) : null;

    if (!lat || !lng) {
      alert("위치 정보가 올바르지 않습니다.");
      return;
    }

    const selectedPlace = {
      name: label,
      address: place.address || "",
      lat,
      lng,
      price,
    };

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
      setStartQuery(label);
      setStartPlace(selectedPlace);

      if (agit) {
        setEndQuery(agit.name);
        setEndPlace(agit);
      }
    } else {
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
      slots.map((s, idx) => {
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
    console.groupCollapsed("[PickupRightColumn] handleAddToCart");
    console.log("slots:", slots);
    console.log("pickupEligibleChildIds:", Array.from(pickupEligibleChildIds));
    console.groupEnd();

    if (!slots.length) {
      alert("왼쪽에서 날짜·시간을 먼저 담아 주세요.");
      return;
    }
    if (!startQuery.trim() || !endQuery.trim()) {
      alert("출발지와 도착지를 모두 선택해 주세요.");
      return;
    }

    // 🔹 슬롯에 담긴 자녀들 중, 멤버십 없는 아이가 있는지 체크
    const invalidChildIds = new Set();
    slots.forEach((s) => {
      const cid = s.childId;
      if (!cid) {
        invalidChildIds.add("__unknown__");
        return;
      }
      if (!pickupEligibleChildIds.has(cid)) {
        invalidChildIds.add(cid);
      }
    });

    if (invalidChildIds.size > 0) {
      // 첫 번째 문제 자녀만 메시지에 표시
      const firstId = invalidChildIds.values().next().value;
      const childName =
        firstId === "__unknown__" ? "선택된 자녀" : childMap[firstId] || firstId;

      alert(
        `픽업은 아지트/패밀리 멤버십이 있는 자녀만 신청 가능합니다.\n'${childName}'의 멤버십을 먼저 확인해 주세요.`
      );

      // 필요하면 멤버십 구매 팝업도 같이 띄우기
      // if (onNeedMembership) onNeedMembership();

      return;
    }

    // 🔹 여기까지 왔으면 모든 슬롯 자녀가 멤버십 보유 → 장바구니에 담기
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
        priceKRW: estimatedFare || 0,
      });
    });

    onChangeCartItems(next);
  };


  const handleRemoveCartItem = (id) => {
    const next = (cartItems || []).filter((item) => item.id !== id);
    onChangeCartItems(next);
  };

  const totalPrice = useMemo(
    () =>
      (cartItems || []).reduce(
        (sum, item) => sum + Number(item.priceKRW || 0),
        0
      ),
    [cartItems]
  );

  const canAddCart =
    slots.length > 0 &&
    startQuery.trim().length > 0 &&
    endQuery.trim().length > 0;
  
  useEffect(() => {
    if (onExposeChildMap) {
      onExposeChildMap(childMap);
    }
  }, [childMap]);

  // 상위로 eligibleChildIds 전달
  useEffect(() => {
    if (onExposePickupChildIds) {
      onExposePickupChildIds(pickupEligibleChildIds);
    }
  }, [pickupEligibleChildIds]);
  return (
    <>
      <RightWrap>
        <SearchBlock>
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

            <SwapButton type="button" onClick={handleSwapStartEnd}>
              <SwapIconImg src={pickupSwapIcon} alt="출발/도착 전환" />
            </SwapButton>
          </SearchFieldsWrap>
        </SearchBlock>

        <FullListRow>
          <FullListLink
            type="button"
            onClick={() => {
              window.open(
                "https://withagit.notion.site/2a373656c615801da096d43782fbbb72?v=608db1f3f2cc437db42fa66234bfd190",
                "_blank"
              );
            }}
          >
            출발/도착 전체보기
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 5h10v10M9 15L19 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </FullListLink>
        </FullListRow>

        <MapBox>
          <MapContainer ref={mapRef} />
          {distanceKm > 0 && (
            <DistanceRow>
              예상 거리 약 {distanceKm.toFixed(1)}km · 예상 요금{" "}
              {KRW(estimatedFare)}원
            </DistanceRow>
          )}
        </MapBox>

        <CartActionsRow>
          <CartButton
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddCart}
            $primary={canAddCart}
          >
            예약 담기
          </CartButton>
        </CartActionsRow>

        <MemoLabel>메모 (선택)</MemoLabel>
        <MemoArea
          placeholder="픽업시 필요한 내용을 자유롭게 남겨주세요."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        {/* 예약 카드 리스트 */}
        <CartList>
          {(cartItems || []).map((item, index) => {
            const dateLabel = formatChipDateLabel(item.date);
            return (
              <CartCard key={item.id}>
                <CartHeaderRow>
                  <CartBadge>예약정보 {index + 1}</CartBadge>
                  <CartCloseBtn
                    type="button"
                    aria-label="예약 삭제"
                    onClick={() => handleRemoveCartItem(item.id)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </CartCloseBtn>
                </CartHeaderRow>

                <CartMainDateTime>
                  {dateLabel} {item.timeText}
                </CartMainDateTime>

                <CartInfoRow>
                  <CartInfoKey>자녀</CartInfoKey>
                  <CartInfoVal>{item.childName}</CartInfoVal>
                </CartInfoRow>
                <CartInfoRow>
                  <CartInfoKey>출발지</CartInfoKey>
                  <CartInfoVal>{item.startLabel}</CartInfoVal>
                </CartInfoRow>
                <CartInfoRow>
                  <CartInfoKey>도착지</CartInfoKey>
                  <CartInfoVal>{item.endLabel}</CartInfoVal>
                </CartInfoRow>

                <CartInfoRow>
                  <CartInfoKey>픽업 예상 가격</CartInfoKey>
                  <CartInfoVal>{KRW(item.priceKRW)}원</CartInfoVal>
                </CartInfoRow>
              </CartCard>
            );
          })}
        </CartList>

        {cartItems && cartItems.length > 0 && (
          <CartTotalRow>
            <span className="label">픽업 총 예상 가격</span>
            <span className="value">{KRW(totalPrice)}원</span>
          </CartTotalRow>
        )}
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
  width: 80%;
  max-width: 380px;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: ${({ $primary }) => ($primary ? accent : "#e4e4e4")};
  color: ${({ $primary }) => ($primary ? "#ffffff" : "#4b5563")};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  padding: 0 24px;
  pointer-events: auto;

  &:hover {
    filter: brightness(0.99);
  }

  &:active {
    transform: translateY(1px);
  }

  /* 🔹 disabled일 때도 투명도는 그대로, 클릭만 막기 */
  &:disabled {
    cursor: default;
  }

  @media (min-width: 960px) {
    max-width: 360px;
  }
`;

const MembershipGuardBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MembershipGuardCard = styled.div`
  width: min(360px, 90vw);
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
  text-align: center;
`;

const MembershipGuardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
`;

const MembershipGuardText = styled.div`
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 18px;
`;

const MembershipGuardButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const MembershipGuardBtnMain = styled.button`
  min-width: 140px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: ${accent};
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const MembershipGuardBtnSub = styled.button`
  min-width: 90px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;



const FullListRow = styled.div`
  margin-top: 6px;
  text-align: right;
`;

const FullListLink = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  font-size: 12px;
  font-weight: 700;
  color: ${accent};

  display: inline-flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;


/* ================== 페이지 컴포넌트 ================== */

export default function PickupApplyPage() {
  
  const { memberships: ctxMemberships } = useUser() || {};
  const nav = useNavigate();

  const [slots, setSlots] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [membershipGuardOpen, setMembershipGuardOpen] = useState(false);
  const [eligibleChildIds, setEligibleChildIds] = useState(new Set());
  const [childMap, setChildMap] = useState({});
  
  useEffect(() => {
    console.groupCollapsed("[PickupApplyPage] mount");
    console.log("ctxMemberships:", ctxMemberships);
    console.groupEnd();
  }, [ctxMemberships]);

  const hasPickupMembership = useMemo(
    () =>
      (ctxMemberships || []).some(
        (m) =>
          (m.kind === MEMBERSHIP_KIND.AGITZ ||
            m.kind === "agitz" ||
            m.kind === MEMBERSHIP_KIND.FAMILY ||
            m.kind === "family") &&
          (m.status === MEMBERSHIP_STATUS.ACTIVE ||
            m.status === "active" ||
            m.status === MEMBERSHIP_STATUS.FUTURE ||
            m.status === "future")
      ),
    [ctxMemberships]
  );


  const canApply = cartItems.length > 0;

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
            onExposePickupChildIds={setEligibleChildIds}   // 🔥 추가
            onExposeChildMap={setChildMap}                 // 🔥 추가
          />
        </MainGrid>

        <InfoBoxWrap>
          <InfoTitleRow>
            <InfoTitle>안내 사항</InfoTitle>
          </InfoTitleRow>
          <InfoList>
            <InfoItem>
              매 달 <strong>1일~15일</strong>에 다음 달 선예약이 오픈됩니다.
            </InfoItem>
            <InfoItem>
              <strong>16일 이후</strong>는 상황에 따라 픽업 예약이 불가능할 수 있습니다.
            </InfoItem>
            <InfoItem>
              리스트에 없는 픽업 정류장은 <strong>위드아지트로 연락</strong>해 주세요.
              1:1 상담을 통해 확정됩니다.
            </InfoItem>
            <InfoItem>
              픽업 출발 혹은 도착지 중 한 곳은 <strong>위드아지트</strong>로 설정되어야 합니다.
              <br />
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                (학원 ↔ 학원, 위드아지트 ↔ 자택, 택시 서비스 등 오픈 예정)
              </span>
            </InfoItem>
            <InfoItem>
              <span
                className="strong-link"
                onClick={() => {
                  window.open("http://pf.kakao.com/_qYzvkn/chat", "_blank");
                }}
              >
                다른 픽업 장소 요청하기
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {" "} (카카오톡 채널로 연결)
              </span>
            </InfoItem>
            <InfoItem>
              <span
                className="strong-link"
                onClick={() => {
                  window.open(
                    "https://withagit.notion.site/2a373656c615801da096d43782fbbb72?v=608db1f3f2cc437db42fa66234bfd190",
                    "_blank"
                  );
                }}
              >
                위드아지트 정류장 확인하기
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {" "} (노선 전체 정류장 페이지)
              </span>
            </InfoItem>
          </InfoList>
        </InfoBoxWrap>

        {/* 하단 픽업 신청 버튼 */}
        <BottomBar>
          <ApplyButton
            type="button"
            disabled={!canApply}
            $primary={canApply}
            onClick={() => {
              if (!canApply) return;

              // 🔹 장바구니에 담긴 자녀 childId만 검사 (중복 제거)
              const pickupChildIds = [...new Set(cartItems.map(i => i.childId))];

              // 🔹 eligibleChildIds 는 PickupRightColumn → PickupApplyPage 로 전달된 Set
              const invalid = pickupChildIds.filter(cid => !eligibleChildIds.has(cid));

              if (invalid.length > 0) {
                const badId = invalid[0];
                const badName = childMap[badId] || "해당 자녀";

                alert(
                  `픽업은 아지트/패밀리 멤버십이 있는 자녀만 신청 가능합니다.\n'${badName}'의 멤버십을 먼저 확인해주세요.`
                );

                setMembershipGuardOpen(true);
                return;
              }

              // 🔥 정상 → 결제창
              setCheckoutOpen(true);
            }}
          >
            픽업 신청하기
          </ApplyButton>


        </BottomBar>
      </PageInner>

      {/* 결제 / 신청 다이얼로그 */}
      <CheckoutPickupDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onProceed={(res) => {
          if (res?.ok) {
            setCartItems([]);
            setSlots([]);
          }
        }}
      />

      {/* 멤버십 가드 팝업 */}
      {membershipGuardOpen && (
        <MembershipGuardBackdrop
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMembershipGuardOpen(false);
            }
          }}
        >
          <MembershipGuardCard onClick={(e) => e.stopPropagation()}>
            <MembershipGuardTitle>멤버십이 필요해요</MembershipGuardTitle>
            <MembershipGuardText>
              픽업 서비스는{" "}
              <strong>아지트 / 패밀리 멤버십</strong> 회원만 이용하실 수 있어요.
              <br />
              멤버십을 먼저 가입한 후 다시 신청해 주세요.
            </MembershipGuardText>
            <MembershipGuardButtons>
              <MembershipGuardBtnSub
                type="button"
                onClick={() => setMembershipGuardOpen(false)}
              >
                닫기
              </MembershipGuardBtnSub>
              <MembershipGuardBtnMain
                type="button"
                onClick={() => {
                  setMembershipGuardOpen(false);
                  const isMobile =
                    typeof window !== "undefined" &&
                    window.matchMedia &&
                    window.matchMedia("(max-width: 768px)").matches;
                  nav(isMobile ? "/m/membership" : "/membership");
                }}
              >
                멤버십 구매하러 가기
              </MembershipGuardBtnMain>
            </MembershipGuardButtons>
          </MembershipGuardCard>
        </MembershipGuardBackdrop>
      )}
    </Page>
  );
}
