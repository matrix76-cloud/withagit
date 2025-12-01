/* eslint-disable */
// src/components/HomeHero.jsx
// 홈 히어로 — 로컬 배너 이미지 슬라이더 (서버/DB 사용 안 함)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import banner1 from "../assets/Banner/Banner1.png";
import banner2 from "../assets/Banner/Banner2.png";
import banner3 from "../assets/Banner/Banner3.png";
import banner4 from "../assets/Banner/Banner4.png";
import banner5 from "../assets/Banner/Banner5.png";

// 🔹 배너를 살짝 더 크게: 세로 높이 한 단계 업
const HERO_H = "clamp(320px, 36vw, 440px)";

const Section = styled.section`
  position: relative;
  width: 100%;
  background: #FFFCF4;
  padding: 40px 0 56px;

  @media (max-width: 960px) {
    padding: 24px 0 40px;
  }
`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 960px) {
    padding: 0 16px;
  }
`;

const CarouselWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Window = styled.div`
  width: 100%;
  overflow: visible;
`;

const SlidesRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 24px;

  @media (max-width: 900px) {
    gap: 14px;
  }
`;

// 👉 가로폭/세로 모두 살짝 키운 카드
const SlideCard = styled.div`
  position: relative;
  flex: 0 0 clamp(420px, 52vw, 640px);
  height: ${HERO_H};
  border-radius: 32px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 20px 46px rgba(0, 0, 0, 0.12)"
      : "0 10px 26px rgba(0, 0, 0, 0.06)"};
  transform: ${({ $active }) =>
    $active ? "translateY(0) scale(1)" : "translateY(10px) scale(0.94)"};
  opacity: ${({ $active }) => ($active ? 1 : 0.38)};
  filter: ${({ $active }) => ($active ? "saturate(1)" : "saturate(0.7)")};
  transition: transform 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease,
    filter 0.4s ease;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  @media (max-width: 900px) {
    flex: 0 0 96%;
    height: clamp(240px, 70vw, 400px);
  }
`;

const SlideImg = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-position: center;
`;

/* ===== 하단 컨트롤 바 ===== */

const NavBar = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;

  @media (max-width: 960px) {
    gap: 12px;
  }
`;

const NavCircleBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1.5px solid #dedede;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  outline: none;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: #faf7ef;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 960px) {
    width: 36px;
    height: 36px;
  }

  svg {
    width: 16px;
    height: 16px;

    @media (max-width: 960px) {
      width: 14px;
      height: 14px;
    }
  }
`;

/* 👉 가운데 인덱스 텍스트 (1 / 3) — 피그마 느낌 */
const IndexText = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #222222;

  @media (max-width: 960px) {
    font-size: 14px;
  }

  span:nth-child(2) {
    color: #b0b0b0;
    display: inline-block;
    transform: rotate(-10deg);
  }

  span:nth-child(3) {
    color: #9a9a9a;
  }
`;

const LOCAL_BANNERS = [
  { id: "home-1", image: banner1, link: null },
  { id: "home-2", image: banner2, link: null },
  { id: "home-3", image: banner3, link: null },
  { id: "home-4", image: banner4, link: null },
  { id: "home-5", image: banner5, link: null },
];

function getVisibleIndices(cur, total) {
  if (total === 0) return [];
  if (total === 1) return [0];
  if (total === 2) return [0, 1];
  const prev = (cur - 1 + total) % total;
  const next = (cur + 1) % total;
  return [prev, cur, next];
}

export default function HomeHero() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const nav = useNavigate();

  const items = LOCAL_BANNERS.filter((b) => !!b?.image);
  const total = items.length || 1;

  useEffect(() => {
    if (total <= 1) return;
    if (paused) return;

    const id = setInterval(() => {
      setCur((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(id);
  }, [total, paused]);

  const visible = getVisibleIndices(cur, total);

  const handleBannerClick = (b) => {
    if (!b || !b.link) return;
    const href = String(b.link);
    if (/^https?:\/\//i.test(href)) {
      window.location.href = href;
      return;
    }
    nav(href);
  };

  const handlePrev = () => {
    setCur((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCur((prev) => (prev + 1) % total);
  };

  const togglePause = () => {
    setPaused((p) => !p);
  };

  return (
    <Section>
      <Container>
        <CarouselWrap
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Window>
            <SlidesRow>
              {visible.map((idx) => {
                const b = items[idx];
                const isActive = idx === cur;
                return (
                  <SlideCard
                    key={b.id || idx}
                    $active={isActive}
                    $clickable={!!b.link}
                    onClick={() => handleBannerClick(b)}
                  >
                    <SlideImg src={b.image} alt={`메인 배너 ${idx + 1}`} />
                  </SlideCard>
                );
              })}
            </SlidesRow>
          </Window>

          <NavBar>
            {/* 이전 버튼 — SVG 화살표 */}
            <NavCircleBtn type="button" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15.5 5.5a1 1 0 0 1 0 1.4L11.4 11.9l4.1 5a1 1 0 1 1-1.5 1.3l-4.7-5.7a1 1 0 0 1 0-1.3l4.7-5.7a1 1 0 0 1 1.5 0z"
                />
              </svg>
            </NavCircleBtn>

            {/* 가운데 인덱스 텍스트 */}
            <IndexText>
              <span>{cur + 1}</span>
              <span>/</span>
              <span>{total}</span>
            </IndexText>

            {/* 다음 버튼 — SVG 화살표 */}
            <NavCircleBtn type="button" onClick={handleNext}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8.5 5.5a1 1 0 0 0 0 1.4l4.1 5-4.1 5a1 1 0 1 0 1.5 1.3l4.7-5.7a1 1 0 0 0 0-1.3l-4.7-5.7a1 1 0 0 0-1.5 0z"
                />
              </svg>
            </NavCircleBtn>

            {/* 재생/일시정지 버튼 */}
            <NavCircleBtn type="button" onClick={togglePause}>
              {paused ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M7 5h4v14H7zm6 0h4v14h-4z" />
                </svg>
              )}
            </NavCircleBtn>
          </NavBar>
        </CarouselWrap>
      </Container>
    </Section>
  );
}
