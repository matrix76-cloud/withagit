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



// 세로는 조금 줄이고, 가로는 넓게
const HERO_H = "clamp(300px, 32vw, 400px)";

const Section = styled.section`
  position: relative;
  width: 100%;
  background: #fffcf4;
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

// 👉 가로폭을 더 넓게, 세로는 HERO_H와 맞춤
const SlideCard = styled.div`
  position: relative;
  flex: 0 0 clamp(380px, 46vw, 580px);
  height: ${HERO_H};
  border-radius: 32px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 20px 46px rgba(0,0,0,0.12)"
      : "0 10px 26px rgba(0,0,0,0.06)"};
  transform: ${({ $active }) =>
    $active ? "translateY(0) scale(1)" : "translateY(10px) scale(0.94)"};
  opacity: ${({ $active }) => ($active ? 1 : 0.38)};
  filter: ${({ $active }) => ($active ? "saturate(1)" : "saturate(0.7)")};
  transition: transform 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease,
    filter 0.4s ease;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  @media (max-width: 900px) {
    flex: 0 0 92%;
    height: clamp(260px, 60vw, 360px);
  }
`;

const SlideImg = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;       /* 카드 전체를 채우되 */
  object-position: center; /* 가운데 기준으로 아주 조금만 잘리도록 */
`;

const NavBar = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const NavCircleBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  outline: none;

  &:hover {
    background: #faf7ef;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const IndexText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #444444;
  min-width: 56px;
  text-align: center;
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

    const id = setInterval(
      () => setCur((prev) => (prev + 1) % total),
      3000
    );
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
            <NavCircleBtn type="button" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M14.71 6.71a1 1 0 0 1 0 1.41L11.83 11H19a1 1 0 0 1 0 2h-7.17l2.88 2.88a1 1 0 1 1-1.42 1.42l-4.59-4.6a1 1 0 0 1 0-1.4l4.59-4.6a1 1 0 0 1 1.42 0Z"
                />
              </svg>
            </NavCircleBtn>

            <IndexText>
              {cur + 1} / {total}
            </IndexText>

            <NavCircleBtn type="button" onClick={handleNext}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9.29 6.71a1 1 0 0 0 0 1.41L12.17 11H5a1 1 0 0 0 0 2h7.17l-2.88 2.88a1 1 0 1 0 1.42 1.42l-4.59-4.6a1 1 0 0 0 0-1.4l-4.59-4.6a1 1 0 0 0-1.42 0Z"
                />
              </svg>
            </NavCircleBtn>

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
