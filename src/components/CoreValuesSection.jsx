/* eslint-disable */
// /src/pages/landing/CoreValuesSection.jsx
// Withagit Landing — 피그마 기반 핵심 가치 섹션
// 1행: 왼쪽 텍스트 / 오른쪽 [메인 이미지 + 노란 말풍선 이미지]
// 2행: 왼쪽 [메인 이미지 + 노란 말풍선 이미지] / 오른쪽 텍스트

import React from "react";
import styled from "styled-components";

import Frame1 from "../assets/Layer2/Frame1.png"; // 1행 메인 이미지
import Frame2 from "../assets/Layer2/Frame2.png"; // 2행 메인 이미지

// ✅ 형이 준비할 말풍선 이미지 (파일만 맞게 두면 바로 뜸)
import Bubble1 from "../assets/Layer2/Bubble1.png"; // 1행 말풍선
import Bubble2 from "../assets/Layer2/Bubble2.png"; // 2행 말풍선

/* ================== Layout ================== */

const SectionWrap = styled.section`
  width: 100%;
  padding: 48px 20px 96px;
  box-sizing: border-box;
  background: #ffffff;

  @media (max-width: 768px) {
    padding: 40px 20px 80px;
  }
`;

const SectionInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 72px;

  @media (max-width: 768px) {
    gap: 56px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }
`;

const ColText = styled.div`
  flex: 1 1 0;
  min-width: 0;
  color: #111111;
  max-width: 520px;

  @media (max-width: 960px) {
    width: 100%;
    max-width: 420px;
    text-align: center;
  }
`;

/* 👉 이미지 컬럼: 위 사진 + 아래 말풍선 이미지를 세로로 쌓는 영역 */
const ColImage = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;           /* 메인 이미지 ↔ 말풍선 사이 여백 */
  margin-top: 8px;
  margin-bottom: 16px;

  @media (max-width: 960px) {
    width: 100%;
    gap: 14px;
    margin-top: 4px;
    margin-bottom: 14px;
  }
`;

/* 메인 컨셉 이미지 (사람/아이) */
const MainImage = styled.img`
  width: 100%;
  max-width: 460px;
  height: auto;
  display: block;
  border-radius: 32px;

  @media (max-width: 960px) {
    max-width: 380px;
  }
`;

/* 노란 말풍선 이미지 — 항상 메인 이미지 아래, 겹치지 않게 */
const BubbleImage = styled.img`
  width: 100%;
  max-width: 420px;
  height: auto;
  display: block;
  border-radius: 24px;

  @media (max-width: 960px) {
    max-width: 360px;
  }
`;

/* ================== Typography ================== */

const Eyebrow = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #f07a2a;
  margin: 0 0 8px;

  @media (max-width: 960px) {
    text-align: center;
  }
`;

const Title = styled.h2`
  margin: 0 0 12px;
  font-family: NanumSquareRound;
  font-size: clamp(28px, 3.1vw, 34px);
  line-height: 1.3;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.025em;

  .highlight {
    position: relative;
    display: inline-block;
    padding: 0 4px;
    z-index: 0;
    color: #ff7a00;
  }

  .highlight::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 5px;
    height: 52%;
    background: #fbd889;
    border-radius: 999px;
    z-index: -1;
  }

  @media (max-width: 960px) {
    text-align: center;
    font-size: 24px;
  }
`;

const Body = styled.p`
  margin: 0;
  font-family: "Pretendard";
  font-size: 16px;
  line-height: 1.55;
  letter-spacing: -0.01em;
  color: #111;
  white-space: pre-line;
  max-width: 520px;

  @media (max-width: 960px) {
    font-size: 14px;
    line-height: 1.5;
    text-align: center;
    max-width: 420px;
    margin: 0 auto;
  }
`;

/* ================== Component ================== */

export default function CoreValuesSection() {
  return (
    <SectionWrap>
      <SectionInner>
        {/* 1행 — 왼쪽 텍스트 / 오른쪽 [이미지 + 말풍선] */}
        <Row>
          <ColText>
            <Title>
              100m라도 안전하게
              <br />
              <span className="highlight">유연한 시간</span>
            </Title>
            <Body>
              필요한 순간에 원하는 만큼 이용할 수 있는 아지트 생활.
              {"\n"}
              픽업부터 공간 이용까지 
              {"\n"}
              일정에 맞춰 자유롭게 조합할 수 있습니다.
            </Body>
          </ColText>

          <ColImage>
            <MainImage
              src={Frame1}
              alt="퇴근이 늦어도 안심할 수 있는 안전한 픽업"
            />
            {/* 🔽 형이 준비할 노란 말풍선 이미지 자리 */}
            <BubbleImage
              src={Bubble1}
              alt="퇴근이 늦어도 아이를 걱정 없이 맡길 수 있어 마음이 놓여요."
            />
          </ColImage>
        </Row>

        {/* 2행 — 왼쪽 [이미지 + 말풍선] / 오른쪽 텍스트 */}
        <Row>
   

          <ColText>
            <Title>
              아이의 하루를 풍성하게
              <br />
              <span className="highlight">다양한 프로그램</span>
            </Title>
            <Body>
              학교·학원 일정은 물론, 주말과 방학에도
              {"\n"}
              돌봄·체험·창의활동 등 다양한 프로그램을 운영합니다.
             
              
            </Body>
          </ColText>

          <ColImage>
            <MainImage
              src={Frame2}
              alt="아이들이 기대하는 다양한 프로그램"
            />
            <BubbleImage
              src={Bubble2}
              alt="주말, 방학마다 새로운 프로그램으로 지루할 틈이 없어요."
            />
          </ColImage>
        </Row>
      </SectionInner>
    </SectionWrap>
  );
}
