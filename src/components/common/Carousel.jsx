import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio || '21 / 9'};
  max-height: ${({ $maxH }) => $maxH || 'none'};
  overflow: hidden; user-select: none;
  background: #0b1626;
`;

const Track = styled.div`
  height: 100%;
  display: flex;
  transition: transform 420ms ease;
  transform: translateX(${({ $idx }) => `-${$idx * 100}%`});
`;

const Slide = styled.div`
  flex: 0 0 100%; height: 100%; position: relative;
  img {
    width: 100%; height: 100%; display: block;
    object-fit: ${({ $fit }) => $fit || 'contain'};
    object-position: center;
  }
`;

const Arrow = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%);
  ${({ $dir }) => ($dir === 'left' ? 'left: 10px' : 'right: 10px')};
  width: 38px; height: 38px; border-radius: 50%; border:0; cursor: pointer;
  display: grid; place-items: center;
  background: rgba(0,0,0,.38); color:#fff; font-size: 0; opacity: 0; transition: opacity .2s;
  &:after { content: '${({ $dir }) => ($dir === "left" ? "◀" : "▶")}'; font-size: 14px; }
  ${Wrap}:hover & { opacity: 1; }
`;

/* ▶ 작은 원형 점 (우측 하단 정렬) */
const Dots = styled.div`
  position: absolute; right: 16px; bottom: 16px;
  display: flex; gap: 8px; padding: 6px 8px;
  border-radius: 999px; backdrop-filter: blur(4px);
`;
const Dot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  border: 2px solid #fff;
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  opacity: ${({ $active }) => ($active ? 1 : .85)};
  cursor: pointer;
  transition: opacity .15s, background-color .15s, border-color .15s;
  &:hover { opacity: 1; border-color: #fff; }
`;

export default function Carousel({
  slides = [],
  interval = 4000,
  aspectRatio = '21 / 9',
  maxH,
  startIndex = 0,
  fit = 'contain',
  insideControls = true,
  pauseOnHover = true,
}) {
  const [idx, setIdx] = useState(startIndex);
  const len = slides.length;
  const safeIdx = useMemo(() => (len ? idx % len : 0), [idx, len]);

  const timerRef = useRef(null);
  const touchRef = useRef({ x: 0, dragging: false });

  const to = useCallback((i) => setIdx((p) => (len ? (i + len) % len : p)), [len]);
  const next = useCallback(() => to(safeIdx + 1), [to, safeIdx]);
  const prev = useCallback(() => to(safeIdx - 1), [to, safeIdx]);

  useEffect(() => {
    if (!len) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [len, interval, next]);

  const pause = () => pauseOnHover && clearInterval(timerRef.current);
  const resume = () => { if (pauseOnHover && len) timerRef.current = setInterval(next, interval); };

  const onTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, dragging: true }; pause(); };
  const onTouchMove = (e) => {
    if (!touchRef.current.dragging) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); touchRef.current.dragging = false; }
  };
  const onTouchEnd = () => { touchRef.current.dragging = false; resume(); };

  if (!len) return null;

  return (
    <Wrap
      $ratio={aspectRatio}
      $maxH={maxH}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region" aria-roledescription="carousel" aria-label="배너 슬라이더"
    >
      <Track $idx={safeIdx}>
        {slides.map((src, i) => (
          <Slide key={i} $fit={fit} aria-roledescription="slide" aria-label={`${i + 1} / ${len}`}>
            <img src={src} alt="" draggable={false} />
          </Slide>
        ))}
      </Track>

      {insideControls && (
        <>
          <Arrow $dir="left" onClick={prev} aria-label="이전 배너" />
          <Arrow $dir="right" onClick={next} aria-label="다음 배너" />
          <Dots role="tablist" aria-label="배너 이동">
            {slides.map((_, i) => (
              <Dot
                key={i}
                $active={i === safeIdx}
                onClick={() => to(i)}
                aria-label={`${i + 1}번째 배너로 이동`}
              />
            ))}
          </Dots>
        </>
      )}
    </Wrap>
  );
}
