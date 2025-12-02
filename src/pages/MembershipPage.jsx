/* eslint-disable */
// src/pages/MembershipPage.jsx
import React, { useState } from "react";

import styled, { keyframes } from "styled-components";

import MembershipPlans from "../components/MembershipPlans";

// 멤버십 혜택 오른쪽 일러스트 5개 (형이 실제 파일명/경로에 맞게 교체)
import benefit1Img from "../assets/membership/benefit-1.png";
import benefit2Img from "../assets/membership/benefit-2.png";
import benefit3Img from "../assets/membership/benefit-3.png";
import benefit4Img from "../assets/membership/benefit-4.png";
import benefit5Img from "../assets/membership/benefit-5.png";

import familyTimeImg from "../assets/membership/family-time-full.png";
import howToStepsImg from "../assets/membership/how-to-steps.png";

// 프로그램 아이콘 이미지들
import weekendBlockImg from "../assets/program/weekend-block.png";
import weekendWoodImg from "../assets/program/weekend-wood.png";
import weekendBoardImg from "../assets/program/weekend-board.png";
import weekendWoodImg2 from "../assets/program/weekend-wood2.png";

import vacationThemeImg from "../assets/program/vacation-theme.png";
import vacationReadingImg from "../assets/program/vacation-reading.png";

import seasonSchoolImg from "../assets/program/season-school.png";
import seasonStudyImg from "../assets/program/season-study.png";


import heroSlide1Img from "../assets/membership/hero-slide-1.png";
import heroSlide2Img from "../assets/membership/hero-slide-2.png";
import heroSlide3Img from "../assets/membership/hero-slide-3.png";
import heroSlide4Img from "../assets/membership/hero-slide-4.png";
import heroSlide5Img from "../assets/membership/hero-slide-5.png";


import spaceShareWeekdayImg from "../assets/membership/space-share-weekday.png";
import spaceShareSundayImg from "../assets/membership/space-share-sunday.png";


import parentStep1Img from "../assets/membership/parent-step1.png";
import parentStep2Img from "../assets/membership/parent-step2.png";
import parentStep3Img from "../assets/membership/parent-step2.png";
import parentStep4Img from "../assets/membership/parent-step4.png";

import childStep1Img from "../assets/membership/child-step1.png";
import childStep2Img from "../assets/membership/child-step2.png";
import childStep3Img from "../assets/membership/child-step3.png";
import childStep4Img from "../assets/membership/child-step4.png";
import childStep5Img from "../assets/membership/child-step5.png";



const Page = styled.main`
  background: #ffffff;
  min-height: 100dvh;
`;

/* ===== 멤버십 혜택 히어로 섹션 ===== */

/* ===== 멤버십 혜택 히어로 섹션 + 이미지 슬라이드 ===== */

const HeroSection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: 72px 16px 32px;
  background: #f7f7fa;

  @media (max-width: 960px) {
    padding: 56px 16px 24px;
  }
`;

const HeroInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  text-align: center;
  font-family: "NanumSquareRound";
`;

const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
  color: #f07a2a;
  margin-bottom: 16px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(24px, 3.2vw, 32px);
  font-weight: 900;
  line-height: 1.4;
  color: #111111;
  letter-spacing: -0.03em;
`;

const HeroTitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 2px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -2px;
    right: -2px;
    bottom: 3px;
    height: 0.55em;      /* 글자 절반 정도 채워지는 형광펜 느낌 */
    background: #ffe39b; /* 통일된 형광펜 색 */
    border-radius: 6px;  /* 살짝 라운드 */
    z-index: -1;
  }
`;


const HeroSub = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: #555555;
`;

/* ▼ 히어로 이미지 슬라이더 */

const HeroSliderWrap = styled.div`
  margin-top: 24px;
`;

const HeroSliderScroller = styled.div`
  display: flex;
  align-items: stretch;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 4px 10px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeroSlide = styled.div`
  flex: 0 0 220px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  padding: 14px 14px 12px;

  /* 🔸 모바일: 한 화면에 카드 2장 + 3번째 카드 1/3 정도 힌트로 보이게 */
  @media (max-width: 768px) {
    flex: 0 0 calc(100% / 2.3);
  }

  /* 🔸 PC에서는 살짝 더 넓게 */
  @media (min-width: 960px) {
    flex: 0 0 240px;
  }
`;

const HeroSlideImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  border-radius: 18px;
`;




/* 공통 섹션 래퍼 (이미지 섹션에서 사용) */
const ImageSection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: ${({ $pt = 80, $pb = 96 }) => `${$pt}px 16px ${$pb}px`};
  background: ${({ $bg }) => $bg || "#ffffff"};

  @media (max-width: 960px) {
    padding: ${({ $pt = 56, $pb = 72 }) => `${$pt}px 16px ${$pb}px`};
  }
`;

const ImageInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const FullImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

/* ================= 멤버십 혜택 1~5 섹션 ================= */


const BenefitCard = styled.div`
  width: 88%;
  max-width: 960px;
  margin: 0 auto;

  border-radius: 80px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04);
  padding: 52px 64px;
  display: flex;
  flex-direction: ${({ $reverse }) => ($reverse ? "row-reverse" : "row")};
  align-items: center;
  gap: 24px;

  @media (max-width: 960px) {
    width: 100%;
    max-width: 100%;
    border-radius: 32px;
    padding: 28px 22px 26px;
    flex-direction: column;      /* 위아래로 쌓기 */
    align-items: stretch;
    gap: 16px;
  }
`;



const BenefitLeft = styled.div`
  flex: 1.2;
  font-family: "NanumSquareRound";
  text-align: left;

  @media (max-width: 960px) {
    order: 2;              /* 모바일에서 텍스트는 아래로 */
  }
`;



const BenefitSection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: 72px 16px 80px;
  background: #f7f7fa;

  @media (max-width: 960px) {
    padding: 56px 16px 64px;
  }
`;

const BenefitInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;


const BenefitEyebrow = styled.p`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #f07a2a;

  @media (max-width: 960px) {
    display: none;
  }
`;
const BenefitTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1.5;
  color: #111111;

  @media (max-width: 960px) {
    font-size: 22px;
  }
`;

const BenefitBullets = styled.ul`
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
    @media (max-width: 960px) {
    font-size: 16px;
  }
`;

const BenefitBullet = styled.li`
  position: relative;
  padding-left: 20px;
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.7;
  color: #555555;

  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 0;
    font-size: 13px;
    color: #f07a2a;
  }
    @media (max-width: 960px) {
    font-size: 12px;
  }
`;

const BenefitExampleTag = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffe7b1;
  font-size: 12px;
  font-weight: 700;
  color: #8a5b16;
      @media (max-width: 960px) {
    font-size: 9px;
  }
`;

const BenefitPickupLink = styled.button`
  margin-top: 18px;
  padding: 0;
  border: none;
  background: none;
  font-family: "NanumSquareRound";
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  cursor: pointer;
`;

const BenefitRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 960px) {
    order: 1;                  /* 아이콘을 위로 */
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 4px;
  }
`;

const BenefitIconCircle = styled.div`
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: #f4f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 960px) {
    /* 🔸 모바일에서는 동그라미 배경/사이즈 제거 + 왼쪽 정렬 */
    width: auto;
    height: auto;
    border-radius: 0;
    background: transparent;
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

const BenefitIconImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: contain;

  @media (max-width: 960px) {
    /* 🔸 모바일용 아이콘은 작게 */
    width: 56px;
    height: 56px;
  }
`;




/* ===== "위드아지트는 이렇게 이용해요" 섹션 전용 스타일 ===== */

const HowSection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: 80px 16px 96px;
  background: #fffdf8;

  @media (max-width: 960px) {
    padding: 56px 16px 72px;
  }
`;

const HowInner = styled.div`
  max-width: 1120px;
  margin: 0 auto 32px;
  text-align: center;
`;

const HowEyebrow = styled.p`
  margin: 0 0 8px;
  font-family: "NanumSquareRound";
  font-size: 14px;
  font-weight: 700;
  color: #f07a2a;
`;

const HowTitle = styled.h2`
  margin: 0 0 12px;
  font-family: "NanumSquareRound";
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 900;
  line-height: 1.3;
  color: #1b130c;
  letter-spacing: -0.03em;
`;

const HowHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 4px;
    height: 45%;
    background: #ffe39b;
    border-radius: 999px;
    z-index: -1;
  }
`;

const HowSub = styled.p`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: 15px;
  line-height: 1.8;
  color: #757575;
`;

/* ===== 프로그램 섹션 스타일 (이전 그대로) ===== */

const ProgramSection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: 80px 16px 96px;
  background: #ffffff;

  @media (max-width: 960px) {
    padding: 64px 16px 80px;
  }
`;

const ProgramInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const ProgramHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const ProgramEyebrow = styled.p`
  margin: 0 0 10px;
  font-family: "NanumSquareRound";
  font-size: 13px;
  font-weight: 700;
  color: #f07a2a;
`;

const ProgramTitle = styled.h2`
  margin: 0 0 18px;
  font-family: "NanumSquareRound";
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 900;
  line-height: 1.4;
  color: #111111;
  letter-spacing: -0.03em;
`;

const ProgramHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 2px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -2px;
    right: -2px;
    bottom: 3px;
    height: 0.55em;       /* 글자 절반 높이만 칠하기 */
    background: #ffe39b;  /* 형광펜 색 */
    border-radius: 6px;   /* 살짝 둥글게 */
    z-index: -1;
  }
`;


const ProgramTabsRow = styled.div`
  /* 폭을 콘텐츠만큼만 쓰고 중앙 정렬 */
  display: inline-flex;
  align-items: flex-end;
  gap: 20px;              /* 탭 사이 간격 */
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e5e5;
  margin: 32px auto 0;    /* 가운데 정렬 */
`;


const ProgramTab = styled.div`
  position: relative;
  padding: 10px 4px 14px;   /* 좌우 패딩 줄여서 탭 폭도 슬림하게 */
  cursor: pointer;
  font-family: "NanumSquareRound";
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  color: ${({ $active }) => ($active ? "#111111" : "#b3b3b3")};

  &::after {
    content: "";
    position: absolute;
    left: 0;                /* 밑줄을 텍스트 폭에 맞게 */
    right: 0;
    bottom: -2px;
    height: 2px;
    background: ${({ $active }) => ($active ? "#f7f7a2a" : "transparent")};
    border-radius: 999px;
  }
`;


const scrollIcons = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-85%);  /* ⬅️ 35% → 55% 로 늘려서 4번째까지 보이게 */
  }
  100% {
    transform: translateX(0);
  }
`;

/* 오른쪽 아이콘 배너 컨테이너 */
const ProgramRight = styled.div`
  overflow: hidden;         /* 배너 밖으로 나간 부분은 숨김 */
`;

/* 4개짜리 탭에서만 사용하는 자동 슬라이드 배너 줄 */
const ProgramIconsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 48px;
  animation: ${scrollIcons} 8s ease-in-out infinite; /* ⬅️ 10s → 8s (더 빠르게) */
`;
/* 2개짜리 탭 등, 정적인 아이콘 줄 */
const ProgramIconsStaticRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
`;

const ProgramIconCard = styled.div`
  flex: 0 0 auto;
  min-width: 140px;
  max-width: 160px;
  text-align: center;
  font-family: "NanumSquareRound";
`;

const ProgramIconImage = styled.img`
  width: 120px;
  height: 120px;
  margin: 0 auto 12px;
  display: float;
  object-fit: contain;
`;

const ProgramIconTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #222222;
`;

const ProgramIconCaption = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #777777;
`;






const ProgramBody = styled.div`
  margin: 40px auto 0;                             /* 살짝 위 여백만 */
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); 
  column-gap: 32px;                                /* ✅ 기존 56px → 32px 로 좁힘 */
  align-items: center;
  width: 80%;
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 32px;
  }
`;

const ProgramLeft = styled.div`
  font-family: "NanumSquareRound";
  text-align: left;
`;

const ProgramLabel = styled.p`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #f07a2a;
`;

const ProgramHeading = styled.h3`
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.5;
  color: #111111;

  @media (max-width: 960px) {
    font-size: 22px;
  }
`;

const ProgramBulletList = styled.ul`
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
`;

const ProgramBulletItem = styled.li`
  position: relative;
  padding-left: 20px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.7;
  color: #555555;

  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 0;
    font-size: 13px;
    color: #f07a2a;
  }
`;

const ProgramTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffe7b1;
  font-size: 12px;
  font-weight: 700;
  color: #8a5b16;
`;


/* 시즌 프로그램용 박스 레이아웃 */

const SeasonCard = styled.div`
  flex: 1 1 160px;
  min-width: 180px;
  max-width: 220px;
  border-radius: 18px;
  border: 1px dashed #4e8bff;
  padding: 16px 16px 18px;
  background: #f7fbff;
  font-family: "NanumSquareRound";
  text-align: left;
`;

const SeasonTitle = styled.div`
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 800;
  color: #1a3d7b;
`;

const SeasonCaption = styled.div`
  font-size: 12px;
  color: #4c6a9b;
`;

/* ===== 픽업 요금표 모달 ===== */

const PickupModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PickupModalCard = styled.div`
  width: min(960px, 92vw);
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  padding: 40px 40px 32px;
  position: relative;
`;

const PickupModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 22px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
`;

const PickupModalTitle = styled.h3`
  margin: 0 0 24px;
  text-align: center;
  font-family: "NanumSquareRound";
  font-size: 24px;
  font-weight: 900;
  line-height: 1.4;
  color: #222;
`;

const PickupTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "NanumSquareRound";
  font-size: 14px;
`;

const PickupHeadCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  background: #e3f0ff;
  color: #2456a6;
  font-weight: 700;
  border-bottom: 1px solid #d8e4f8;
`;

const PickupCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #444;
`;

const PickupPriceCell = styled(PickupCell)`
  text-align: right;
  font-weight: 700;
`;

/* ===== 공간 대관 서비스 섹션 ===== */

const FamilySection = styled.section`
  width: 100%;
  box-sizing: border-box;
  padding: 80px 16px 96px;
  background: #f4f4f6;

  @media (max-width: 960px) {
    padding: 64px 16px 80px;
  }
`;

const FamilyInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  font-family: "NanumSquareRound";
`;

const FamilyHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const FamilyEyebrow = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #f07a2a;
`;

const FamilyTitle = styled.h2`
  margin: 0 0 6px;
  font-size: clamp(24px, 3.2vw, 30px);
  font-weight: 900;
  line-height: 1.4;
  color: #111111;
  letter-spacing: -0.03em;
`;

const FamilyHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 2px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -2px;
    right: -2px;
    bottom: 3px;
    height: 0.55em;          /* 글자 높이의 절반 정도만 칠해짐 */
    background: #ffe39b;     /* 형광펜 색 */
    border-radius: 6px;      /* 살짝만 둥글게 */
    z-index: -1;
  }
`;


const FamilySub = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: #555555;
`;


const FamilyCards = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FamilyCard = styled.div`
  border-radius: 64px;
  background: #ffffff;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.04);

  @media (max-width: 960px) {
    height : 140px;
    padding: 18px 60px;
  }
`;

const FamilyCardLeft = styled.div`
  flex: 1.2;
  min-width: 0;
`;

const FamilyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
  background: ${({ $variant }) =>
    $variant === "orange" ? "#f97316" : "#2563eb"};
  margin-bottom: 8px;
`;

const FamilyCardTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #111111;
  line-height: 1.45;
  white-space: pre-line;

  @media (max-width: 960px) {
    font-size: 14px;
  }
`;

const FamilyCardRight = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FamilyCardIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 960px) {
    width: 68px;
    height: 68px;
  }
`;

const FamilyCardIcon = styled.img`
  width: 42px;
  height: 42px;
  object-fit: contain;

  @media (max-width: 960px) {
    width: 38px;
    height: 38px;
  }
`;



/* ===== 멤버십 이용 방법 – 단계 카드 ===== */

const HowGroupsWrap = styled.div`
  max-width: 1120px;
  margin: 28px auto 0;
  font-family: "NanumSquareRound";
  padding:20px;
`;

const HowGroup = styled.div`
  & + & {
    margin-top: 24px;
  }
`;

const HowGroupTitle = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 900;
  color: #111;
`;




const HowStepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px; /* 세로 12, 가로 16 */

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const HowStepCard = styled.div`
  border-radius: 24px;

  padding: 12px 12px 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 960px) {
    /* 모바일에서도 2열이니까 min-width 안 줘도 됨 */
  }
`;

const HowStepImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
`;




const HowStepBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 10px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;




/* ===== 프로그램 탭 데이터 ===== */

const PROGRAM_TABS = {
  weekend: {
    key: "weekend",
    tabLabel: "주말 프로그램",
    label: "체험형 클래스",
    heading: "창의력과 협동심을 키우는\n주말 프로그램",
    bullets: [
      "아이들이 직접 만들고 탐구하며 즐길 수 있는 창의 체험형 클래스",
      "스스로 생각하고 완성하며 집중력과 성취감 UP",
    ],
    tag: "운영일정: 토요일 / 시간별 예약제",
    icons: [
      { img: weekendBlockImg, title: "프리미엄\n블록 아트", caption: "" },
      { img: weekendWoodImg, title: "목공 DIY 체험", caption: "" },
      { img: weekendBoardImg, title: "보드게임\n챌린지", caption: "" },
      { img: weekendWoodImg2, title: "미니공예클래스", caption: "" },
    ],
  },
  vacation: {
    key: "vacation",
    tabLabel: "방학 프로그램",
    label: "통합형 방학 케어",
    heading: "놀이·학습·돌봄이 결합된\n다양한 주제 활동",
    bullets: [
      "다양한 주제 활동으로 아이의 호기심 자극",
      "집중 체험형 프로그램으로 성취감 UP",
      "아지트 멤버들의 일상 돌봄과 학습을 함께 지원",
    ],
    tag: "운영일정: 여름/겨울방학, 오전 10시 ~ 오후 1시 (점심 포함)",
    icons: [
      {
        img: vacationThemeImg,
        title: "테마 캠프",
        caption: "과학, 미술, 요리, 창의 놀이 등",
      },
      {
        img: vacationReadingImg,
        title: "독서 챌린지 /\n숙제 챌린지 프로그램",
        caption: "",
      },
    ],
  },
  season: {
    key: "season",
    tabLabel: "시즌 프로그램",
    label: "성장형 클래스",
    heading: "아이 성장과 학기 전환에 맞춘\n시즌 프로그램",
    bullets: [
      "학교 적응 프로그램으로 새 학기 스타트 지원",
      "공부 습관 형성을 위한 목표 설정",
      "자기주도 학습 익히기",
    ],
    tag: "운영일정: 신학기, 가을·겨울 시즌 등",
    icons: [
      { img: seasonSchoolImg, title: "3월 입학\n적응 프로그램", caption: "" },
      {
        img: seasonStudyImg,
        title: "공부 습관 &\n시간 관리 프로그램",
        caption: "",
      },
    ],
  },
};

/* 멤버십 혜택 카드 데이터 (텍스트 + 아이콘) */
const HERO_SLIDES = [
  { key: "hero-1", img: heroSlide1Img, alt: "멤버십 혜택 요약 1" },
  { key: "hero-2", img: heroSlide2Img, alt: "멤버십 혜택 요약 2" },
  { key: "hero-3", img: heroSlide3Img, alt: "멤버십 혜택 요약 3" },
  { key: "hero-4", img: heroSlide4Img, alt: "멤버십 혜택 요약 3" },
  { key: "hero-5", img: heroSlide5Img, alt: "멤버십 혜택 요약 3" },
];

const BENEFITS = [
  {
    key: 1,
    eyebrow: "멤버십 혜택 1",
    title: "주중 매일 2시간 무료",
    bullets: [
      "아지트 멤버는 평일마다 매일 2시간 자유 이용",
      "숙제존, 독서존, 창의존 등 원하는 공간 자유롭게 이용",
      "놀이와 학습이 자연스럽게 이어지는 시간",
    ],
    example: "예: 학교 하고 후 간단한 간식과 숙제, 창의활동 후 다음학원 이동",
    icon: benefit1Img,
  },
  {
    key: 2,
    eyebrow: "멤버십 혜택 2",
    title: "안심 픽업 서비스",
    bullets: [
      "학교·학원 ↔ 아지트를 선생님과 함께 안전하게 이동",
      "도보·택시로 탑승부터 도착까지 전 과정을 동행",
      "실시간 알림으로 이동 현황을 확인",
    ],
    example: "예: 학교 → 아지트 도착 → 숙제 및 간식 → 영어학원 이동",
    icon: benefit2Img,
    hasPickupTable: true,
  },
  {
    key: 3,
    eyebrow: "멤버십 혜택 3",
    title: "든든한 간식 제공",
    bullets: [
      "건강하고 든든한 간식이 매일 준비",
      "아이들의 취향과 영양을 고려해 주기적으로 메뉴 교체",
      "정액권 충전으로 간편하게 결제",
    ],
    example: "예: 학교 하고 후 간단한 간식과 숙제, 창의활동 후 다음학원 이동",
    icon: benefit3Img,
  },
  {
    key: 4,
    eyebrow: "멤버십 혜택 4",
    title: "독서 프로그램 & 리딩존 운영",
    bullets: [
      "전문 독서 대여업체와 협력",
      "아이들이 좋아하고 교육에 도움이 되는 책을 주기적으로 교체",
      "자유롭게 책을 읽고 도서 대여 가능",
    ],
    example: "예: 월별 테마 도서 / 읽기 챌린지 / 독서 인증 스탬프 등",
    icon: benefit4Img,
  },
  {
    key: 5,
    eyebrow: "멤버십 혜택 5",
    title: "프로그램 우선 예약",
    bullets: [
      "인기 주말·방학 프로그램을 선예약",
      "테마별 창의공방부터 시즌별 특별 프로그램까지",
      "아이의 하루가 멈추지 않도록, 모든 날을 함께",
    ],
    example:
      "예: 학교 하고 후 간단한 간식과 숙제, 창의활동 후 다음학원 이동",
    icon: benefit5Img,
  },
];

const HOW_PARENT_STEPS = [
  { num: 1, img: parentStep1Img, alt: "회원가입" },
  { num: 2, img: parentStep2Img, alt: "멤버십 구매" },
  { num: 3, img: parentStep3Img, alt: "정액권 충전" },
  { num: 4, img: parentStep4Img, alt: "픽업 신청" },
];

const HOW_CHILD_STEPS = [
  { num: 1, img: childStep1Img, alt: "아지트 생활상담 / 하루" },
  { num: 2, img: childStep2Img, alt: "아지트 도착 + 체크인" },
  { num: 3, img: childStep3Img, alt: "숙제 / 독서 / 창의 놀이" },
  { num: 4, img: childStep4Img, alt: "간식 및 휴식 / 탑승" },
  { num: 5, img: childStep5Img, alt: "다음 학원 픽업 또는 귀가" },
];

/* ================= Page Component ================= */

export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState("weekend");
  const [showPickupModal, setShowPickupModal] = useState(false);

  const current = PROGRAM_TABS[activeTab];

  // 멤버십 혜택 카드 섹션
  function BenefitStepsSection() {
    return (
      <BenefitSection>
        <BenefitInner>
          {BENEFITS.map((b, index) => {
            const isReverse = index % 2 === 1; // 0,2,4는 기본 / 1,3은 좌우 반전

            return (
              <BenefitCard key={b.key} $reverse={isReverse}>
                <BenefitLeft>
                  <BenefitEyebrow>{b.eyebrow}</BenefitEyebrow>
                  <BenefitTitle>{b.title}</BenefitTitle>

                  <BenefitBullets>
                    {b.bullets.map((txt, idx) => (
                      <BenefitBullet key={idx}>{txt}</BenefitBullet>
                    ))}
                  </BenefitBullets>

                  <BenefitExampleTag>{b.example}</BenefitExampleTag>

                  {b.hasPickupTable && (
                    <BenefitPickupLink
                      type="button"
                      onClick={() => setShowPickupModal(true)}
                    >
                      픽업 거리 별 요금표 확인하기 &gt;
                    </BenefitPickupLink>
                  )}
                </BenefitLeft>

                <BenefitRight>
                  <BenefitIconCircle>
                    <BenefitIconImage src={b.icon} alt={b.title} />
                  </BenefitIconCircle>
                </BenefitRight>
              </BenefitCard>
            );
          })}
        </BenefitInner>
      </BenefitSection>
    );
  }

  // 프로그램 소개 섹션 (주말/방학/시즌 탭)
  function MembershipProgramSection() {
    function handleTabClick(nextKey) {
      setActiveTab(nextKey);
    }

    return (
      <ProgramSection>
        <ProgramInner>
          <ProgramHeader>
            <ProgramEyebrow>프로그램</ProgramEyebrow>
            <ProgramTitle>
              주말마다, 방학마다
              <br />
              <ProgramHighlight>새로운 즐거움</ProgramHighlight>
            </ProgramTitle>

            <ProgramTabsRow>
              {Object.values(PROGRAM_TABS).map((tab) => (
                <ProgramTab
                  key={tab.key}
                  $active={activeTab === tab.key}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.tabLabel}
                </ProgramTab>
              ))}
            </ProgramTabsRow>
          </ProgramHeader>

          <ProgramBody>
            <ProgramLeft>
              <ProgramLabel>{current.label}</ProgramLabel>
              <ProgramHeading>
                {current.heading.split("\n").map((line, idx, arr) => (
                  <span key={idx}>
                    {line}
                    {idx !== arr.length - 1 && <br />}
                  </span>
                ))}
              </ProgramHeading>

              <ProgramBulletList>
                {current.bullets.map((b, idx) => (
                  <ProgramBulletItem key={idx}>{b}</ProgramBulletItem>
                ))}
              </ProgramBulletList>

              <ProgramTag>{current.tag}</ProgramTag>
            </ProgramLeft>

            <ProgramRight>
              {current.icons.length === 4 ? (
                // ✅ 아이콘이 4개인 탭(weekend)만 자동 슬라이드 배너
                <ProgramIconsRow>
                  {current.icons.map((icon, idx) => (
                    <ProgramIconCard key={idx}>
                      {icon.img && (
                        <ProgramIconImage
                          src={icon.img}
                          alt={icon.title.replace("\n", " ")}
                        />
                      )}
                      <ProgramIconTitle>
                        {icon.title.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < icon.title.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </ProgramIconTitle>
                      {icon.caption && <ProgramIconCaption>{icon.caption}</ProgramIconCaption>}
                    </ProgramIconCard>
                  ))}
                </ProgramIconsRow>
              ) : (
                // ✅ 나머지 탭(아이콘 2개짜리)은 정적으로 배치
                <ProgramIconsStaticRow>
                  {current.icons.map((icon, idx) => (
                    <ProgramIconCard key={idx}>
                      {icon.img && (
                        <ProgramIconImage
                          src={icon.img}
                          alt={icon.title.replace("\n", " ")}
                        />
                      )}
                      <ProgramIconTitle>
                        {icon.title.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < icon.title.length - 1 && <br />}
                          </span>
                        ))}
                      </ProgramIconTitle>
                      {icon.caption && <ProgramIconCaption>{icon.caption}</ProgramIconCaption>}
                    </ProgramIconCard>
                  ))}
                </ProgramIconsStaticRow>
              )}
            </ProgramRight>

          </ProgramBody>
        </ProgramInner>
      </ProgramSection>
    );
  }

  function MembershipHeroSection() {
    return (
      <HeroSection>
        <HeroInner>
          <HeroEyebrow>멤버십 혜택</HeroEyebrow>
          <HeroTitle>
            아지트 멤버라면 누리는
            <br />
            <HeroTitleHighlight>특별한 일상</HeroTitleHighlight>
          </HeroTitle>
          <HeroSub>
            아이들의 일상 돌봄부터 배움, 놀이까지 한 공간에서
          </HeroSub>

          {/* 🔸 히어로 이미지 슬라이드 (손으로 슬라이드 가능) */}
          <HeroSliderWrap>
            <HeroSliderScroller>
              {HERO_SLIDES.map((slide) => (
                <HeroSlide key={slide.key}>
                  <HeroSlideImage src={slide.img} alt={slide.alt} />
                </HeroSlide>
              ))}
            </HeroSliderScroller>
          </HeroSliderWrap>
        </HeroInner>
      </HeroSection>
    );
  }



  // 아지트 공간 대관 / 함께 나누는 시간 섹션
  function MembershipFamilyTimeSection() {
    return (
      <FamilySection>
        <FamilyInner>
          <FamilyHeader>
            <FamilyEyebrow>공간 대관 서비스</FamilyEyebrow>
            <FamilyTitle>
              아지트의 공간대관,
              <br />
              <FamilyHighlight>자유롭게 나눠보세요</FamilyHighlight>
            </FamilyTitle>
         
          </FamilyHeader>

          <FamilyCards>
            {/* 평일 오전 카드 */}
            <FamilyCard>
              <FamilyCardLeft>
                <FamilyBadge $variant="blue">평일 오전</FamilyBadge>
                <FamilyCardTitle>{"학부모 모임,\n클래스 대관"}</FamilyCardTitle>
              </FamilyCardLeft>
              <FamilyCardRight>
                <FamilyCardIconCircle>
                  <FamilyCardIcon
                    src={spaceShareWeekdayImg}
                    alt="평일 오전 공간 대관"
                  />
                </FamilyCardIconCircle>
              </FamilyCardRight>
            </FamilyCard>

            {/* 일요일 카드 */}
            <FamilyCard>
              <FamilyCardLeft>
                <FamilyBadge $variant="orange">일요일에는</FamilyBadge>
                <FamilyCardTitle>
                  {"생일파티, 가족행사,\n원데이 클래스"}
                </FamilyCardTitle>
              </FamilyCardLeft>
              <FamilyCardRight>
                <FamilyCardIconCircle>
                  <FamilyCardIcon
                    src={spaceShareSundayImg}
                    alt="일요일 공간 대관"
                  />
                </FamilyCardIconCircle>
              </FamilyCardRight>
            </FamilyCard>
          </FamilyCards>
        </FamilyInner>
      </FamilySection>
    );
  }

  function MembershipHowToUseSection() {
    return (
      <HowSection>
        <HowInner>
          <HowEyebrow>멤버십 이용 방법</HowEyebrow>
          <HowTitle>
            위드아지트는 <br />
            <HowHighlight>이렇게 이용해요</HowHighlight>
          </HowTitle>
        </HowInner>

        <HowGroupsWrap>
          {/* 회원(부모님) 단계 */}
          <HowGroup>
            <HowGroupTitle>회원(부모님)</HowGroupTitle>
            <HowStepGrid>
              {HOW_PARENT_STEPS.map((step) => (
                <HowStepCard key={step.num}>
                  <HowStepImage src={step.img} alt={step.alt} />
                </HowStepCard>
              ))}
            </HowStepGrid>
          </HowGroup>

          {/* 아이 단계 */}
          <HowGroup>
            <HowGroupTitle>아이</HowGroupTitle>
            <HowStepGrid>
              {HOW_CHILD_STEPS.map((step) => (
                <HowStepCard key={step.num}>
                  <HowStepImage src={step.img} alt={step.alt} />
                </HowStepCard>
              ))}
            </HowStepGrid>
          </HowGroup>
        </HowGroupsWrap>
      </HowSection>
    );
  }


  return (
    <Page>
      {/* 맨 위 멤버십 플랜 섹션 */}
      <MembershipPlans />

      
      {/* 멤버십 혜택 히어로 */}
      <MembershipHeroSection />

      {/* 멤버십 혜택 1~5 카드 */}
      <BenefitStepsSection />

      {/* 프로그램 섹션 */}
      <MembershipProgramSection />

      {/* 아지트를 함께 나누는 시간 (통 이미지) */}
      <MembershipFamilyTimeSection />

      {/* 위드아지트는 이렇게 이용해요 */}
      <MembershipHowToUseSection />

      {/* 픽업 거리별 요금표 모달 */}
      {showPickupModal && (
        <PickupModalOverlay onClick={() => setShowPickupModal(false)}>
          <PickupModalCard onClick={(e) => e.stopPropagation()}>
            <PickupModalClose
              type="button"
              onClick={() => setShowPickupModal(false)}
            >
              ×
            </PickupModalClose>

            <PickupModalTitle>
              안심 픽업 서비스
              <br />
              거리별 요금표
            </PickupModalTitle>

            <PickupTable>
              <thead>
                <tr>
                  <PickupHeadCell>도보거리 기준</PickupHeadCell>
                  <PickupHeadCell>이동 방식</PickupHeadCell>
                  <PickupHeadCell>요금</PickupHeadCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <PickupCell>
                    위드아지트 앞 정류장
                    <br />
                    (e편한세상 양측 상가)
                  </PickupCell>
                  <PickupCell>셔틀 픽업/드롭</PickupCell>
                  <PickupPriceCell>2,000원</PickupPriceCell>
                </tr>
                <tr>
                  <PickupCell>왕복 약 300m 이내</PickupCell>
                  <PickupCell>도보 동행</PickupCell>
                  <PickupPriceCell>3,000원</PickupPriceCell>
                </tr>
                <tr>
                  <PickupCell>왕복 약 600m 이내</PickupCell>
                  <PickupCell>도보 동행</PickupCell>
                  <PickupPriceCell>5,500원</PickupPriceCell>
                </tr>
                <tr>
                  <PickupCell>왕복 약 1,000m 이내</PickupCell>
                  <PickupCell>도보 동행</PickupCell>
                  <PickupPriceCell>6,500원</PickupPriceCell>
                </tr>
                <tr>
                  <PickupCell>왕복 약 1,000m ~</PickupCell>
                  <PickupCell>도보(택시) 동행</PickupCell>
                  <PickupPriceCell>8,000원부터~</PickupPriceCell>
                </tr>
              </tbody>
            </PickupTable>
          </PickupModalCard>
        </PickupModalOverlay>
      )}
    </Page>
  );
}
