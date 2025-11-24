/* eslint-disable */
// /src/pages/HelpLanding.jsx
import React, { useState } from "react";
import styled from "styled-components";
import NoticeSection from "../components/help/NoticeSection";
import FaqSection from "../components/help/FaqSection";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

/* ===== Tokens ===== */
const bg = "#FFFFFF";
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const HEADER_VAR = "var(--header-height, 64px)";
const accent = "var(--color-accent, #F07A2A)";

/* ===== Layout ===== */
const Page = styled.main`
  min-height: 100dvh;
  background: ${bg};
  padding: calc(${HEADER_VAR}px) 0 160px;
  box-sizing: border-box;
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
`;

/* ===== Hero (소식/문의 + 검색) ===== */
const Hero = styled.section`
  text-align: center;
  margin-bottom: 40px;
`;

const HeroTitleWrap = styled.div`
  display: inline-block;
  position: relative;
  margin-bottom: 10px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(30px, 3.6vw, 40px);
  font-weight: 900;
  color: ${text};
  letter-spacing: -0.04em;
  position: relative;
  z-index: 1;
`;

const HeroHighlight = styled.span`
  position: absolute;
  inset: auto 0 -4px 0;
  height: 22px;
  border-radius: 999px;
  background: #ffe9a6;
  z-index: 0;
`;

const HeroSub = styled.p`
  margin: 8px 0 0;
  font-size: 15px;
  color: ${sub};
`;

/* 상단 검색바 (FAQ와 공유) */
const HeroSearchBar = styled.div`
  margin: 26px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  border-radius: 999px;
  background: #f5f5f5;
  padding: 0 22px;
`;

const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.94.94l.27.28h.79l4.5 4.5 1.41-1.41-4.5-4.5zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z"
            fill="#9aa2b1"
        />
    </svg>
);

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 17px;
  color: ${text};
  &::placeholder {
    color: #b6bdc9;
  }
`;

/* 공지 + FAQ 섹션 전체 래퍼 */
const MainSections = styled.div`
  display: grid;
  gap: 60px;
`;

/* 공지/FAQ 섹션 헤더 */
const SectionHead = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
`;

const H2 = styled.h2`
  margin: 0;
  color: ${navy};
  font-size: clamp(22px, 2.2vw, 28px);
  letter-spacing: -0.2px;
  font-weight: 800;
`;

const Lead = styled.p`
  margin: 4px 0 0;
  color: ${sub};
  font-size: 15px;
`;

const Hr = styled.hr`
  border: 0;
  height: 1px;
  background: rgba(17, 24, 39, 0.12);
  opacity: 0.2;
  margin: 0 0 12px;
`;

/* ===== 페이지 컴포넌트 ===== */
export default function HelpLanding() {
    const nav = useNavigate();
    const { phoneE164 } = useUser() || {};

    // FAQ 검색어 상태 — 상단 검색바와 FaqSection이 공유
    const [faqQuery, setFaqQuery] = useState("");

    return (
        <Page>
            <Container>
                {/* 상단 Hero: 소식/문의 + 검색 */}
                <Hero>
                    <HeroTitleWrap>
                        <HeroTitle>소식/문의</HeroTitle>
                        <HeroHighlight />
                    </HeroTitleWrap>
                    <HeroSub>자주 묻는 질문</HeroSub>

                    <HeroSearchBar>
                        <SearchIcon />
                        <SearchInput
                            placeholder="무엇이든 찾아보세요"
                            value={faqQuery}
                            onChange={(e) => setFaqQuery(e.target.value)}
                        />
                    </HeroSearchBar>
                </Hero>

                {/* 공지 + FAQ 본문 */}
                <MainSections>
                    {/* 공지사항 섹션 */}
                    <section id="help-notices">
                        <SectionHead>
                            <H2>공지사항</H2>
                            <Lead>최신 안내와 중요한 변경사항을 확인하세요.</Lead>
                        </SectionHead>
                        <Hr />
                        <NoticeSection />
                    </section>

                    {/* FAQ 섹션 (검색어는 상단 입력과 공유) */}
                    <section id="help-faq">
                        <SectionHead>
                            <H2>자주 묻는 질문</H2>
                            <Lead>카테고리별 자주 묻는 질문을 빠르게 찾아보세요.</Lead>
                        </SectionHead>
                        <Hr />
                        <FaqSection query={faqQuery} onQueryChange={setFaqQuery} showSearch={false} />
                    </section>
                </MainSections>
            </Container>
        </Page>
    );
}
