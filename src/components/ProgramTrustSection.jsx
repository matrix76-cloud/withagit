// src/components/ProgramTrustSection.jsx
/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import school from "../assets/icons/school.png";
import analytic from "../assets/icons/analytic.png";
import calendar from "../assets/icons/calendar.png";

/* ===== Tokens ===== */
const accent = "var(--color-accent, #F07A2A)";
const primary = "var(--color-primary, #2F6BFF)";
const navy = "#1A2B4C";

/* ===== Layout ===== */
const Section = styled.section`
  background: radial-gradient(1200px 600px at 50% -200px, #FFF0E8 0%, #FFF7F3 36%, #FFFDFC 68%, #FFFFFF 100%);
  padding: 56px 16px 88px;
  overflow-x: hidden;
  @media (min-width: 1024px){ padding: 80px 16px 112px; }
`;
const Wrap = styled.div`
  max-width: 1080px; margin: 0 auto; display: grid; gap: 28px; width: 100%;
`;

/* ===== Header ===== */
const Head = styled.header`
  text-align: center; display: grid; gap: 8px;
`;
const Title = styled.h2`
  margin: 0; color: ${navy}; font-weight: 800;
  letter-spacing: -0.3px; line-height: 1.22;
  font-size: clamp(22px, 3.2vw, 32px);
`;
const Sub = styled.p`
  margin: 0 auto; color: #6b7280; font-size: clamp(12px, 1.5vw, 15px);
  max-width: 720px;
`;

/* ===== Feature Cards (Top 3) ===== */
/* 모바일/태블릿 100% → 데스크톱부터 70% 폭으로 축소 + 가운데 정렬 */
const Features = styled.div`
  width: 100%;
  display: grid; gap: 14px;
  grid-template-columns: 1fr;



  @media (min-width: 960px){
    width: 70%;
    margin: 0 auto;                 /* 가운데 정렬 */
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
`;

const FeatureCard = styled.div`

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  background: #fff; border-radius: 18px;
  padding: 22px;                     /* 높이 여유 */
  min-height: 210px;                 /* ✅ 더 커져도 되는 요구 반영 */
  border: 1px solid color-mix(in srgb, ${accent} 18%, transparent);
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
   gap: 10px; align-content: start;
  transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease;
  &:hover{ transform: translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,.08); border-color: color-mix(in srgb, ${accent} 28%, transparent); }
`;
const FIcon = styled.img` width:84px; height:84px; object-fit:contain; display:block; `;
const FTitle = styled.h3` margin:0; color:${navy}; font-weight:800; font-size:16px; letter-spacing:-0.2px; `;
const FDesc = styled.p` margin:0; color:#4b5563; line-height:1.65; font-size:13px; `;

/* ===== Carousel ===== */
const CarouselWrap = styled.div`
  position: relative; margin-top: 6px; overflow-x: hidden;
`;
const Viewport = styled.div`
  position: relative; overflow: hidden; border-radius: 16px; width: 100%;
`;
const Track = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: ${({ $colWidth }) => $colWidth};
  gap: 14px;
  transform: ${({ $offset }) => `translateX(-${$offset}px)`};
  transition: transform .6s ease; will-change: transform;
`;
const Card = styled.article`
  background: #fff; border-radius: 16px; padding: 16px 16px 14px;
  border: 1px solid #eef1f4; box-shadow: 0 10px 24px rgba(0,0,0,.06);
  display: grid; gap: 10px; min-height: 168px;
`;

const Badge = styled.span`
  align-self: start; justify-self: start; font-size: 11px; font-weight: 700; letter-spacing: .2px;
  color: ${accent}; background: color-mix(in srgb, ${accent} 10%, #fff);
  padding: 5px 9px; border-radius: 999px; border: 1px solid color-mix(in srgb, ${accent} 24%, transparent);
`;
const Stars = styled.div` color:#f59e0b; font-size:15px; letter-spacing:.8px; `;
const Text = styled.p` margin:0; color:#374151; line-height:1.6; font-size:13.5px; `;
const UserRow = styled.div` display:grid; grid-template-columns:34px 1fr auto; gap:9px; align-items:center; `;
const Avatar = styled.div` width:34px; height:34px; border-radius:50%; background:#eef2ff; display:grid; place-items:center; color:${primary}; font-weight:800; `;
const UserMeta = styled.div` color:#6b7280; font-size:11.5px; line-height:1.35; strong{ color:#111827; font-size:12.5px; } `;
const Quote = styled.button` width:32px; height:32px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; color:#9aa2b1; display:grid; place-items:center; cursor:default; `;

/* Arrows */
const ArrowBtn = styled.button`
  position: absolute; top: calc(50% - 16px);
  ${({ $dir }) => ($dir === 'prev' ? css`left: 6px;` : css`right: 6px;`)}
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid #e5e7eb; background: #fff; color: #111;
  box-shadow: 0 8px 20px rgba(0,0,0,.07);
  display: grid; place-items: center; cursor: pointer;
  transition: transform .05s, filter .15s; z-index: 2;
  &:hover{ filter: brightness(.96); } &:active{ transform: translateY(1px); }
  @media (max-width: 480px){ display: none; }
`;

const Dots = styled.div` display:flex; gap:7px; justify-content:center; margin-top:12px; `;
const Dot = styled.button`
  width:7px; height:7px; border-radius:999px; border:0; cursor:pointer;
  background:${({ $active }) => ($active ? accent : "#e5e7eb")};
  transition: transform .15s; ${({ $active }) => $active && css`transform: scale(1.15);`}
`;

/* ===== Helpers ===== */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const makeStars = (n = 5) => "★★★★★☆☆☆☆☆".slice(0, clamp(n, 0, 5));

/* ===== Component ===== */
export default function ProgramTrustSection({
    heading = "학부모가 믿고 맡길 수 있는 프로그램",
    subheading = "홍보문구 텍스트 홍보문구 텍스트 홍보문구 텍스트",
    features = [
        { icon: school, title: "학교 근처 맞춤형 서비스", desc: "아이의 학교/가정 반경 내에서 픽업부터 돌봄까지 연결된 서비스를 제공합니다." },
        { icon: calendar, title: "실시간 예약과 결제", desc: "앱에서 이용시간 예약·결제·픽업 신청까지 한 번에 처리됩니다." },
        { icon: analytic, title: "데이터 기반 관리", desc: "아이별 이용 이력과 활동 패턴 분석으로 효율적인 인력 배치와 공간 운영을 지원합니다." },
    ],
    testimonials = _buildDummyTestimonials(),
    autoplayMs = 3500
}) {
    const viewportRef = useRef(null);
    const [cardWidth, setCardWidth] = useState(320);
    const [index, setIndex] = useState(0);
    const total = testimonials.length;

    /* layout calc */
    useEffect(() => {
        const calc = () => {
            const w = window.innerWidth;
            const vp = viewportRef.current;
            const vpw = vp ? vp.clientWidth : Math.min(1080, w - 32);
            const c = w >= 1200 ? 3 : (w >= 900 ? 2 : 1);
            const gap = 14;
            const cw = Math.floor((vpw - gap * (c - 1)) / c);
            setCardWidth(Math.max(220, cw));
        };
        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);

    /* autoplay (pause on hover / out of view / reduced motion / blur) */
    const [hover, setHover] = useState(false);
    const [inview, setInview] = useState(true);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setInview(e.isIntersecting), { threshold: 0.2 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (reduce) return;
        let t;
        const tick = () => { if (!hover && inview && document.visibilityState === "visible") setIndex((i) => (i + 1) % Math.max(total, 1)); };
        t = setInterval(tick, autoplayMs);
        const onVis = () => { clearInterval(t); t = setInterval(tick, autoplayMs); };
        document.addEventListener("visibilitychange", onVis);
        return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
    }, [hover, inview, autoplayMs, total]);

    const offset = (cardWidth + 14) * index;
    const go = (dir) => setIndex((i) => (dir === "prev" ? (i - 1 + total) % total : (i + 1) % total));

    return (
        <Section>
            <Wrap>
                <Head>
                    <Title>{heading}</Title>
                    {subheading && <Sub>{subheading}</Sub>}
                </Head>

                {/* Features — 폭 70% (>=960px), 가운데 정렬 */}
                <Features>
                    {features.map((f, i) => (
                        <FeatureCard key={i}>
                            {f.icon && <FIcon src={f.icon} alt="" loading="lazy" />}
                            <FTitle>{f.title}</FTitle>
                            <FDesc>{f.desc}</FDesc>
                        </FeatureCard>
                    ))}
                </Features>
{/* 
                <CarouselWrap
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <Viewport ref={viewportRef}>
                        <Track $colWidth={`${cardWidth}px`} $offset={offset}>
                            {testimonials.map((t, i) => (
                                <Card key={i} aria-label={`testimonial-${i + 1}`}>
                                    {t.badge && <Badge>{t.badge}</Badge>}
                                    <Stars aria-hidden="true">{makeStars(t.stars)}</Stars>
                                    <Text>{t.text}</Text>
                                    <UserRow>
                                        <Avatar>{initials(t.user?.name || "G")}</Avatar>
                                        <UserMeta>
                                            <strong>{t.user?.name || "고객"}</strong><br />
                                            {t.user?.relation || ""}
                                        </UserMeta>
                                        <Quote aria-hidden="true">❝</Quote>
                                    </UserRow>
                                </Card>
                            ))}
                        </Track>

                        <ArrowBtn aria-label="이전" $dir="prev" onClick={() => go("prev")}>‹</ArrowBtn>
                        <ArrowBtn aria-label="다음" $dir="next" onClick={() => go("next")}>›</ArrowBtn>
                    </Viewport>

                    <Dots>
                        {Array.from({ length: Math.max(total, 1) }).slice(0, total).map((_, iDot) => (
                            <Dot key={iDot} $active={iDot === index} onClick={() => setIndex(iDot)} />
                        ))}
                    </Dots>
                </CarouselWrap> */}
            </Wrap>
        </Section>
    );
}

/* ===== Dummy data builder ===== */
function _buildDummyTestimonials() {
    const base = [
        "단순히 아이를 맡기는 게 아니라, 놀이와 대화로 아이의 하루가 더 즐거워지는 돌봄이라 믿고 이용하고 있어요. 최고입니다.",
        "출퇴근마다 걱정이 많았는데, 실시간 알림이 오니까 아이가 안전하게 픽업됐는지 바로 확인할 수 있어서 마음이 놓여요.",
        "하루 단위로도 신청할 수 있어서, 회의나 야근이 있는 날엔 정말 유용해요. 맞벌이 부부에게 필수 서비스 같아요.",
        "선생님이 아이 성향을 잘 파악해 주셔서, 적응도 빨랐고 집에서도 긍정적인 변화가 느껴졌습니다.",
        "앱으로 예약/결제까지 한 번에 끝나서 너무 편해요. 사용성도 깔끔하고 알림이 확실해요.",
        "동선/시간표가 한눈에 보여서 스케줄 관리가 쉬워졌어요. 사진 공유도 바로바로 와서 좋습니다.",
        "형제 할인 덕분에 둘째도 함께 맡길 수 있었고, 비용 부담이 줄었어요. 감사합니다!",
        "돌봄 선생님이 정말 다정하세요. 아이가 다음에도 또 가고 싶다고 할 정도로 만족도가 높아요.",
        "필요한 날만 쓰는 시간권도 좋아요. 유연해서 우리 집 상황에 딱 맞아요.",
        "지역 기반 돌봄이라 이동 시간이 짧고, 픽업이 매끄러워서 믿고 맡기게 됩니다."
    ];
    const people = [
        { name: "김현주 님", relation: "6세 자녀 | 도곡센터" },
        { name: "박지훈 님", relation: "7세 자녀 | 프리랜서" },
        { name: "이소라 님", relation: "5세 자녀 | 교사" },
        { name: "정우성 님", relation: "8세 자녀 | 개발자" },
        { name: "한예린 님", relation: "6세 자녀 | 맞벌이" },
        { name: "최민수 님", relation: "7세 자녀 | 마케터" },
        { name: "박선미 님", relation: "6세 자녀 | 간호사" },
        { name: "이건우 님", relation: "5세 자녀 | 디자이너" },
        { name: "오유진 님", relation: "7세 자녀 | 자영업" },
        { name: "장성민 님", relation: "6세 자녀 | 연구원" },
    ];
    return base.map((text, i) => ({
        badge: "시간권",
        stars: 5,
        text,
        user: people[i % people.length],
    }));
}

function initials(name) {
    try {
        const parts = name.replace(/\s+/g, " ").trim().split(" ");
        if (parts.length === 1) return parts[0].slice(0, 1);
        return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
    } catch { return "G"; }
}
