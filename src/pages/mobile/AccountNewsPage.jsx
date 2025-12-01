/* eslint-disable */
// src/pages/mobile/AccountNewsPage.jsx
// Withagit — 모바일 아지트 소식 (/m/account/news)

import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import NoticeSection from "../../components/help/NoticeSection";

/* ===== Tokens ===== */
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const bg = "#FFFFFF";

/* ===== Layout (모바일 공통 스타일) ===== */

const Page = styled.main`
  min-height: 100dvh;
  background: ${bg};
  padding: 16px 0 24px;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;
`;

const Container = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 80px;
`;

/* 상단 헤더 (뒤로가기 + 제목) */

const HeaderBar = styled.header`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  font-size: 18px;
  cursor: pointer;
  color: #4b5563;

  &:active {
    background: #e5e7eb;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${text};
`;

/* 상단 설명 */

const IntroText = styled.p`
  margin: 4px 0 14px;
  font-size: 12px;
  color: ${sub};
`;

/* ===== 페이지 컴포넌트 ===== */

export default function AccountNewsPage() {
    const nav = useNavigate();
    const onBack = () => nav(-1);

    return (
        <Page>
            <Container>
                <HeaderBar>
                    <BackButton onClick={onBack}>‹</BackButton>
                    <HeaderTitle>아지트 소식</HeaderTitle>
                </HeaderBar>

                <IntroText>
                    위드아지트의 최신 공지와 안내 사항을 한 곳에서 확인할 수 있어요.
                </IntroText>


                <NoticeSection />
            </Container>
        </Page>
    );
}
