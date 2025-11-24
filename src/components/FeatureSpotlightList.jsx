/* eslint-disable */
// src/components/FeatureSpotlightList.jsx
// “절반 폭 · 중앙 헤더(검정) · 2×2 큰 타일 · 아이콘 하단 고정 · 배지 없음” 버전
import React from "react";
import styled from "styled-components";

/* ===== Tokens ===== */
const ORANGE = "var(--color-accent, #FF7B3D)";
const NAVY = "#1B2B4C";

/* ===== Section / Containers ===== */
const Section = styled.section`

  padding: 72px 16px;
  @media (min-width: 1024px) { padding: 96px 16px; }
`;

/* 바깥 컨테이너는 최대 1200, 내부 컨테이너는 데스크탑에서 절반 폭 */
const Outer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Inner = styled.div`
  width: 100%;
  margin: 0 auto;
  /* 모바일은 100%, 데스크톱에서 전체 컨테이너의 절반으로 */
  @media (min-width: 1024px) { width: 50%; }
  display: grid;
  gap: 36px;
`;

/* ===== Header (카드 아님 / 중앙 정렬 / 검정 글자) ===== */
const Head = styled.header`
  text-align: center;
  max-width: 760px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin: 0 0 12px;
  font-weight: 900;
  color: #111827;              /* 검정 */
  letter-spacing: -0.4px;
  line-height: 1.15;
  font-size: clamp(26px, 3.6vw, 40px);
`;

const Lead = styled.p`
  margin: 0;
  color: #6b7280;              /* 중간 회색 */
  font-size: clamp(14px, 1.4vw, 16px);
  line-height: 1.8;
  white-space: pre-line;       /* 줄바꿈 유지 */
`;

/* ===== Tiles (2×2, 큰 박스) ===== */
const Tiles = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 720px) { grid-template-columns: 1fr 1fr; }
`;

const Tile = styled.div`
  position: relative;
  border-radius: 20px;
  background: ${({ $bg }) => $bg || "#F4F7FF"};
  border: 1px solid rgba(0,0,0,.06);
  min-height: 220px;
  padding: 28px 28px 84px;     /* 아래쪽에 아이콘 공간 확보 */
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(0,0,0,.06);
`;

const TTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
`;

const TBody = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.7;
`;

/* 아이콘을 하단/오른쪽에 고정 배치 */
const IconBox = styled.div`
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 88px;
  height: 72px;

  display: grid;
  place-items: center;

  img { width: 80%; height: 80%; object-fit: contain; }
`;

/* ===== Default content (요청하신 4개) ===== */
const DEFAULT_ITEMS = [
  {
    title: "누구나 무료로 사용",
    body: "원장님·선생님·학부모 누구나 비용 부담 없이 시작할 수 있어요.",
    iconUrl: "/img/icons/users.png",
    bg: "#EAF2FF"
  },
  {
    title: "PC, Mobile 어디서든 편하게",
    body: "기기에 상관없이 웹/모바일에서 언제든 간편하게 이용하세요.",
    iconUrl: "/img/icons/devices.png",
    bg: "#FFF6D9"
  },
  {
    title: "원과 가정을 잇는 바른소통",
    body: "교육기관엔 편의와 효율을, 가정엔 믿음과 공감을 전합니다.",
    iconUrl: "/img/icons/chat-bubble.png",
    bg: "#EAF5FF"
  },
  {
    title: "카카오 인프라 기반의 안정적 서비스",
    body: "카카오 제휴 인프라로 보안과 안정성을 갖춘 운영 환경을 제공합니다.",
    iconUrl: "/img/icons/kakao.png",
    bg: "#FFF0DC"
  }
];

/* ===== Component ===== */
export default function FeatureSpotlightList({
  items = DEFAULT_ITEMS
}) {
  return (
    <Section>
      <Outer>
        <Inner>
    

          <Tiles>
            {items.map((it, idx) => (
              <Tile key={idx} $bg={it.bg}>
                <TTitle>{it.title}</TTitle>
                <TBody>{it.body}</TBody>
                {it.iconUrl ? (
                  <IconBox>
                    <img src={it.iconUrl} alt="" />
                  </IconBox>
                ) : null}
              </Tile>
            ))}
          </Tiles>
        </Inner>
      </Outer>
    </Section>
  );
}
