/* eslint-disable */
// src/components/SpotsSection.jsx
// Withagit Landing — 공간 소개 섹션 (피그마 클론 버전)

import React from "react";
import styled from "styled-components";

// TODO: 실제 이미지 경로에 맞게 수정해주세요.
import spot1Image from "../assets/Layer4/Frame287.png";

/* ===== 섹션 레이아웃 ===== */

const Section = styled.section`
  width: 100%;
  background: #fffdf8;
  padding: 88px 16px 96px;
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 64px 16px 80px;
  }
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
`;

/* ===== 헤더 ===== */

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 720px) {
    text-align: center;
  }
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f07a2a;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(26px, 3.4vw, 34px);
  line-height: 1.3;
  font-weight: 900;
  color: #1b130c;
  letter-spacing: -0.03em;

  @media (max-width: 720px) {
    font-size: clamp(24px, 3.4vw, 34px);
  }
`;

/* 🔶 형광펜: "다양한 스팟을"까지만 */
const HighlightRow = styled.span`
  display: inline-block;
  position: relative;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 3px; /* 글자에 더 밀착 */
    height: 45%; /* 너무 두껍지 않게 */
    background: #ffe8a3;
    border-radius: 999px;
    z-index: -1;
  }
`;

/* 우측 "전체 보기" 영역 (텍스트 + 동그란 아이콘 버튼) */
const ViewAllArea = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-end;

  @media (max-width: 720px) {
    align-self: flex-end;
  }
`;

const ViewAllText = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  font-family:Pretendard;
`;

const ViewAllCircle = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: #faf7ef;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

/* ===== 카드 그리드 ===== */

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

/* 공통 카드 베이스 */

const CardBase = styled.div`
  position: relative;
  border-radius: 40px;
  overflow: hidden;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-height: 280px;

  @media (max-width: 960px) {
    min-height: 0;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ff7e32;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const StatusPillDark = styled(StatusPill)`
  padding: 4px 10px;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.22);
  width : 80px;
`;

/* ===== 1번째 카드 — 실제 운영중 지점 ===== */

const SpotCard = styled(CardBase)`
  background: #fffaf0;
`;

const SpotImageWrap = styled.div`
  position: relative;
  width: 100%;
  padding: 0;
`;

const SpotImg = styled.img`
  width: 100%;
  height: 220px;
  display: block;
  object-fit: cover;
  border-radius: 40px 40px 0 0;
`;

const StatusTopLeft = styled.div`
  position: absolute;
  left: 24px;
  top: 22px;
`;

const SpotInfo = styled.div`
  padding: 16px 20px 20px 20px;
  background: #ffe9a7;
  border-radius: 0 0 40px 40px;
`;

const SpotName = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #111;
  margin-bottom: 6px;
`;

const SpotLocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b4b2b;
  font-family:Pretendard;
    font-weight: 500;
`;

const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 4.3 4.6 9.1 6.4 10.9a1 1 0 0 0 1.2 0C14.4 18.1 19 13.3 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9A2.5 2.5 0 0 1 12 11.5Z"
    />
  </svg>
);

/* ===== 2번째 카드 — Coming Soon! + 하단 크림 인포 영역 ===== */

const ComingCard = styled(CardBase)`
  background: radial-gradient(circle at 0 0, #6b4b38 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.38);
  min-height: 320px;
`;

const ComingUpper = styled.div`
  flex: 1;
  padding: 18px 24px 0 24px;
  display: flex;
  flex-direction: column;
`;

const ComingFooter = styled.div`
  margin-top: 28px;
  background: #ffe3a0;
  padding: 16px 24px 20px;
  border-radius: 0 0 40px 40px;
  color: #4b3a2a;
  font-size: 13px;
`;

const ComingTitleText = styled.div`
  margin-top: 36px;
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #ffc977 0%, #ffffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  align-self: center; /* 카드 브라운 영역 가운데로 */

  @media (max-width: 960px) {
    font-size: 56px;
  }
`;

const ComingBottomName = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`;

const ComingBottomLoc = styled(SpotLocationRow)`
  color: #4b3a2a;
`;

/* ===== 3번째 카드 — 다음 아지트 제안 ===== */

const SuggestCard = styled(CardBase)`
  background: radial-gradient(circle at 0 0, #5b4332 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.36);
`;

const SuggestInner = styled.div`
  flex: 1;
  padding: 76px 24px 26px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align:center;
`;

const SuggestTopLabel = styled.div`
  font-size: 12px;
  color: #f7e6c6;
  margin-bottom: 16px;
`;

const SuggestMain = styled.div`
  font-size: 25px;
  font-weight: 800;

  span {
    color: #ffb35a;
  }
`;

const SuggestButtonWrap = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: center;
`;

const SuggestButton = styled.button`
  min-width: 260px;
  padding: 14px 28px;
  border-radius: 999px;
  border: none;
  background: #ff7e32;
  color: #ffffff;
  font-size: 16px;
  font-family:Pretendard;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.32);
  outline: none;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
  }
`;

/* ===== Component ===== */

export default function SpotsSection({ onClickViewAll, onClickSuggest }) {
  const handleViewAll = () => {
    if (onClickViewAll) onClickViewAll();
  };

  const handleSuggest = () => {
    if (onClickSuggest) onClickSuggest();
  };

  return (
    <Section>
      <Inner>
        <HeaderRow>
          <TitleBlock>
            <Eyebrow>위드아지트 공간 소개</Eyebrow>
            <Title>
              우리 공간의
              <br />
              <HighlightRow>다양한 스팟을</HighlightRow> 만나보세요.
            </Title>
          </TitleBlock>

          <ViewAllArea>
            <ViewAllText type="button" onClick={handleViewAll}>
              전체 보기
            </ViewAllText>
            <ViewAllCircle type="button" onClick={handleViewAll}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6l6 6-6 6"
              />
              </svg>
            </ViewAllCircle>
          </ViewAllArea>
        </HeaderRow>

        <CardsRow>
          {/* 1. 실제 운영중 지점 */}
          <SpotCard>
            <SpotImageWrap>
              {/* 피그마 모바일에서는 '운영중' 뱃지 없는 버전 */}
              {/* <StatusTopLeft>
                <StatusPill>운영중</StatusPill>
              </StatusTopLeft> */}
              <SpotImg src={spot1Image} alt="첫 번째 아지트(수지초)" />
            </SpotImageWrap>
            <SpotInfo>
              <SpotName>첫 번째 아지트 (수지초)</SpotName>
              <SpotLocationRow>
                <LocationIcon />
                <span>경기 용인시 수지구</span>
              </SpotLocationRow>
            </SpotInfo>
          </SpotCard>

          {/* 2. Coming Soon 카드 */}
          <ComingCard>
            <ComingUpper>
              {/* Open 예정 pill: 작고 왼쪽에 딱 붙게 */}
              <StatusPillDark>Open 예정</StatusPillDark>
              <ComingTitleText>
                Coming
                <br />
                Soon!
              </ComingTitleText>
            </ComingUpper>

            <ComingFooter>
              <SpotName>두 번째 아지트</SpotName>
              <SpotLocationRow>
                <LocationIcon />
                <span>위치 공개 전</span>
              </SpotLocationRow>
            </ComingFooter>
          </ComingCard>

          {/* 3. 제안 카드 */}
          <SuggestCard>
            <SuggestInner>
              <div>
                <SuggestTopLabel>우리 동네에 아지트가 필요하세요?</SuggestTopLabel>
                <SuggestMain>
                  <span>다음 아지트를</span>
                  <br />
                  제안해주세요!
                </SuggestMain>
              </div>
              <SuggestButtonWrap>
                <SuggestButton type="button" onClick={handleSuggest}>
                  제안 남기기
                </SuggestButton>
              </SuggestButtonWrap>
            </SuggestInner>
          </SuggestCard>
        </CardsRow>
      </Inner>
    </Section>
  );
}
