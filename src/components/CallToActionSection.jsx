/* eslint-disable */
// src/components/CallToActionSection.jsx
// 맨 하단 CTA 섹션 — 주황 배경, 타이틀 + 서브텍스트 + 2버튼

import React from "react";
import styled from "styled-components";

const Section = styled.section`
  width: 100%;
  background: #e67632; /* 피그마 느낌의 오렌지 */
  padding: 80px 16px 90px;
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 64px 16px 72px;
  }
`;

const Inner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  color: #ffffff;
`;

/* "지금 바로 시작해보세요!" — NanumSquareRound ExtraBold 24px */
const Heading = styled.h2`
  margin: 0 0 18px;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-size: 24px;
  line-height: 1.4;
  font-weight: 800; /* ExtraBold */
  letter-spacing: -0.03em;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

/* 본문 — Pretendard Regular 14px */
const Body = styled.p`
  margin: 0 0 30px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.8;
  font-weight: 400;
  opacity: 0.95;
`;

/* 항상 한 줄 배치 (모바일에서도 row 유지) */
const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
`;

/* 버튼 공통 — Pretendard SemiBold 16px */
const BaseButton = styled.button`
  flex: 1 1 0;
  min-width: 0;
  padding: 13px 16px;
  border-radius: 999px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-size: 16px;
  font-weight: 600; /* SemiBold */
  letter-spacing: 0.02em;
  cursor: pointer;
  outline: none;
  transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease,
    color 0.15s ease, border-color 0.15s ease;
`;

const PrimaryBtn = styled(BaseButton)`
  background: #ffffff;
  color: #e67632;
  border: 1px solid #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  }
`;

const GhostBtn = styled(BaseButton)`
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  box-shadow: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:active {
    background: rgba(255, 255, 255, 0.12);
  }
`;

export default function CallToActionSection({
  onClickSignup,
  onClickContact,
}) {
  const handleSignup = () => {
    if (onClickSignup) onClickSignup();
  };

  const handleContact = () => {
    if (onClickContact) onClickContact();
  };

  return (
    <Section>
      <Inner>
        <Heading>지금 바로 시작해보세요!</Heading>
        <Body>
          간편한 회원가입으로
          <br />
          안전하고 믿을 수 있는 아이 돌봄서비스를 경험해보세요.
        </Body>
        <ButtonsRow>
          <PrimaryBtn type="button" onClick={handleSignup}>
            무료 회원가입
          </PrimaryBtn>
          <GhostBtn type="button" onClick={handleContact}>
            문의하기
          </GhostBtn>
        </ButtonsRow>
      </Inner>
    </Section>
  );
}
