/* eslint-disable */
// /src/components/CoreValuesFigmaSection.jsx
import React from "react";
import styled from "styled-components";
import { imageDB } from "../utils/imageDB";

import layer1 from "../assets/Layer1/layer1.png";
import layer2 from "../assets/Layer1/layer2.png";
import layer3 from "../assets/Layer1/layer3.png";
import layer4 from "../assets/Layer1/layer4.png";
import layer5 from "../assets/Layer1/layer5.png";

/* ===== 전체 레이아웃 ===== */

const Section = styled.section`
  position: relative;
  background: #FFE9AC;  /* 다음 섹션(흰+아주 연한 크림)과 같은 색으로 */
`;

const Panel = styled.div`
  position: relative;
  margin-top: -50px;
  overflow: hidden;
  background: #FFE9AC;
  padding: 80px 0 140px 0;  /* 아래 패딩은 곡선 깊이만큼 살짝 줄여줌 */
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

  /* ⬇️ 아래쪽 가운데만 둥글게 치고 올라오는 흰 곡선 */
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -110px;            /* 얼마나 내려갈지 깊이 */
    transform: translateX(-50%);
    width: 170%;               /* 좌우는 넉넉하게 */
    height: 220px;             /* 곡선 높이(너무 깊지 않게) */
    background: #fffdf8;       /* Section 배경색과 동일 */
    border-radius: 50% 50% 0 0;
    box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.06);  /* 아래 테두리 살짝 음영 */
  }
`;
const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 960px) {
    padding: 0 16px;
  }
`;

/* ===== 헤더 ===== */

const TopText = styled.div`
  text-align: center;
  margin-bottom: 40px;
  margin-top:100px;
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #f07a2a;
  margin-bottom: 8px;
`;

const MainTitle = styled.h2`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: clamp(32px, 4vw, 40px);
  font-weight: 900;
  color: #1A1A1A;
  letter-spacing: -0.4px;
  line-height: 1.18;
  position: relative;
  display: inline-block;

  & span {
    position: relative;
    z-index: 1;
  }

  & span::before {
    content: "";
    position: absolute;
    left: -6px;
    right: -6px;
    bottom: 6px;
    height: 55%;
    background: #ffd471;
    border-radius: 12px;
    z-index: -1;
  }
`;

const TitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 4px;
    height: 40%;
    background: #ffe39b;
    border-radius: 999px;
    z-index: -1;
  }
`;

const Desc = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #555555;
`;

/* ===== 상단 2컬럼 (왼 텍스트 / 오른 오비트) ===== */

const MidGrid = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.3fr;
  gap: 24px;
  align-items: center;
  max-width: 1040px;
  margin: 40px auto 56px 150px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 32px;
    max-width: 100%;
    margin: 32px 0 40px;
  }
`;

const LeftBlock = styled.div`
  color: #222222;
`;

const LeftTitle = styled.h3`
  margin: 0 0 18px 0;
  font-family: "NanumSquareRound";
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -0.4px;
  color: #1a1a1a;
`;
const LeftBody = styled.p`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: 18px;
  line-height: 1.8;
  color: #757575;
  white-space: pre-line;
`;

const Em = styled.span`
  color: #ff7e32;   /* 피그마 포인트 오렌지 */
  font-weight: 900;
`;

const OrbitWrap = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  transform: translateX(10px);  /* 살짝 오른쪽으로 밀어서 균형 맞추기 */

  @media (max-width: 480px) {
    width: 260px;
    height: 260px;
    transform: none;
  }
`;

const OrbitImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
`;

/* ===== 하단 4카드 ===== */

const CardsOuter = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const CardsInner = styled.div`
  width: 100%;
  margin: 0 auto;

  @media (min-width: 1024px) {
    width: 76%; /* 형이 골라준 비율 */
  }
`;

const Tiles = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Tile = styled.div`
  position: relative;
  border-radius: 32px;
  background: ${({ $bg }) => $bg || "#f4f7ff"};
  border: 1px solid rgba(0, 0, 0, 0.04);
  min-height: 230px;
  padding: 30px 32px 110px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
`;
const TTitle = styled.div`
  margin: 0 0 18px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/* 윗줄 */
const TLineTop = styled.div`
  font-family: "NanumSquareRound";
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  color: #666666;           /* ⬅️ 연회색 → 좀 더 진한 회색 */
`;

/* 아랫줄 */
const TLineBottom = styled.div`
  font-family: "NanumSquareRound";
  font-size: 24px;
  font-weight: 900;
  line-height: 1.15;
`;

/* 하이라이트 (조금 더 쨍한 살구색) */
const TAccent = styled.span`
  color: ${({ $color }) => $color || "#ff9d6a"};  /* ⬅️ #f7a777 → #ff9d6a */
  font-weight: 900;
`;

/* 아랫줄 나머지(회색) */
const TTail = styled.span`
  color: #777777;           /* ⬅️ #b8b8b8 → 한 톤 진하게 */
  font-weight: 800;
`;

const TitleEm = styled.span`
  color: #ff7e32;           /* 키즈 커뮤니티 포인트 색 */
  font-weight: 900;         /* 부모랑 동일하게 */
`;

/* 단일 라인 제목(2~4번 카드)도 약간 더 진하게 */
const TSingle = styled.div`
  font-family: "NanumSquareRound";
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
  color: #444444;           /* ⬅️ #555555에서 조금 더 또렷하게 */
`;
const TBody = styled.p`
  margin: 0;
  color: #666666;           /* ⬅️ #a0a0a0 → 더 선명한 회색 */
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-line;
`;
/* 아이콘 – 더 크게, 아래에 붙이기 */
const IconBox = styled.div`
  position: absolute;
  right: 26px;
  bottom: 24px;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

/* ===== 카드 데이터 (텍스트/이미지/색) ===== */

const CARD_ITEMS = [
  {
    key: "teacher",
    bg: "#FFF5EB",          // ⬅️ 기존 #FFF8F0 에서 아주 살짝 진하게
    icon: layer2,
    // 제목/본문은 렌더에서 개별 처리
  },
  {
    key: "insurance",
    bg: "#F0F7FF",          // ⬅️ 기존 #F8FCFF 보다 파랑 톤 살짝
    icon: layer3,
  },
  {
    key: "realtime",
    bg: "#F8FCFF",
    icon: layer4,
  },
  {
    key: "smart",
    bg: "#FFF8F0",
    icon: layer5,
  },
];

/* ===== 카드 렌더 ===== */

function CoreValueCards() {
  return (
    <CardsOuter>
      <CardsInner>
        <Tiles>
          {CARD_ITEMS.map((it) => {
            if (it.key === "teacher") {
              // 1. 모든 돌봄 교사 카드
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineTop>모든 돌봄 교사</TLineTop>
                    <TLineBottom>
                      <TAccent>신원·경력 확인</TAccent>
                      <TTail> 완료</TTail>
                    </TLineBottom>
                  </TTitle>
                  <TBody>
                    모든 교사는 아동학대·성범죄 이력 조회를 완료한
                    안전 인증 인력이며, 교육·보육 등
                    {"\n"}
                    관련 경력 보유자를 중심으로 선발합니다.
                  </TBody>
                  <IconBox>
                    <img src={it.icon} alt="" />
                  </IconBox>
                </Tile>
              );
            }

            if (it.key === "insurance") {
              // 2. 배상보험 카드
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineTop $color="#b4b4b4">돌봄 중 사고 대비</TLineTop>
                    <TLineBottom>
                      <TAccent $color="#4C8DFF">배상보험</TAccent>
                      <TTail> 가입</TTail>
                    </TLineBottom>
                  </TTitle>
                  <TBody>
                    예기치 못한 상황에도 안심할 수 있도록
                    {"\n"}
                    모든 교사와 공간은 업계 상위 수준의
                    {"\n"}
                    배상보험에 가입되어 있습니다.
                  </TBody>
                  <IconBox>
                    <img src={it.icon} alt="" />
                  </IconBox>
                </Tile>
              );
            }

            if (it.key === "realtime") {
              // 3. 실시간 알림 카드
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineBottom>
                      <TAccent $color="#4C8DFF">실시간 알림</TAccent>
                      <TTail>으로 안심 연결</TTail>
                    </TLineBottom>
                  </TTitle>
                  <TBody>
                    입·퇴장과 픽업 출발·도착 등 주요 활동이
                    {"\n"}
                    실시간 알림으로 보호자에게 즉시 전달됩니다.
                  </TBody>
                  <IconBox>
                    <img src={it.icon} alt="" />
                  </IconBox>
                </Tile>
              );
            }

            if (it.key === "smart") {
              // 4. 스마트 돌봄 카드
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineTop $color="#b4b4b4">
                      지역과 함께 발전하는
                    </TLineTop>
                    <TLineBottom>
                      <TAccent $color="#f7a777">스마트 돌봄</TAccent>
                    </TLineBottom>
                  </TTitle>
                  <TBody>
                    이용 데이터를 통해 지역 돌봄 환경을 이해하고,
                    {"\n"}
                    부모와 아이 모두에게 도움이 되는
                    {"\n"}
                    서비스를 함께 만들어갑니다.
                  </TBody>
                  <IconBox>
                    <img src={it.icon} alt="" />
                  </IconBox>
                </Tile>
              );
            }

            // 혹시 모를 fallback
            return null;
          })}
        </Tiles>
      </CardsInner>
    </CardsOuter>
  );
}

/* ===== 메인 컴포넌트 ===== */

export default function Layer1({
  label = "CORE VALUE",
  mainTitle = "안전한 픽업과 따뜻한 돌봄",
  desc = "아이들의 일상 돌봄부터 배움, 놀이터까지 한 공간에서",
}) {
  return (
    <Section>
      <Panel>
        <Container>
          <TopText>
            <Label>{label}</Label>
            <MainTitle>
              <span>안전한 픽업과 따뜻한 돌봄</span>
            </MainTitle>
            <Desc>{desc}</Desc>
          </TopText>

          <MidGrid>
            <LeftBlock>
              <LeftTitle>
                지역 사회와 함께 성장하는 <TitleEm>키즈 커뮤니티</TitleEm>
              </LeftTitle>
              <LeftBody>
                부모에게는 시간과 안심을,
                {"\n"}
                아이에게는 안전과 창의적 경험을.
                {"\n"}
                지역사회와 <Em>함께 성장하며 지속하는 돌봄 생태계</Em>를
                구축합니다.
              </LeftBody>
            </LeftBlock>

            <OrbitWrap>
              <OrbitImage src={layer1} alt="위드아지트 돌봄 서비스 핵심 가치" />
            </OrbitWrap>
          </MidGrid>

          <CoreValueCards />
        </Container>
      </Panel>
    </Section>
  );
}
