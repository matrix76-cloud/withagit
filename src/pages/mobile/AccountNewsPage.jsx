/* eslint-disable */
// src/pages/mobile/AccountNewsPage.jsx


import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import NoticeSection from "../../components/help/NoticeSection";

import React, { useState } from "react";

const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const pageBg = "#FFFFFF";
const bannerBg = "#FFE9B4";
const accent = "var(--color-accent, #F07A2A)";

/* 전체 페이지 래퍼 */
const Page = styled.main`
  background: ${pageBg};
  padding: 16px 0 0;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;
`;

/* 위쪽 컨텐츠 영역(헤더 + 검색 + 공지 + 페이지네이션) */
const Content = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 24px;
  background: #ffffff;
  border-radius: 0 0 24px 24px;

  /* ✅ 위쪽 컨텐츠가 너무 짧을 때도 적어도 이만큼은 차지하게 */
  min-height: 360px;
`;

/* 상단 헤더 (뒤로가기만) */
const HeaderBar = styled.header`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const BackButton = styled.div`
  width: 68px;
  height: 48px;
  border: none;

  display: grid;
  place-items: center;
  font-size: 12px;
  cursor: pointer;
`;

/* 히어로 섹션 */
const HeroSection = styled.section`
  padding: 4px 0 18px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: ${text};
  text-align: center;
`;

const HeroTitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;      /* 텍스트 밑에서 살짝 떨어지게 */
    height: 40%;      /* 형광펜 두께 */
    background: #ffe39b;
    border-radius: 999px;
    z-index: -1;      /* 글자 뒤로 */
  }
`;


const HeroSub = styled.p`
  margin: 0 0 14px;
  font-size: 12px;
  color: ${sub};
  text-align: center;
`;

const SearchWrap = styled.div`
  margin-bottom: 14px;
`;

const SearchBar = styled.div`
  height: 46px;                /* ✅ 40 → 46 정도로 키우기 */
  border-radius: 999px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;             /* 살짝 여유 */
  font-size: 14px;
`;
const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;             /* 13 → 14 */
`;

/* ===== 하단 노란 카드 ===== */
const HelpBand = styled.section`
  max-width: 480px;
  margin: 24px auto 0;        /* 위 여백 살짝 줄임 */
  background: #ffe9b4;
  padding: 24px 20px 36px;    /* 전체 높이를 약 1/4 정도 줄인 느낌 */

  /* 내용을 가운데 배치 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
`;

const HelpTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 800;
  color: ${text};
`;

const HelpSub = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: ${sub};
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const OrangeBtn = styled.button`
  padding: 12px 26px;
  border-radius: 999px;
  border: none;
  background: ${accent};
  color: white;
  font-weight: 700;
`;

const OutlineBtn = styled.button`
  padding: 12px 26px;
  border-radius: 999px;
  border: 1px solid ${accent};
  background: transparent;
  color: ${accent};
  font-weight: 700;
`;

export default function AccountNewsPage() {
  const nav = useNavigate();
  const [keyword, setKeyword] = useState("");

  return (
    <Page>
      <Content>
 

        <HeroSection>
          <HeroTitle>
            <HeroTitleHighlight>소식/문의</HeroTitleHighlight>
          </HeroTitle>
          <HeroSub>자주 묻는 질문</HeroSub>

          <SearchWrap>
            <SearchBar>
              🔍
              <SearchInput
                placeholder="무엇이든 찾아보세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </SearchBar>
          </SearchWrap>
        </HeroSection>

        {/* 공지 리스트 + 페이지네이션 */}
        <NoticeSection keyword={keyword} />
      </Content>

      {/* 하단 노란 배너 */}
      <HelpBand>
        <HelpTitle>원하는 답변을 못 찾으셨나요?</HelpTitle>
        <HelpSub>지금 바로 1:1 문의하기</HelpSub>
        <ButtonsRow>
          <OrangeBtn
            type="button"
            onClick={() => nav("/help/feedback")}       
          >1:1 문의하기</OrangeBtn>
          <OutlineBtn
            type="button"
            onClick={() => nav("/branches/suggest")}
          >
            제안하기
          </OutlineBtn>
        </ButtonsRow>
      </HelpBand>
    </Page>
  );
}
