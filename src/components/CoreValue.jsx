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
  background: #ffe9ac;
`;

const Panel = styled.div`
  position: relative;
  margin-top: -50px;
  overflow: hidden;
  background: #ffe9ac;
  padding: 64px 0 140px 0;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

  @media (max-width: 960px) {
    padding: 72px 0 50px 0;
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -110px;
    transform: translateX(-50%);
    width: 170%;
    height: 220px;
    background: #fffdf8;
    border-radius: 50% 50% 0 0;
    box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 960px) {
    padding: 0 20px;
  }
`;

/* ===== 헤더 ===== */

const TopText = styled.div`
  text-align: center;
  margin-top: 60px;
  margin-bottom: 36px;

  @media (max-width: 960px) {
    margin-top: 44px;
    margin-bottom: 28px;
  }
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #f07a2a;
  margin-bottom: 8px;

  @media (max-width: 960px) {
    font-size: 14px;
    letter-spacing: 0.14em;
    margin-bottom: 6px;
  }
`;

const MainTitle = styled.h2`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: clamp(32px, 4vw, 40px);
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -0.4px;
  line-height: 1.18;
  position: relative;
  display: inline-block;

  @media (max-width: 960px) {
    font-size: 24px;
    letter-spacing: -0.2px;
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
    left: -6px;
    right: -6px;
    bottom: 6px;
    height: 55%;
    background: #ffd471;
    border-radius: 12px;
    z-index: -1;
  }

  @media (max-width: 960px) {
    &::before {
      bottom: 4px;
      height: 48%;
    }
  }
`;

const Desc = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: #555555;

  @media (max-width: 960px) {
    font-size: 13px;
    line-height: 1.55;
    margin-top: 6px;
  }
`;

/* ===== 상단 영역 (텍스트 + 오비트) ===== */

const MidGrid = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.3fr;
  gap: 24px;
  align-items: center;
  max-width: 1040px;
  margin: 32px auto 56px 150px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 28px;
    max-width: 100%;
    margin: 24px 0 40px;
  }
`;

const LeftBlock = styled.div`
  color: #222222;

  @media (max-width: 960px) {
    order: 2;
    text-align: center;
  }
`;

const LeftTitle = styled.h3`
  margin: 0 0 18px 0;
  font-family: "NanumSquareRound";
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -0.4px;
  color: #1a1a1a;

  @media (max-width: 960px) {
    font-size: 20px;
    letter-spacing: -0.2px;
    margin-bottom: 12px;
  }
`;

const LeftBody = styled.p`
  margin: 0;
  font-family: "NanumSquareRound";
  font-size: 18px;
  line-height: 1.8;
  color: #757575;
  white-space: pre-line;

  @media (max-width: 960px) {
    font-size: 14px;
    line-height: 1.7;
  }
`;

const Em = styled.span`
  color: #ff7e32;
  font-weight: 900;
`;

const OrbitWrap = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  transform: translateX(10px);

  @media (max-width: 960px) {
    order: 1;
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
    width: 76%;
  }
`;

const Tiles = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 960px) {
    gap: 18px;
  }
`;

/* 🔽 카드 높이/패딩 줄인 버전 */
const Tile = styled.div`
  position: relative;
  border-radius: 32px;
  background: ${({ $bg }) => $bg || "#f4f7ff"};
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 190px;
  padding: 20px 22px 64px 22px;
  overflow: hidden;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.06);

  @media (max-width: 960px) {
    border-radius: 22px;
    min-height: 150px;
    padding: 18px 18px 18px 18px;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
  }
`;

const TTitle = styled.div`
  margin: 0 0 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 960px) {
    margin-bottom: 8px;
  }
`;

/* 윗줄: 더 진한 색 + 굵게 */
const TLineTop = styled.div`
  font-family: "NanumSquareRound";
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
  color: #444444;

  @media (max-width: 960px) {
    font-size: 17px;
    line-height: 1.25;
  }
`;

/* 아랫줄: 강조 단어 + 나머지도 진하게 */
const TLineBottom = styled.div`
  font-family: "NanumSquareRound";
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
  color: #444444;

  @media (max-width: 960px) {
    font-size: 17px;
    line-height: 1.25;
  }
`;

const TAccent = styled.span`
  color: ${({ $color }) => $color || "#ff8b4c"};
  font-weight: 900;
`;

const TTail = styled.span`
  color: #555555;
  font-weight: 900;
`;

const TitleEm = styled.span`
  color: #ff7e32;
  font-weight: 900;
`;

const TSingle = styled.div`
  font-family: "NanumSquareRound";
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  color: #444444;

  @media (max-width: 960px) {
    font-size: 17px;
  }
`;

const TBody = styled.p`
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-line;

  @media (max-width: 960px) {
    font-size: 13px;
    line-height: 1.5;
  }
`;

/* 아이콘: 타이틀 오른쪽 상단 */
const IconBox = styled.div`
  position: absolute;
  right: 20px;
  top: 22px;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 960px) {
    right: 14px;
    top: 15px;
    width: 60px;
    height: 60px;
  }
`;

/* ===== 카드 데이터 ===== */

const CARD_ITEMS = [
  {
    key: "teacher",
    bg: "#FFF5EB",
    icon: layer2,
  },
  {
    key: "insurance",
    bg: "#F0F7FF",
    icon: layer3,
  },

  {
    key: "smart",
    bg: "#FFF8F0",
    icon: layer5,
  },
  {
    key: "realtime",
    bg: "#F8FCFF",
    icon: layer4,
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
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineTop>돌봄 중 사고 대비</TLineTop>
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

       
            if (it.key === "smart") {
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineTop>지역과 함께 발전하는</TLineTop>
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


            if (it.key === "realtime") {
              return (
                <Tile key={it.key} $bg={it.bg}>
                  <TTitle>
                    <TLineBottom>
                      <TAccent $color="#4C8DFF">실시간 알림</TAccent>
                      <TTail>으로</TTail>

                      <TLineBottom>

                        <TTail> 안심 연결</TTail>
                      </TLineBottom>

                    </TLineBottom>
                  </TTitle>
                  <TBody>
                    픽업 도착 입퇴장등 주요활동이
                    {"\n"}
                    실시간 알림으로 보호자에게 즉시 전달됩니다.
                  </TBody>
                  <IconBox>
                    <img src={it.icon} alt="" />
                  </IconBox>
                </Tile>
              );
            }


            return null;
          })}
        </Tiles>
      </CardsInner>
    </CardsOuter>
  );
}

/* ===== 메인 컴포넌트 ===== */

export default function CoreValue({ label = "CORE VALUE" }) {
  return (
    <Section>
      <Panel>
        <Container>
          <TopText>
            <Label>{label}</Label>
            <MainTitle>
              <span>안전한 픽업과</span>
              <br />
              <TitleHighlight>따뜻한 돌봄</TitleHighlight>
            </MainTitle>
            <Desc>
              아이들의 일상 돌봄부터 배움, 놀이터까지
              <br />
              한 공간에서 함께 누릴 수 있어요.
            </Desc>
          </TopText>

          <MidGrid>
            <OrbitWrap>
              <OrbitImage src={layer1} alt="위드아지트 돌봄 서비스 핵심 가치" />
            </OrbitWrap>

            <LeftBlock>
              <LeftTitle>
                지역 사회와 함께 성장하는
                <br />
                <TitleEm>키즈 커뮤니티</TitleEm>
              </LeftTitle>
              <LeftBody>
                부모에게는 시간과 안심을,
                {"\n"}
                아이에게는 안전과 창의적 경험을.
                {"\n"}
                지역사회와 <Em>함께 성장하며 지속하는 돌봄 생태계</Em>를 구축
                합니다.
              </LeftBody>
            </LeftBlock>
          </MidGrid>

          <CoreValueCards />
        </Container>
      </Panel>
    </Section>
  );
}
