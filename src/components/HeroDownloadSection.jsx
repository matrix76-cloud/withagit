/* eslint-disable */
// src/components/HeroDownloadSection.jsx
// 앱 설치 히어로 섹션 — 왼쪽 통이미지, 오른쪽 카피 + 스토어 버튼

import React from "react";
import styled from "styled-components";


import heroPhoneImage from "../assets/Layer3/Frame70.png";

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
      max-width: 420px;
    }
  }
`;

const RightText = styled.div`
  flex: 1 1 0;
  min-width: 0;
  color: #111111;

  @media (max-width: 960px) {
    width: 100%;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #f07a2a;
`;

const Heading = styled.h2`
  margin: 0 0 16px;
  font-size: clamp(28px, 3.8vw, 40px);
  line-height: 1.35;
  font-weight: 900;
  color: #1b130c;
  letter-spacing: -0.03em;
`;

const Body = styled.p`
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.7;
  color: #4a3b2a;
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
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
    bottom: 6px;        /* 글자와의 거리 */
    height: 55%;        /* 아래 절반 정도 채우기 */
    background: #fbd889;/* 다른 섹션이랑 맞춘 노랑 하이라이트 */
    border-radius: 999px;
    z-index: -1;
  }
`;


const StoreButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: 999px;
  background: #f07a2a;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 0.04em;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  cursor: pointer;

  svg {
    display: block;
  }

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
  background: transparent;
  color: #f07a2a;
  border: 1.5px solid rgba(240, 122, 42, 0.8);
  box-shadow: none;

  &:hover {
    background: rgba(240, 122, 42, 0.06);
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
                        <StoreButton
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    fill="currentColor"
                                    d="M3 4.27v15.46c0 .36.09.68.24.97L13.39 12 3.24 3.3A2 2 0 0 0 3 4.27Zm1.86 16.84L15.05 12 5 20.11c.54.37 1.24.44 1.86.99Zm13.2-3.59L16.02 13l-2.23 2.02 4.21 4.21c.75-.1 1.39-.54 1.79-1.18l-1.73-1.53ZM15.02 11l3.99-3.73l1.73-1.53a2.2 2.2 0 0 0-1.79-1.18L13.79 8.58z"
                                />
                            </svg>
                            구글 플레이
                        </StoreButton>

                        <StoreButtonGhost
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    fill="currentColor"
                                    d="M16.7 2c-1.1.08-2.4.75-3.15 1.61c-.69.8-1.26 2.09-1.1 3.3h.08c1.2 0 2.43-.66 3.18-1.52c.7-.79 1.23-2.08 1.09-3.39Zm3.12 7.29c-1.74-.07-3.23 1-4.07 1c-.85 0-2.14-.96-3.52-.93c-1.8.03-3.45 1.05-4.37 2.67c-1.87 3.24-.48 8.03 1.32 10.66c.88 1.28 1.92 2.71 3.3 2.66c1.32-.05 1.82-.86 3.42-.86c1.61 0 2.05.86 3.45.83c1.42-.02 2.32-1.29 3.2-2.58c1.01-1.48 1.43-2.92 1.45-3c-.03-.01-2.8-1.07-2.83-4.21c-.02-2.63 2.15-3.89 2.25-3.95c-1.23-1.8-3.16-2.01-3.76-2.04Z"
                                />
                            </svg>
                            앱 스토어
                        </StoreButtonGhost>
                    </ButtonsRow>
                </RightText>
            </Inner>
        </Section>
    );
}
