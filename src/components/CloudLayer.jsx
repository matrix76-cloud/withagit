// src/components/CloudBelt.jsx
/* eslint-disable */
import React from "react";
import styled, { keyframes, css } from "styled-components";

// PNG 구름 (투명 배경)
import cloud1 from "../assets/images/cloud_1.png";
import cloud2 from "../assets/images/cloud_2.png";
import cloud3 from "../assets/images/cloud_3.png";

/* 화면 바깥→바깥(뷰포트 기준) 등속 이동 + 미세 드리프트 */
const moveX = keyframes`
  0%   { transform: translateX(-40vw) translateY(var(--drift, 4px)); }
  50%  { transform: translateX( 60vw) translateY(calc(var(--drift, 4px) * -1)); }
  100% { transform: translateX(160vw) translateY(var(--drift, 4px)); }
`;

/* 레이어: 헤더 아래에 붙고, 높이는 '벨트'만 (예: 120px) */
const BeltLayer = styled.div`
  position: ${({ $fixed }) => ($fixed ? "fixed" : "absolute")};
  left: 0; right: 0;
  top: ${({ $top }) => ($top ?? 0)}px;     /* 헤더 높이 */
  height: ${({ $h }) => `${$h || 120}px`}; /* 구름 벨트 높이 */
  z-index: ${({ $z }) => $z ?? 1};
  pointer-events: none;
  /* 벨트 밖은 잘라서 보이지 않게 */
  overflow: hidden;
`;

/* 구름 스프라이트: 벨트의 '아래 끝자락'에 붙여서 윗부분만 보이게 마스크 */
const Cloud = styled.img`
  position: absolute;
  bottom: -40px;                        /* 구름을 벨트 하단 바깥에 두고 윗부분만 노출 */
  left: 0;
  will-change: transform;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.06));

  /* 핵심: 구름의 윗부분만 보이게 마스크 처리 (하단은 투명) */
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0 55%, rgba(0,0,0,0) 70%);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0 55%, rgba(0,0,0,0) 70%);

  animation: ${moveX} linear infinite;
  animation-duration: ${({ $dur }) => `${$dur || 48}s`};
  animation-delay: ${({ $delay }) => `${$delay || 0}s`};
  ${({ $scale }) => $scale && css`transform: scale(${$scale});`}
  ${({ $alpha }) => $alpha != null && css`opacity: ${$alpha};`}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;

export default function CloudLayer({
    top = 64,        // 보통 헤더 높이
    height = 120,    // 벨트(구름 보이는 높이)
    z = 1,
    drift = "4px",
    fixed = false,   // true면 뷰포트 고정
}) {
    const items = [
        // src, scale, alpha, duration, delay
        { src: cloud1, scale: 1.10, alpha: 0.95, dur: 60, delay: 0 },
        { src: cloud2, scale: 0.95, alpha: 0.90, dur: 48, delay: 8 },
        { src: cloud3, scale: 0.85, alpha: 0.92, dur: 40, delay: 16 },
        { src: cloud2, scale: 1.05, alpha: 0.88, dur: 54, delay: 24 },
        { src: cloud3, scale: 0.90, alpha: 0.90, dur: 42, delay: 32 },
    ];

    return (
        <BeltLayer $top={top} $h={height} $z={z} $fixed={fixed} style={{ '--drift': drift }}>
            {items.map((c, i) => (
                <Cloud
                    key={i}
                    src={c.src}
                    alt=""
                    $scale={c.scale}
                    $alpha={c.alpha}
                    $dur={c.dur}
                    $delay={c.delay}
                    style={{ left: 0 }}
                />
            ))}
        </BeltLayer>
    );
}
