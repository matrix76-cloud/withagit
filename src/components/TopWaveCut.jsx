// src/components/TopWaveCut.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";

/**
 * TopWaveCut
 * - 상단 단색 배경 + 하단을 '구름 형상'으로 잘라내는 레이어
 * - 이미지/PNG/SVG 파일 없이 CSS 마스크만 사용
 *
 * props
 *  - height: 단색 영역 높이(px)
 *  - color:  단색 컬러
 *  - waveHeight: 물결/구름 둥근 반지름(px) — 값이 커질수록 둥글게
 *  - scallopGap: 구름 원 사이 간격(px)
 */
const Layer = styled.div`
  position: absolute;
  left: 0; right: 0; top: 0;
  height: ${({ $h }) => `${$h || 420}px`};
  z-index: 0;                /* 헤더 뒤/콘텐츠 아래 레이어로 쓰면 적절 */
  pointer-events: none;
  background: ${({ $color }) => $color || "#46A3FF"};

  /* ---- 핵심: 하단을 구름 형태로 컷팅하는 마스크 ---- */
  /* 원형이 연속된 스칼롭(scallop) 벨트로 아래쪽만 남기고 위는 가림 */
  --R: ${({ $wave }) => `${$wave || 140}px`};     /* 반지름 */
  --G: ${({ $gap }) => `${$gap || 24}px`};        /* 원 사이 간격 */

  /* 마스크는 '검정 = 보임', '투명 = 잘림' */
  -webkit-mask-image:
    radial-gradient( var(--R) at calc(  0% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 25% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 50% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 75% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc(100% + var(--R)) 100%, #000 98%, transparent 100%);
  -webkit-mask-size: calc(25% - var(--G)) var(--R);
  -webkit-mask-repeat: repeat-x;
  -webkit-mask-position: left calc(100% - var(--R));

          mask-image:
    radial-gradient( var(--R) at calc(  0% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 25% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 50% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc( 75% + var(--R)) 100%, #000 98%, transparent 100%),
    radial-gradient( var(--R) at calc(100% + var(--R)) 100%, #000 98%, transparent 100%);
  mask-size: calc(25% - var(--G)) var(--R);
  mask-repeat: repeat-x;
  mask-position: left calc(100% - var(--R));
`;

export default function TopWaveCut({
    height = 420,
    color = "#2FA8FF",    // 히어로 단색
    waveHeight = 180,     // 구름 곡률(원 반지름)
    scallopGap = 24,      // 원 사이 간격
}) {
    return <Layer $h={height} $color={color} $wave={waveHeight} $gap={scallopGap} />;
}
