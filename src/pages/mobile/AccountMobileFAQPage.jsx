/* eslint-disable */
// src/pages/mobile/AccountMobileFAQPage.jsx
// Withagit — 모바일 이용 안내 / FAQ (/faq)

import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FaqSection from "../../components/help/FaqSection"; // 🔸 서버 연동/레이아웃 담당 컴포넌트 그대로 사용

/* ===== Tokens ===== */
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const bg = "var(--color-surface, #FAF4EF)";
const surface = "#ffffff";

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
  color: #111827;
`;

/* 상단 설명 */

const IntroText = styled.p`
  margin: 4px 0 14px;
  font-size: 12px;
  color: ${sub};
`;

/* 검색바 (FaqSection 과 query 공유) */

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${surface};
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
  margin-bottom: 14px;
`;

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
        <path
            d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l4.25 4.25 1.5-1.5L15.5 14zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z"
            fill="#9aa2b1"
        />
    </svg>
);

const SearchInput = styled.input`
  flex: 1 1 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: ${text};
  &::placeholder {
    color: #b6bdc9;
  }
`;

/* ===== 메인 컴포넌트 ===== */

export default function AccountMobileFAQPage() {
    const nav = useNavigate();
    const [faqQuery, setFaqQuery] = useState("");

    const onBack = () => nav(-1);

    return (
        <Page>
            <Container>
                <HeaderBar>
                    <BackButton onClick={onBack}>‹</BackButton>
                    <HeaderTitle>이용 안내 / FAQ</HeaderTitle>
                </HeaderBar>

                <IntroText>
                    위드아지트 이용과 멤버십, 픽업 신청에 대해 궁금하신 점을 모아 두었어요.
                </IntroText>

                {/* 상단 검색바 — HelpLanding 과 동일하게 FaqSection 과 query 공유 */}
                <SearchBar>
                    <SearchIcon />
                    <SearchInput
                        placeholder="무엇이든 찾아보세요"
                        value={faqQuery}
                        onChange={(e) => setFaqQuery(e.target.value)}
                    />
                </SearchBar>

                {/* 실제 FAQ 내용은 FaqSection 이 서버에서 바로 가져옴 */}
                <FaqSection
                    query={faqQuery}
                    onQueryChange={setFaqQuery}
                    showSearch={false}    // 내부 검색바는 숨기고, 위의 SearchBar만 사용
                />
            </Container>
        </Page>
    );
}
