// src/components/Footer.jsx
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Bar = styled.footer`
  background: ${({ theme }) => theme?.colors?.navy || "#0B1626"};
  color: rgba(255,255,255,.85);
  font-size: 14px;
  padding: 48px 16px 24px;
`;
const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
  gap: 24px;
`;
const Col = styled.div` display: grid; gap: 10px; `;
const Title = styled.div` font-weight: 800; margin-bottom: 6px; color: #fff; `;
const Desc = styled.p` margin: 0; opacity: .8; line-height: 1.4; `;
const Links = styled.div`
  display: grid; gap: 6px;
  a { color: rgba(255,255,255,.85); text-decoration: none; }
  a:hover { color: #fff; }
`;
const ContactItem = styled.div`
  display: flex; align-items: center; gap: 6px; opacity: .9;
`;
const BizBox = styled.div`
  grid-column: 1 / -1;
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
  background: rgba(255,255,255,.03);
`;
const BizTitle = styled.div` font-weight: 800; color: #fff; margin-bottom: 6px; `;
const BizLine = styled.div` opacity: .85; `;
const Inline = styled.span` display: inline-block; margin-right: 10px; `;
const Bottom = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 24px auto 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,.15);
  font-size: 13px;
  opacity: .7;
  text-align: center;
`;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Bar>
      <Wrap>
        {/* 소개 */}
        <Col>
          <Title>위드아지트</Title>
          <Desc>방과 후 돌봄 키즈 커뮤니티</Desc>
       
        </Col>

        {/* 서비스 메뉴 */}
        <Col>
          <Title>서비스</Title>
          <Links>
            <Link to="/membership">멤버십 안내</Link>
            <Link to="/pickup/applry">픽업 신청</Link>
            <Link to="/branches">지점 안내</Link>
            <a
              href="http://pf.kakao.com/_qYzxkn"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오 채널 열기
            </a>
          </Links>
        </Col>

        {/* 고객지원 */}
        <Col>
          <Title>고객지원</Title>
          <Links>
            <Link to="/notices">공지사항</Link>
            <Link to="/faq">자주묻는 질문</Link>
            <Link to="/support">고객센터</Link>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </Links>
        </Col>

        {/* 연락처 */}
        <Col>
          <Title>연락처</Title>
          <ContactItem>📞 031-548-2962</ContactItem>
          <ContactItem>✉️ withagit.biz@gmail.com</ContactItem>
          <ContactItem>⏰ 평일 09:00-18:00</ContactItem>
        </Col>

        {/* 사업자 정보 */}
        <BizBox>
          <BizTitle>위드아지트 | 운영사: 주식회사 어센트웍스</BizTitle>
          <BizLine>
            <Inline>주소: 경기도 용인시 수지구 포은대로 313번길 7-10, 107호</Inline>
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
