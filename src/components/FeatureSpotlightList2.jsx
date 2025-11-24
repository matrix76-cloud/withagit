/* eslint-disable */
// src/components/FeatureSpotlightList.jsx
// Glass 패널 + 도트 배경 + 좌/우 배치 + 항목별 높이 clamp/폭 조절(imageWidth, panelMaxWidth) + in-view 애니메이션
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

/* ===== Tokens ===== */
const ORANGE = "var(--color-accent, #FF7B3D)";
const NAVY = "#1B2B3A";

/* ===== Section (dot pattern) ===== */
const Section = styled.section`
  background:
    radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0) 0 0/20px 20px,
    #fff;
  padding: 56px 16px;
  @media (min-width: 1024px){ padding: 72px 16px; }
`;

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 56px;
  @media (min-width: 1024px){ gap: 100px; }
`;

/* ===== Item (image + panel) ===== */
const Item = styled.article`
  position: relative;
  display: grid;
  gap: 0;
  /* 패널을 '콘텐츠 높이' 만큼만 나오게 상단 정렬 */
  align-items: start;
  grid-template-columns: 1fr;

  @media (min-width: 1024px){
    grid-template-columns: 5fr 5fr;      /* 이미지 : 패널 */

  }
`;

/* ===== Image Card (height clamp + width 조절) ===== */

// ✅ 수정본만 — ImgCard, PanelCard 전체 정의 교체

const ImgCard = styled.div`
  position: relative;
  z-index: 0;
  border-radius: 24px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 18px 44px rgba(0,0,0,.08);

  /* 가로폭(모바일 100%, 데스크톱은 사이드별 기본값) */
  width: ${({ $w }) => $w?.mobile || "100%"};
  justify-self: ${({ $side }) => ($side === "right" ? "start" : "end")};

  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
    display: block;
    filter: saturate(1.02);
  }

  opacity: ${({ $inview }) => ($inview ? 1 : 0)};
  transform: ${({ $inview }) => ($inview ? "translateY(0)" : "translateY(12px)")};
  transition: opacity .6s ease, transform .6s ease;
`;





/* 이미지 가장자리 스크림 */
const ScrimEdge = styled.div`

  pointer-events: none;
  position: absolute; top:0; bottom:0; width: 28%;
  z-index: 1;
  ${({ $side }) => $side === 'right'
    ? css`right:0; background: linear-gradient(270deg, rgba(0,0,0,.22) 0%, rgba(0,0,0,0) 100%);`
    : css`left:0;  background: linear-gradient(90deg,  rgba(0,0,0,.22) 0%, rgba(0,0,0,0) 100%);`
  }
`;

/* ===== Glass Panel ===== */
const PanelCard = styled.div`
  position: relative;
  z-index: 2;                                 /* ✅ 이미지/스크림 위 */
  border-radius: 24px;
  /* 글래스 + 라이트 그라디언트 */
  background:
    linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.86) 100%);
  backdrop-filter: blur(14px);                /* ✅ 블러 업 */
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(0,0,0,.06);
  /* 입체감 강화: 바깥 그림자 + 유리 테두리 링 */
  box-shadow:
    0 18px 44px rgba(0,0,0,.12),
    0 0 0 1px rgba(255,255,255,.6) inset;
  padding: 28px;
  height: auto;
  align-self: start;
  display: block;
  margin-top: 80px;                           /* 살짝 위로 당김 */
  margin-left:100px;

  /* 🔥 이미지 쪽으로 더 깊게 겹침 */
  @media (min-width: 1024px){
    ${({ $side }) =>
    $side === 'right'
      /* 패널이 오른쪽에 있을 때: 왼쪽으로 더 겹치기 */
      ? css`margin-left: -64px; border-top-left-radius: 18px; border-bottom-left-radius: 18px;`
      /* 패널이 왼쪽에 있을 때: 오른쪽으로 더 겹치기 */
      : css`margin-right: -64px; border-top-right-radius: 18px; border-bottom-right-radius: 18px;`}
  }

  /* 폭/최대폭은 기존 로직 유지 */
  width: ${({ $pw }) => $pw?.mobile || "100%"};
  max-width: ${({ $pw }) => $pw?.mobile || "100%"};
  @media (min-width: 1024px){
    max-width: ${({ $pw }) => $pw?.desktop || "none"};
  }

  /* ✨ 패널 상단 글로스 */
  &::before{
    content:"";
    position:absolute; left:12px; right:12px; top:10px; height:44px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 100%);
    pointer-events:none;
  }

  /* ▶ 진입 방향: 패널이 위치한 쪽에서 슬라이드 인 */
  opacity: ${({ $inview }) => ($inview ? 1 : 0)};
  transform: ${({ $inview, $side }) =>
    $inview
      ? "translateX(0)"
      : ($side === "right" ? "translateX(24px)" : "translateX(-24px)")};
  transition: opacity .6s ease, transform .6s ease;
`;
/* ===== Text ===== */
const TitleRow = styled.h3`
  margin: 0 0 10px;
  line-height: 1.22;
  letter-spacing: -.3px;
  color: ${ORANGE};
  font-size: clamp(26px, 3.2vw, 36px);
`;

const Body = styled.p`
  margin: 0 0 18px;
  color: #79808B;
  line-height: 1.7;
  font-size: 16px;
  white-space: pre-line;
`;

const Points = styled.div`display: grid; gap: 0;`;
const Point = styled.div`
  padding: 14px 0;
  color: ${NAVY};
  letter-spacing: -.2px;
  font-size: 18px;
  border-top: 1px solid rgba(0,0,0,.08);
  &:last-child{ border-bottom: 1px solid rgba(0,0,0,.08); }
`;

/* ===== Single Item ===== */
function FeatureItem({ it, index }) {
  const reverse = it.imageSide === "right";
  const sideForScrim = reverse ? "left" : "right";
  const panelSide = reverse ? "left" : "right";

  const rootRef = useRef(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setInview(true); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInview(true);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* title + highlight → 한 줄 병합 */
  const mergedTitle = useMemo(() => {
    const t = (it.title || "").trim();
    const h = (it.highlight || "").trim();
    return [t, h].filter(Boolean).join(" ");
  }, [it.title, it.highlight]);

  /* points: 배열 우선, 없으면 pointsText 줄바꿈 분리 */
  const points = useMemo(() => {
    if (Array.isArray(it.points) && it.points.length) return it.points;
    const raw = (it.pointsText || "").trim();
    if (!raw) return [];
    return raw
      .split(/\n+/)
      .map(s => s.replace(/^[-•·]\s?/, "").trim())
      .filter(Boolean);
  }, [it.points, it.pointsText]);

  return (
    <Item ref={rootRef} $reverse={reverse}>
      {/* left image */}
      {!reverse && (
        <ImgCard
          $inview={inview}
          $hc={it.heightClamp}
          $w={it.imageWidth}
          $side={"left"}
        >
          <img src={it.imageUrl} alt={it.alt || it.title || `feature-${index + 1}`} loading="lazy" />
          <ScrimEdge $side={sideForScrim} />
        </ImgCard>
      )}

      {/* glass panel */}
      <PanelCard
        $side={panelSide}
        $inview={inview}
        $pw={it.panelMaxWidth}
      >
        {!!mergedTitle && <TitleRow>{mergedTitle}</TitleRow>}
        {!!it.body && <Body>{it.body}</Body>}
        {!!points.length && (
          <Points>
            {points.map((p, i) => <Point key={i}>{p}</Point>)}
          </Points>
        )}
      </PanelCard>

      {/* right image */}
      {reverse && (
        <ImgCard
          $inview={inview}
          $hc={it.heightClamp}
          $w={it.imageWidth}
          $side={"right"}
        >
          <img src={it.imageUrl} alt={it.alt || it.title || `feature-${index + 1}`} loading="lazy" />
          <ScrimEdge $side={sideForScrim} />
        </ImgCard>
      )}
    </Item>
  );
}

/* ===== Exported List ===== */
export default function FeatureSpotlightList2({
  // items: [{
  //   imageUrl, alt, title, highlight, body, points, pointsText,
  //   imageSide:'left'|'right',
  //   heightClamp:{minMobile,maxMobile,minDesktop,maxDesktop,vh},
  //   imageWidth:{mobile,desktop},           // 예: { desktop:'88%' }
  //   panelMaxWidth:{mobile,desktop}         // 예: { desktop:'560px' }
  // }]
  items = [],
}) {
  return (
    <Section>
      <Wrap>
        {items.map((it, i) => (
          <FeatureItem key={i} it={it} index={i} />
        ))}
      </Wrap>
    </Section>
  );
}
