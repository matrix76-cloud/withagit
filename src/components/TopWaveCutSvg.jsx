// src/components/TopWaveCutSvg.jsx
/* eslint-disable */
import React, { useId } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  position: absolute;
  left: 0; right: 0; top: 0;
  height: ${({ $h }) => `${$h}px`};
  z-index: ${({ $z }) => $z ?? 0};
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    svg .anim-move { display: none; }
  }
`;

/**
 * props
 * - height     : 단색 높이(px)
 * - color      : 단색 색상
 * - radius     : 1열 반지름(px) (촘촘: 110~140 권장)
 * - gap        : 원 사이 간격(px) (권장 0)
 * - rows       : 1|2 (2 = 스태거)
 * - depthFrac  : 2열이 위로 얼마나 올라올지(0~1, 기본 0.35)  ← 너무 깊으면 끝이 뾰족해짐
 * - align      : 'edge' | 'mid' (기본 mid: 양끝이 반원으로 매끈)
 * - z, motion, speedSec, dir : 동일
 */
export default function TopWaveCutSvg({
    height = 540,
    color = "#f4682d",
    radius = 130,
    gap = 0,
    rows = 2,
    depthFrac = 0.35,      // ← 0.35~0.4 추천 (기존 0.45보다 얕게)
    align = "mid",         // ← 양끝 반원 정렬(끝 뾰족 방지)
    z = 0,
    motion = true,
    speedSec = 22,
    dir = "ltr",
}) {
    const uid = useId().replace(/:/g, "");
    const step = Math.max(2 * radius - gap, 1);
    const baseX = align === "mid" ? -step / 2 : 0;     // ← 양끝 반원 배치
    const fromX = 0;
    const toX = dir === "rtl" ? -step : step;

    // 행별 Y (두 번째 행은 위쪽에 살짝 겹치게)
    const rowY = (i) => height - radius - (i === 0 ? 0 : Math.floor(radius * depthFrac));

    return (
        <Wrap $h={height} $z={z} aria-hidden>
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
                role="img"
            >
                <defs>
                    {/* 1행 패턴 */}
                    <pattern
                        id={`scallop-a-${uid}`}
                        patternUnits="userSpaceOnUse"
                        width={step}
                        height={radius}
                        x={baseX}
                        y={rowY(0)}
                    >
                        <circle cx={step / 2} cy={radius} r={radius} fill="black" />
                        {motion && (
                            <animateTransform
                                className="anim-move"
                                attributeName="patternTransform"
                                type="translate"
                                from={`${fromX} 0`}
                                to={`${toX} 0`}
                                dur={`${speedSec}s`}
                                repeatCount="indefinite"
                            />
                        )}
                    </pattern>

                    {/* 2행 패턴(스태거) */}
                    {rows > 1 && (
                        <pattern
                            id={`scallop-b-${uid}`}
                            patternUnits="userSpaceOnUse"
                            width={step}
                            height={radius}
                            x={baseX + step / 2}           // ← 반 칸 어긋나게
                            y={rowY(1)}
                        >
                            <circle cx={step / 2} cy={radius} r={radius} fill="black" />
                            {motion && (
                                <animateTransform
                                    className="anim-move"
                                    attributeName="patternTransform"
                                    type="translate"
                                    from={`${fromX} 0`}
                                    to={`${toX} 0`}
                                    dur={`${speedSec}s`}
                                    repeatCount="indefinite"
                                />
                            )}
                        </pattern>
                    )}

                    {/* 마스크 */}
                    <mask id={`mask-${uid}`}>
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect x="0" y={rowY(0)} width="100%" height={radius} fill={`url(#scallop-a-${uid})`} />
                        {rows > 1 && (
                            <rect x="0" y={rowY(1)} width="100%" height={radius} fill={`url(#scallop-b-${uid})`} />
                        )}
                    </mask>
                </defs>

                <rect x="0" y="0" width="100%" height="100%" fill={color} mask={`url(#mask-${uid})`} />
            </svg>
        </Wrap>
    );
}
