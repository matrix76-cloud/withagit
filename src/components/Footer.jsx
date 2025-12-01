// src/components/Footer.jsx
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Bar = styled.footer`
  background: #3b3b3b;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  padding: 32px 16px 20px;

  @media (max-width: 720px) {
    padding-bottom: 88px;
  }
`;

const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Col = styled.div`
  display: grid;
  gap: 8px;

  @media (max-width: 720px) {
    &.mobile-center {
      align-items: flex-start;
    }
  }
`;

const BrandCol = styled(Col)`
  @media (max-width: 720px) {
    align-items: flex-start;
  }
`;

const ColHideMobile = styled(Col)`
  @media (max-width: 720px) {
    display: none;
  }
`;

const Title = styled.div`
  font-weight: 800; /* Pretendard ExtraBold */
  margin-bottom: 4px;
  color: #fff;
  font-size: 12px;
`;

const Desc = styled.p`
  margin: 0;
  opacity: 0.8;
  line-height: 1.4;
  font-size: 12px;
`;

/* 공용 링크 스타일 */
const Links = styled.div`
  display: grid;
  gap: 4px;

  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    font-size: 12px;
    font-weight: 400; /* Regular */
  }

  a:hover {
    color: #fff;
  }
`;

/* 모바일용 상단 링크 (고객센터/약관/개인정보) */
const TopLinksRow = styled.div`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;

    a {
      font-size: 12px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
    }
    a:hover {
      color: #fff;
    }
  }
`;

const ContactCol = styled(Col)`
  @media (max-width: 720px) {
    gap: 6px;
  }
`;

const ContactRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
  font-size: 12px;
  font-weight: 400;
`;

const BizBox = styled.div`
  grid-column: 1 / -1;
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.03);

  @media (max-width: 720px) {
    font-size: 11.5px;
    line-height: 1.45;
    padding: 8px 10px;
  }
`;

const BizTitle = styled.div`
  font-weight: 800; /* ExtraBold */
  font-size: 12px;
  color: #fff;
  margin-bottom: 4px;
`;

const BizLine = styled.div`
  opacity: 0.85;
  font-size: 12px;
  font-weight: 400;
`;

const Inline = styled.span`
  display: inline-block;
  margin-right: 8px;
`;

const Bottom = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 16px auto 0;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 12px;
  font-weight: 400;
  opacity: 0.7;
  text-align: center;
`;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Bar>
      <Wrap>
        {/* 브랜드 / 소개 */}
        <BrandCol>
          <Title>위드아지트</Title>

          {/* 모바일 전용 상단 링크 세트 */}
          <TopLinksRow>
            <Link to="/support">고객센터</Link>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </TopLinksRow>
        </BrandCol>

        {/* 서비스 메뉴 (모바일에서는 숨김) */}
        <ColHideMobile>
          <Title>서비스</Title>
          <Links>
            <Link to="/membership">멤버십 안내</Link>
            <Link to="/pickup/apply">픽업 신청</Link>
            <Link to="/branches">지점 안내</Link>
            <a
              href="http://pf.kakao.com/_qYzxkn"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오 채널 열기
            </a>
          </Links>
        </ColHideMobile>

        {/* 고객지원 (모바일에서는 상세 리스트 숨김) */}
        <ColHideMobile>
          <Title>고객지원</Title>
          <Links>
            <Link to="/notices">공지사항</Link>
            <Link to="/faq">자주묻는 질문</Link>
            <Link to="/support">고객센터</Link>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </Links>
        </ColHideMobile>

        {/* 연락처 */}
        <ContactCol>
          <ContactRow>
            <ContactItem>📞 031-548-2962</ContactItem>
            <ContactItem>✉️ withagit.biz@gmail.com</ContactItem>
          </ContactRow>
          <ContactItem>⏰ 평일 09:00-18:00</ContactItem>
        </ContactCol>

        {/* 사업자 정보 */}
        <BizBox>
          <BizTitle>위드아지트 | 운영사: 주식회사 어센트웍스</BizTitle>
          <BizLine>
            <Inline>
              주소: 경기도 용인시 수지구 포은대로 313번길 7-10, 107호
            </Inline>
          </BizLine>
          <BizLine>
            <Inline>사업자등록번호: 159-87-03692</Inline>
            <Inline>대표자: 양소영</Inline>
            <Inline>통신판매업 신고번호: 제2025-용인수지-2455</Inline>
          </BizLine>
        </BizBox>
      </Wrap>

      <Bottom>© {year} WithAgit. All rights reserved.</Bottom>
    </Bar>
  );
}
