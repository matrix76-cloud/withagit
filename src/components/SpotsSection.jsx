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
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  line-height: 1.35;
  font-weight: 900;
  color: #1b130c;
  letter-spacing: -0.03em;
`;

const HighlightRow = styled.div`
  display: inline-block;
  position: relative;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 4px;
    height: 40%;
    background: #ffe8a3;
    border-radius: 999px;
    z-index: -1;
  }
`;

const ViewAllButton = styled.button`
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #444444;
  cursor: pointer;
  outline: none;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: #faf7ef;
    border-color: rgba(0, 0, 0, 0.16);
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
  border-radius: 36px;
  overflow: hidden;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-height: 260px;

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
  background: rgba(255, 255, 255, 0.22);
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
  border-radius: 36px 36px 0 0;
`;

const StatusTopLeft = styled.div`
  position: absolute;
  left: 24px;
  top: 22px;
`;

const SpotInfo = styled.div`
  padding: 14px 18px 18px 18px;
  background: #ffe9a7;
  border-radius: 0 0 36px 36px;
`;

const SpotName = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #342313;
  margin-bottom: 6px;
`;

const SpotLocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b4b2b;
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
  background: radial-gradient(circle at 0% 0%, #544032 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.32);
`;

const ComingUpper = styled.div`
  flex: 1;
  padding: 22px 24px 0 24px;
  display: flex;
  flex-direction: column;
`;

const ComingFooter = styled.div`
  margin-top: 24px;
  background: #ffe5aa;
  padding: 14px 24px 18px;
  border-radius: 0 0 36px 36px;
  color: #4b3a2a;
  font-size: 13px;
`;

const ComingTitleText = styled.div`
  margin-top: 40px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.3;
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
  background: radial-gradient(circle at 0% 0%, #5b4332 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.32);
`;

const SuggestInner = styled.div`
  flex: 1;
  padding: 22px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SuggestTopLabel = styled.div`
  font-size: 12px;
  color: #f7e6c6;
  margin-bottom: 14px;
`;

const SuggestMain = styled.div`
  font-size: 20px;
  line-height: 1.6;
  font-weight: 800;

  span {
    color: #ffb35a;
  }
`;

const SuggestButtonWrap = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;   /* ⬅️ 버튼을 카드 가운데로 */
`;
const SuggestButton = styled.button`
  min-width: 260px;          /* ⬅️ 가로폭 어느 정도 고정 */
  padding: 13px 26px;
  border-radius: 999px;
  border: none;
  background: #ff7e32;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  outline: none;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
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
                            <HighlightRow>다양한 스팟을 만나보세요.</HighlightRow>
                        </Title>
                    </TitleBlock>

                    <ViewAllButton type="button" onClick={handleViewAll}>
                        모든 지점 보기
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M9.29 6.71a1 1 0 0 0 0 1.41L12.17 11H5a1 1 0 0 0 0 2h7.17l-2.88 2.88a1 1 0 1 0 1.42 1.42l4.59-4.6a1 1 0 0 0 0-1.4l-4.59-4.6a1 1 0 0 0-1.42 0Z"
                            />
                        </svg>
                    </ViewAllButton>
                </HeaderRow>

                <CardsRow>
                    {/* 1. 실제 운영중 지점 */}
                    <SpotCard>
                        <SpotImageWrap>
                            <StatusTopLeft>
                                <StatusPill>운영중</StatusPill>
                            </StatusTopLeft>
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
                            <StatusPillDark>Open 예정</StatusPillDark>
                            <ComingTitleText>
                                Coming
                                <br />
                                Soon!
                            </ComingTitleText>
                        </ComingUpper>

                        <ComingFooter>
                            <ComingBottomName>두 번째 아지트</ComingBottomName>
                            <ComingBottomLoc>
                                <LocationIcon />
                                <span>위치 공개 전</span>
                            </ComingBottomLoc>
                        </ComingFooter>
                    </ComingCard>

                    {/* 3. 제안 카드 */}
                    <SuggestCard>
                        <SuggestInner>
                            <div>
                                <SuggestTopLabel>
                                    우리 동네에 아지트가 필요하세요?
                                </SuggestTopLabel>
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
