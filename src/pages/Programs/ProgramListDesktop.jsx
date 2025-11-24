// src/pages/programs/ProgramListDesktop.jsx
/* eslint-disable */
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";

/* ===== 색상 토큰 ===== */
const color = {
    bg: "#F7F8FA",
    card: "#FFFFFF",
    text: "#111827",
    sub: "#6B7280",
    border: "#E5E7EB",
    primary: "#4F8AFE",
    primarySoft: "#E9F1FF",
    accent: "#FFB020",
    danger: "#EF4444",
    success: "#10B981",
};

/* ===== 목업 데이터 ===== */
const MOCK_PROGRAMS = [
    {
        id: "p1",
        title: "가을 숲 체험 교실",
        summary: "숲 해설사와 함께하는 자연놀이",
        type: "체험",
        region: "노원구",
        ageBand: "초1–3",
        price: 0,
        isFree: true,
        hot: true,
        lastFew: false,
        seatsLeft: 7,
        schedule: { days: ["토"], start: "10:00", end: "12:00" },
        thumbnail: "https://picsum.photos/seed/forest/960/540",
    },
    {
        id: "p2",
        title: "클레이 공방 원데이",
        summary: "나만의 컵 만들기(가족 동반 가능)",
        type: "공방",
        region: "송파구",
        ageBand: "5–7세",
        price: 25000,
        isFree: false,
        hot: false,
        lastFew: true,
        seatsLeft: 3,
        schedule: { days: ["토", "일"], start: "14:00", end: "16:00" },
        thumbnail: "https://picsum.photos/seed/clay/960/540",
    },
    {
        id: "p3",
        title: "주니어 캠프 – 자연과 친구",
        summary: "하룻밤 야외캠핑(안전지도 포함)",
        type: "캠프",
        region: "양평",
        ageBand: "초4–6",
        price: 69000,
        isFree: false,
        hot: true,
        lastFew: false,
        seatsLeft: 15,
        schedule: { days: ["토~일"], start: "13:00", end: "익일 11:00" },
        thumbnail: "https://picsum.photos/seed/camp/960/540",
    },
];

/* ===== 유틸 ===== */
const won = (n) => (n === 0 ? "무료" : `₩${n.toLocaleString()}`);

/* ===== 페이지 ===== */
export default function ProgramListDesktop() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 400);
        return () => clearInterval(t);
    }, []);

    return (
        <Page>
            <Wrap>
                <Hero>
                    <h1>프로그램 예약</h1>
                    <p>주말 체험부터 원데이 클래스까지, 한눈에 보고 바로 예약하세요.</p>
                </Hero>

                <Grid>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : MOCK_PROGRAMS.map((p) => (
                            <Card key={p.id} onClick={() => navigate(`/programs/${p.id}`)}>
                                <Thumb style={{ backgroundImage: `url(${p.thumbnail})` }} />
                                <Body>
                                    <Top>
                                        <Badges>
                                            {p.isFree && <Badge $type="success">무료</Badge>}
                                            {p.hot && <Badge $type="primary">인기</Badge>}
                                            {p.lastFew && <Badge $type="warn">마감임박</Badge>}
                                        </Badges>
                                        <Price>{won(p.price)}</Price>
                                    </Top>

                                    <Title>{p.title}</Title>
                                    <Summary>{p.summary}</Summary>

                                    <MetaRow>
                                        <Meta>{p.schedule.days.join("·")} | {p.schedule.start}–{p.schedule.end}</Meta>
                                        <SeatLeft $danger={p.seatsLeft <= 3}>
                                            {p.seatsLeft <= 3 ? `자리 ${p.seatsLeft}석 남음` : `잔여 ${p.seatsLeft}석`}
                                        </SeatLeft>
                                    </MetaRow>

                                    <Actions>
                                        <LinkBtn type="button" onClick={(e) => { e.stopPropagation(); navigate(`/programs/${p.id}`); }}>
                                            자세히
                                        </LinkBtn>
                                    </Actions>
                                </Body>
                            </Card>
                        ))}
                </Grid>
            </Wrap>
        </Page>
    );
}

/* ===== 스타일 ===== */
const Page = styled.main`
  min-height: 100vh;
  background: ${color.bg};
  color: ${color.text};
`;
const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 64px;
`;
const Hero = styled.header`
  background: ${color.card};
  border: 1px solid ${color.border};
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 16px;
  h1 { margin: 0; font-size: 24px; font-weight: 900; }
  p { margin: 6px 0 0; color: ${color.sub}; }
`;

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 1150px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 720px)  { grid-template-columns: 1fr; }
`;

const Card = styled.article`
  background: ${color.card};
  border: 1px solid ${color.border};
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform .06s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,0,0,.08); }
`;
const Thumb = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #eee center/cover no-repeat;
`;
const Body = styled.div`
  padding: 14px;
  display: grid;
  gap: 8px;
`;
const Top = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;
const Badges = styled.div` display: flex; gap: 6px; `;
const Badge = styled.span`
  font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 999px;
  ${({ $type }) => $type === "success" && css`background: #E9FAF3; color: ${color.success};`}
  ${({ $type }) => $type === "primary" && css`background: ${color.primarySoft}; color: ${color.primary};`}
  ${({ $type }) => $type === "warn" && css`background: #FFF5E6; color: ${color.accent};`}
`;
const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;
const Summary = styled.p`
  margin: 0;
  color: ${color.sub};
  font-size: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;
const MetaRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  color: ${color.sub}; font-size: 13px;
`;
const Meta = styled.span``;
const SeatLeft = styled.span`
  color: ${({ $danger }) => ($danger ? color.danger : color.sub)};
  font-size: 12px;
`;
const Price = styled.div`
  font-weight: 800;
`;
const Actions = styled.div` display: flex; justify-content: flex-end; `;
const LinkBtn = styled.button`
  height: 36px; padding: 0 12px; border-radius: 12px; border: 1px solid ${color.border};
  background: #fff; color: ${color.text}; font-weight: 700; cursor: pointer;
  &:hover { background: #fafafa; }
`;
const SkeletonCard = styled.div`
  height: 280px;
  border-radius: 18px;
  border: 1px solid ${color.border};
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
  @keyframes shimmer { 0% {transform: translateZ(0); background-position: 100% 0;} 100% { background-position: -100% 0; } }
`;
