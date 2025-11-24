// src/components/TopPatternBg.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";


const Layer = styled.div`
  position: absolute;
  inset: 0 auto auto 0;    /* top: 0; left: 0 */
  width: 100%;
  height: ${({ $h }) => `${$h || 640}px`}; /* 헤더+히어로 높이만큼만 표시 */
  z-index: 0;               /* 콘텐츠(헤더/히어로) 아래 레이어 */
  pointer-events: none;     /* 배경 클릭 방해 금지 */
  background-color: #f4682d; /* 패턴 비는 곳 기본 바탕(피그마 톤 근사) */
  background-repeat: repeat;
  background-position: center top;
  background-size: auto;    /* 패턴 원본 픽셀 유지 */
`;

export default function TopPatternBg({ height = 640 }) {
    return <Layer $h={height} />;
}
