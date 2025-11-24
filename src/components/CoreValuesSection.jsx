/* eslint-disable */
// /src/pages/landing/CoreValuesSection.jsx
// Withagit Landing — 피그마 기반 핵심 가치 섹션
// 1행: 왼쪽 텍스트 / 오른쪽 전체 이미지
// 2행: 왼쪽 전체 이미지 / 오른쪽 텍스트

import React from "react";
import styled from "styled-components";

// TODO: 이미지 경로는 프로젝트 구조에 맞게 수정해 주세요.
import Frame1 from "../assets/Layer2/Frame1.png"; // 1행 오른쪽(보호자 + 말풍선)
import Frame2 from "../assets/Layer2/Frame2.png"; // 2행 왼쪽(아이들 + 말풍선)

/* ================== Layout ================== */

const SectionWrap = styled.section`
  width: 100%;
  padding: 120px 20px 120px;
  box-sizing: border-box;
  background: #ffffff;
`;

const SectionInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 96px;

  @media (max-width: 768px) {
    gap: 72px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;   /* 양쪽을 가운데로 조금 더 모으기 */
  gap: 32px;                 /* 56 → 32, 간격 줄이기 */

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
  }
`;

const ColText = styled.div`
  flex: 1 1 0;
  min-width: 0;
  color: #111111;

  @media (max-width: 960px) {
    width: 100%;
  }
`;

const ColImage = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  justify-content: center;

  @media (max-width: 960px) {
    width: 100%;
  }

  img {
    width: 100%;
    max-width: 460px;
    height: auto;
    display: block;
    border-radius: 32px;
  }
`;

/* ================== Typography ================== */

const Eyebrow = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #f07a2a;
  margin: 0 0 8px;
`;

const Title = styled.h2`
  margin: 0 0 18px;
  font-family: "NanumSquareRound";
  font-size: clamp(28px, 3.4vw, 40px);
  line-height: 1.18;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -0.04em;

  .highlight {
    position: relative;
    display: inline-block;
    padding: 0 4px;
    z-index: 0;
  }

  .highlight::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 8px;       /* 하이라이트를 글자에 좀 더 가깝게 */
    height: 55%;       /* 밑줄이 아니라 아래 절반을 채우는 느낌 */
    background: #fbd889;
    border-radius: 12px;
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;


const Body = styled.p`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: 18px;
  line-height: 1.8;
  color: #757575;
  white-space: pre-line;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
/* ================== Component ================== */

export default function CoreValuesSection() {
  return (
    <SectionWrap>
      <SectionInner>
        {/* 1행 — 왼쪽 텍스트 / 오른쪽 전체 이미지 */}
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
              픽업부터 공간 이용까지 일정에 맞춰 자유롭게 조합할 수 있습니다.
            </Body>
          </ColText>
          <ColImage>
            <img src={Frame1} alt="퇴근이 늦어도 안심할 수 있는 안전한 픽업" />
          </ColImage>
        </Row>

        {/* 2행 — 왼쪽 전체 이미지 / 오른쪽 텍스트 */}
        <Row>
          <ColImage>
            <img src={Frame2} alt="아이들이 기대하는 다양한 프로그램" />
          </ColImage>
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
        </Row>
      </SectionInner>
    </SectionWrap>
  );
}
