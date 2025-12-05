/* eslint-disable */
// src/components/HeroDownloadSection.jsx
// 앱 설치 히어로 섹션 — 왼쪽 통이미지, 오른쪽 카피 + 스토어 버튼

import React from "react";
import styled from "styled-components";

import heroPhoneImage from "../assets/Layer3/Frame70.png";

// 🔸 형이 준비할 아이콘 이미지 (파일명/경로는 형이 실제에 맞게 수정하면 됨)
import googlePlayIcon from "../assets/Layer3/icon-googleplay.png";
import appStoreIcon from "../assets/Layer3/icon-appstore.png";

const Section = styled.section`
  width: 100%;
  background: #f8e3a3; /* 연한 노란 배경 (피그마 톤) */
  padding: 72px 16px 88px;
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 48px 16px 64px;
  }
`;

const Inner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 64px;

  @media (max-width: 960px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const LeftImage = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  justify-content: center;

  img {
    display: block;
    width: 100%;
    max-width: 520px;
    height: auto;
    border-radius: 40px;
  }

  @media (max-width: 960px) {
    img {
      max-width: 380px;
    }
  }
`;

const RightText = styled.div`
  flex: 1 1 0;
  min-width: 0;
  color: #111111;

  @media (max-width: 960px) {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: #f07a2a;

  @media (max-width: 960px) {
    font-size: 14px;
  }
`;

const Heading = styled.h2`
  margin: 0 0 16px;
  font-size: clamp(28px, 3.8vw, 40px);
  line-height: 1.35;
  color: #1b130c;
  letter-spacing: -0.025em;
  font-weight: 800;
  font-family: NanumSquareRound;



  @media (max-width: 960px) {
    font-size: 22px;
    line-height: 1.4;
  }
`;

const Body = styled.p`
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.7;
  color: #4a3b2a;

  @media (max-width: 960px) {
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Highlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 6px;
    height: 55%;
    background: #fbd889;
    border-radius: 999px;
    z-index: -1;
  }
`;

/* 🔹 아이콘 이미지 자리 */
const StoreIcon = styled.img`
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
`;

const StoreButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 26px;
  border-radius: 999px;
  background: #f07a2a; /* 피그마 primary 주황 */
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 0.04em;
  
  cursor: pointer;
  white-space: nowrap;
  min-width: 150px;
  font-family: Pretendard, sans-serif;
  font-weight: 400;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  }
`;

const StoreButtonGhost = styled(StoreButton)`
  /* 두 번째 버튼도 같은 주황 단색으로 */
  background: #f07a2a;
  color: #ffffff;
  border: none;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }
`;

export default function HeroDownloadSection() {
  return (
    <Section>
      <Inner>
        {/* 왼쪽: 통 이미지 */}
        <LeftImage>
          <img src={heroPhoneImage} alt="위드아지트 앱 미리보기" />
        </LeftImage>

        {/* 오른쪽: 카피 + 버튼 */}
        <RightText>
          <Eyebrow>우리 아이의 하루를 지켜보세요.</Eyebrow>
          <Heading>
            <Highlight>믿을 수 있는 돌봄,</Highlight>
            <br />
            손 안에서 시작됩니다.
          </Heading>
          <Body>
            앱스토어 또는 구글플레이스토어에서
            <br />
            간편하게 설치하세요.
          </Body>

          <ButtonsRow>
            <StoreButton href="#" target="_blank" rel="noreferrer">
              <StoreIcon src={googlePlayIcon} alt="구글 플레이" />
              구글 플레이
            </StoreButton>

            <StoreButtonGhost href="#" target="_blank" rel="noreferrer">
              <StoreIcon src={appStoreIcon} alt="앱 스토어" />
              앱 스토어
            </StoreButtonGhost>
          </ButtonsRow>
        </RightText>
      </Inner>
    </Section>
  );
}
