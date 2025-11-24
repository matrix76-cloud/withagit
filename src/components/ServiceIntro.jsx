// src/components/ServiceIntro.jsx
// ...상단 import/useInView/스타일 동일 (생략 없음)
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
// import Carousel from "./common/Carousel"; // ❌ 슬라이드 제거

const IMAGES = ["/images/banner1.jpg", "/images/banner2.jpg", "/images/banner3.jpg", "/images/banner4.jpg"];

function useInView(options = { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }) {
    const ref = useRef(null); const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } }, options);
        io.observe(el); return () => io.disconnect();
    }, [options]);
    return { ref, inView };
}

const Section = styled.section`background:#F7FAFF;`;
const Wrap = styled.div`
  max-width:${({ theme }) => theme?.sizes?.container || "1120px"};
  margin:50px auto; padding:56px 16px 56px;
  display:grid; grid-template-rows:auto auto; row-gap:18px;
  @media (max-width:980px){ padding:40px 16px 12px; row-gap:16px;}
`;
const Headline = styled.h2`
  grid-column:1/-1;
  color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-family: 'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
  font-size:clamp(22px,3vw,30px);
  font-weight:800;
  line-height:1.42;
  letter-spacing:-.2px;
  word-break:keep-all;
  text-align:center;
  margin:0;
`;

/* ▶ 사진 더 크게: 1.25 : 0.75 */
const Row = styled.div`
  display:grid; grid-template-columns: 1.25fr 0.75fr; column-gap:28px; align-items:start;
  @media (max-width:980px){ grid-template-columns:1fr; row-gap:14px; }
`;

/* ✅ Hover Zoom 유지, 오버레이는 기본 노출 */
const PhotoBox = styled.div`
  position: relative;               /* ⬅️ 오버레이 absolute 기준 */
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
  aspect-ratio: 4 / 5;
  max-height: clamp(260px, 38vw, 480px);
  width: 100%;

  img{
    width:100%; height:100%;
    object-fit:cover; display:block;
    transition: transform 420ms ease; will-change: transform; transform-origin:center;
  }
  &:hover img, &:focus-within img { transform: scale(1.03); }
`;

/* ▶ 오버레이(항상 보임) */
const Overlay = styled.div`
  position: absolute; left: 0; right: 0; bottom: 0;
  display: grid; align-content: end;
  padding: 16px;
  height: 40%;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.68) 100%);
  opacity: 1;                        /* ⬅️ 기본 노출 */
  transform: none;                   /* ⬅️ 기본 노출 */
  pointer-events: none;

  @media (max-width: 640px) {
    height: 42%;
  }
`;
const Badge = styled.span`
  display: inline-grid; place-items: center;
  height: 18px; padding: 0 8px; border-radius: 999px;
  background: rgba(255,255,255,.92);
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-size: 11px; font-weight: 800;
  margin-bottom: 8px; width: max-content;
`;
const CapTitle = styled.div`
  color: #fff; font-weight: 900;
  font-size: clamp(16px, 1.7vw, 20px);
  letter-spacing: -0.2px; line-height: 1.2;
`;
const CapSub = styled.div`
  margin-top: 4px; color: rgba(255,255,255,.9);
  font-size: 12px; line-height: 1.35;
`;

/* ▶ 카드 열을 더 슬림하게 */
const CardsCol = styled.div`
  max-width:420px;
  justify-self:center;
  display:flex; flex-direction:column; gap:24px;
  @media (max-width:980px){ max-width:none; }
`;

/* ▶ 카드 비주얼 업그레이드 */
const Card = styled(Link)`
  display: grid;
  grid-template-columns: 56px 1fr;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  height: 125px;
  box-shadow: 0 8px 18px rgba(0,0,0,.05);
  border: 1px solid rgba(26,43,76,.06);
  transform: translateX(${({ $visible }) => $visible ? "0" : "24px"});
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transition: transform 520ms cubic-bezier(.2,.65,.2,1) ${({ $delay = 0 }) => $delay}ms,
              opacity 520ms ease ${({ $delay = 0 }) => $delay}ms,
              box-shadow .2s ease, border-color .2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 22px rgba(0,0,0,.07);
    border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  }
`;
const Icon = styled.span`
  width:52px; height:52px;
  border-radius:50%;
  display:grid; place-items:center;
  font-size:22px; font-weight:900;
  color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  background:${({ $bg }) => $bg || "#FFE38A"};
`;

/* Pretendard 기준 타이포 스케일 */
const Txt = styled.div`
  display:grid; gap:6px; text-align:left;
  font-family: 'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
`;
const CardTitle = styled.strong`
  font-size:20px;
  font-weight:800;
  letter-spacing:-.1px;
  line-height:1.25;
`;
const CardDesc = styled.span`
  font-size:15px;
  opacity:.82;
  line-height:1.55;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
`;

/* 텍스트 메타 (이미지 인덱스에 대응) */
const ALTS = ["공간 전경", "로비", "놀이공간", "안전게이트"];
const TITLES = ALTS;                                // 타이틀은 ALTS 재사용
const SUBS = ["HIGHLIGHT", "RECEPTION", "PLAY", "SAFETY"]; // 뱃지 텍스트

export default function ServiceIntro() {
    const { ref: colRef, inView } = useInView({ threshold: 0.2, rootMargin: "0px 0px -12% 0px" });

    // ▶ 슬라이드 대신 "컷 전환" 인덱스만 변경
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % IMAGES.length), 3000);
        return () => clearInterval(t);
    }, []);

    return (
        <Section>
            <Wrap>
                <Headline>
                    안전하고 신뢰할 수 있는<br />아이 돌봄 서비스의 특별함을 경험해보세요
                </Headline>

                <Row>
                    {/* 좌: 사진(컷 전환) + 기본 노출 오버레이 */}
                    <PhotoBox aria-label="서비스 소개 이미지" tabIndex={0}>
                        <img src={IMAGES[idx]} alt={ALTS[idx]} />
                        <Overlay>
                            <Badge>{SUBS[idx]}</Badge>
                            <CapTitle>{TITLES[idx]}</CapTitle>
                            <CapSub>withagit 공간 스냅샷</CapSub>
                        </Overlay>
                    </PhotoBox>

                    {/* 우: in-view 스태거 카드 */}
                    <CardsCol ref={colRef}>
                        <Card to="/about/safety" $visible={inView} $delay={0}>
                            <Icon $bg="#FFE38A">🛡️</Icon>
                            <Txt>
                                <CardTitle>안전 보장</CardTitle>
                                <CardDesc>신원·자격 검증과 실시간 안심 시스템으로 아이의 하루를 안전하게 지켜드립니다.</CardDesc>
                            </Txt>
                        </Card>

                        <Card to="/about/time" $visible={inView} $delay={100}>
                            <Icon $bg="#EAF4FF">🕒</Icon>
                            <Txt>
                                <CardTitle>유연한 시간</CardTitle>
                                <CardDesc>필요할 때 원하는 시간만—시간제·야간·주말까지 가족 일정에 맞춰 편하게 이용하세요.</CardDesc>
                            </Txt>
                        </Card>

                        <Card to="/about/care" $visible={inView} $delay={200}>
                            <Icon $bg="#E9FFF3">💛</Icon>
                            <Txt>
                                <CardTitle>맞춤 케어</CardTitle>
                                <CardDesc>아이의 성향과 발달 단계에 맞춘 개별화 케어로 즐겁고 의미 있는 시간을 만들어드립니다.</CardDesc>
                            </Txt>
                        </Card>
                    </CardsCol>
                </Row>
            </Wrap>
        </Section>
    );
}
